# Clover ↔ Lightspeed Bridge

A TypeScript backend service that receives real-time order events from a Clover Kiosk and forwards them to Lightspeed Retail via the REST API. The bridge validates Clover webhook signatures, maps order data into Lightspeed's sale format, and posts the sale using your Lightspeed credentials.

## Features

- Express server with security middleware (`helmet`, `cors`)
- Zod-based environment validation
- Structured logging with `pino`
- Services for interacting with Clover and Lightspeed APIs
- Optional AWS SQS queue integration for async order handling (`npm run worker`)
- Order mapper to translate Clover line items into Lightspeed sale payloads
- Webhook endpoint scaffolded for Clover order notifications
- TypeScript build + lint scripts

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env` and populate with your credentials:

   ```bash
   cp .env.example .env
   ```

   Required values for development:

   - `CLOVER_MERCHANT_ID`
   - `CLOVER_ACCESS_TOKEN`
   - `CLOVER_WEBHOOK_SECRET` (or `WEBHOOK_SIGNATURE_SECRET`)
   - `LIGHTSPEED_ACCOUNT_ID`
   - `LIGHTSPEED_PERSONAL_TOKEN`
   - `LIGHTSPEED_SHOP_ID`

   **Optional for asynchronous processing**

   - `QUEUE_URL`
   - `AWS_REGION`

   **Optional identifiers for Lightspeed context**

   - `LIGHTSPEED_EMPLOYEE_ID`
   - `LIGHTSPEED_REGISTER_ID`

3. **Run in development mode**

   ```bash
   npm run dev
   ```

4. **Build for production**

   ```bash
   npm run build
   ```

5. **Start compiled build**

   ```bash
   npm start
   ```

6. **Run the queue worker (optional)**

   Requires `QUEUE_URL` and `AWS_REGION` to be configured.

   ```bash
   npm run worker
   ```

## Webhook Endpoint

- `POST /webhooks/clover/orders`
  - Expects Clover's order webhook payload
  - Validates the `x-clover-signature` header against your webhook secret
  - Fetches the latest order details from Clover
  - Maps the order to a Lightspeed sale and creates it via the Lightspeed API

## Project Structure

- `src/index.ts`: Application entry point
- `src/server.ts`: Express app factory
- `src/config/env.ts`: Environment parsing/validation
- `src/routes/`: Health check and webhook routes
- `src/services/`: API clients for Clover, Lightspeed, optional SQS queue, and orchestration
- `src/mappers/order.mapper.ts`: Clover → Lightspeed order transformer
- `src/lib/logger.ts`: Shared logger instance
- `src/middleware/error-handler.ts`: Centralized error handling
- `src/worker.ts`: Long-polling SQS worker that processes queued orders

## Next Steps

- Expand the mapper to cover modifiers, discounts, and taxes comprehensively
- Implement Lightspeed OAuth flow (instead of personal token) for long-term credentials

## Deployment Notes

- Designed to run in a serverless function or containerized microservice
- Store secrets in a managed vault (e.g., AWS Secrets Manager)
- Configure HTTPS termination and allowlist Clover webhook IP ranges
