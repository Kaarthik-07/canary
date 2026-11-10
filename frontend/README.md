# Canary Shop Frontend

React + TypeScript + Vite storefront for the existing Canary Shop Spring Boot API.

## Requirements
- Node.js 20.19+ or 22.12+
- Backend running at `http://localhost:8080` (or set `VITE_API_BASE_URL`)

## Run
```bash
cp .env.example .env
npm install
npm run dev
```
Open http://localhost:5173.

## Checks
```bash
npm run typecheck
npm run build
npm run preview
```

## API mapping

| Screen / action | Endpoint |
|---|---|
| Register | `POST /api/auth/register` |
| Login | `POST /api/auth/login` |
| Restore session | `GET /api/auth/me` |
| Product listing | `GET /api/products` |
| Product detail | `GET /api/products/{id}` |
| Load cart | `GET /api/cart` |
| Add cart item | `POST /api/cart/items` |
| Set cart quantity | `PATCH /api/cart/items/{itemId}` |
| Remove cart item | `DELETE /api/cart/items/{itemId}` |
| Place order | `POST /api/checkout` |
| Order history | `GET /api/orders` |
| Order detail | `GET /api/orders/{id}` |
| Optional connectivity check | `GET /actuator/health` |

Admin product endpoints are intentionally not used by this UI.

## Important behavior
- The server is the source of truth for prices, line subtotals, totals, availability and cohort.
- The frontend never submits a cohort or computes money values.
- Every successful cart mutation replaces the complete cart response.
- A protected-request 401 clears the session; login 401 is treated as invalid credentials.
- Checkout submission is guarded against repeated clicks. A 409 refreshes the cart and directs the user to orders.
- The `featureEnabled` value from `/api/auth/me` or login selects the checkout experience. `CheckoutNew` is intentionally a placeholder.
- Session tokens are stored in localStorage as requested by the API brief. Use HTTPS in production and consider a same-site HttpOnly cookie design for a higher-security deployment.

## Local network note
If testing on a phone, `localhost` points to the phone, not your development machine. Set `VITE_API_BASE_URL` to your machine's LAN IP and configure backend CORS for the frontend origin.
