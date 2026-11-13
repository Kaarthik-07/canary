#!/bin/sh
set -eu

PROMETHEUS_URL="http://monitoring-kube-prometheus-prometheus.monitoring.svc.cluster.local:9090"
NAMESPACE="default"

echo "Checking Prometheus for rollback alerts..."

ALERTS=$(curl -fsS "$PROMETHEUS_URL/api/v1/alerts")

ROLLBACK_REQUIRED=$(printf '%s' "$ALERTS" | jq -r '
  [.data.alerts[]
   | select(.state == "firing" and .labels.rollback == "true")]
  | length
')

if [ "$ROLLBACK_REQUIRED" -eq 0 ]; then
    echo "No firing rollback alerts. Nothing to do."
    exit 0
fi

echo "Firing rollback alert detected."

CURRENT_CONFIG=$(kubectl get configmap cohort-router-config \
    -n "$NAMESPACE" \
    -o jsonpath='{.data.nginx\.conf}')

if ! printf '%s' "$CURRENT_CONFIG" | grep -q 'frontend_canary'; then
    echo "Router is already in stable-only mode."
    exit 0
fi

cat > /tmp/nginx.conf <<'NGINX'
map "$cookie_cohort:$arg_user" $cohort {
    default CONTROL;
}

map $cohort $frontend_upstream {
    CONTROL frontend_stable;
}

upstream frontend_stable {
    server frontend-stable-service.default.svc.cluster.local:80;
}

upstream backend {
    server backend-service.default.svc.cluster.local:8080;
}

server {
    listen 80;
    server_name _;

    add_header X-Canary-Cohort CONTROL always;
    add_header Set-Cookie "cohort=CONTROL; Path=/; SameSite=Lax; HttpOnly" always;

    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Canary-Cohort CONTROL;
    }

    location /actuator/ {
        proxy_pass http://backend;
    }

    location / {
        proxy_pass http://frontend_stable;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

PATCH=$(jq -n --rawfile conf /tmp/nginx.conf \
    '{data: {"nginx.conf": $conf}}')

kubectl patch configmap cohort-router-config \
    -n "$NAMESPACE" \
    --type merge \
    -p "$PATCH"

echo "Router ConfigMap updated."

kubectl rollout restart deployment/cohort-router -n "$NAMESPACE"

echo "Waiting for router rollout..."

i=0
while [ "$i" -lt 60 ]; do
    STATE=$(kubectl get deployment cohort-router \
        -n "$NAMESPACE" \
        -o jsonpath='{.metadata.generation}:{.status.observedGeneration}:{.status.updatedReplicas}:{.status.readyReplicas}')

    EXPECTED=$(kubectl get deployment cohort-router \
        -n "$NAMESPACE" \
        -o jsonpath='{.spec.replicas}')

    GENERATION=$(echo "$STATE" | cut -d: -f1)
    OBSERVED=$(echo "$STATE" | cut -d: -f2)
    UPDATED=$(echo "$STATE" | cut -d: -f3)
    READY=$(echo "$STATE" | cut -d: -f4)

    if [ "$OBSERVED" = "$GENERATION" ] &&
       [ "$UPDATED" = "$EXPECTED" ] &&
       [ "$READY" = "$EXPECTED" ]; then
        echo "Router rollout completed."
        echo "ROLLBACK COMPLETED: traffic is routed to stable."
        exit 0
    fi

    sleep 2
    i=$((i + 1))
done

echo "ERROR: Router rollout did not complete within 120 seconds."
exit 1
