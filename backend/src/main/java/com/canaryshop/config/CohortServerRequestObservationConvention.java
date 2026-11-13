
package com.canaryshop.config;

import io.micrometer.common.KeyValue;
import io.micrometer.common.KeyValues;
import org.springframework.http.server.observation.DefaultServerRequestObservationConvention;
import org.springframework.http.server.observation.ServerRequestObservationContext;
import org.springframework.stereotype.Component;

@Component
public class CohortServerRequestObservationConvention
        extends DefaultServerRequestObservationConvention {

    private static final String COHORT_HEADER = "X-Canary-Cohort";

    @Override
    public KeyValues getLowCardinalityKeyValues(
            ServerRequestObservationContext context) {

        String cohort = "UNKNOWN";

        if (context.getCarrier() != null) {
            String header = context.getCarrier().getHeader(COHORT_HEADER);

            if ("CANARY".equalsIgnoreCase(header)) {
                cohort = "CANARY";
            } else if ("CONTROL".equalsIgnoreCase(header)) {
                cohort = "CONTROL";
            }
        }

        return super.getLowCardinalityKeyValues(context)
                .and(KeyValue.of("cohort", cohort));
    }
}
