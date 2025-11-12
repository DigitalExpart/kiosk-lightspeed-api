# Clover ↔ Lightspeed Bridge

A TypeScript backend service that receives real-time order events from a Clover Kiosk and forwards them to Lightspeed Retail via the REST API. The bridge validates Clover webhook signatures, maps order data into Lightspeed's sale format, and posts the sale using your Lightspeed credentials.

## Features

- **Express server** with security middleware (`helmet`, `cors`)
- **Zod-based environment validation** for type-safe configuration
- **Structured logging** with `pino` for observability
- **API services** for Clover and Lightspeed with automatic retry logic
- **Optional AWS SQS queue** integration for async order handling (`npm run worker`)
- **Comprehensive order mapper** that handles:
  - Line items with modifiers (included in price calculation)
  - Line-item and order-level discounts
  - Taxes and tips
  - Customer and payment information
- **Webhook endpoint** with signature validation and event type filtering
- **Duplicate order detection** to prevent processing the same order twice
- **Retry logic** with exponential backoff for transient API failures
- **Request logging middleware** for all HTTP requests
- **Enhanced health checks** with service connectivity status
- **Comprehensive error handling** with detailed error messages
- **TypeScript** with full type safety

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
   - `LIGHTSPEED_SHOP_ID`
   - **Either** `LIGHTSPEED_PERSONAL_TOKEN` **or** OAuth credentials:
     - `LIGHTSPEED_CLIENT_ID`
     - `LIGHTSPEED_CLIENT_SECRET`
     - `LIGHTSPEED_REFRESH_TOKEN`

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

## API Endpoints

### Webhook Endpoint

- `POST /webhooks/clover/orders`
  - Expects Clover's order webhook payload
  - Validates the `x-clover-signature` header against your webhook secret
  - Filters events to only process order-related types (`ORDER_CREATED`, `ORDER_UPDATED`, `ORDER`)
  - Checks for duplicate orders before processing
  - Fetches the latest order details from Clover (with retry logic)
  - Validates order has items and positive total
  - Maps the order to a Lightspeed sale format (handles modifiers, discounts, taxes)
  - Creates the sale in Lightspeed (with retry logic)
  - Returns `202 Accepted` on success

### Health Check Endpoints

- `GET /health` - Basic health check with uptime and service configuration status
- `GET /health/ready` - Readiness check that verifies all required services are configured

## Project Structure

- `src/index.ts`: Application entry point
- `src/server.ts`: Express app factory with middleware setup
- `src/config/env.ts`: Environment parsing/validation with Zod
- `src/routes/`: Health check and webhook routes
  - `health.ts`: Health and readiness endpoints
  - `webhooks.ts`: Clover webhook handler with validation
- `src/services/`: API clients and orchestration
  - `clover.service.ts`: Clover API client with retry logic
  - `lightspeed.service.ts`: Lightspeed API client with retry logic
  - `order-processor.service.ts`: Orchestrates order processing with validation
  - `order-queue.service.ts`: AWS SQS queue integration
- `src/mappers/order.mapper.ts`: Comprehensive Clover → Lightspeed order transformer
- `src/lib/`: Shared utilities
  - `logger.ts`: Structured logger instance (pino)
  - `retry.ts`: Retry logic with exponential backoff
  - `order-deduplicator.ts`: In-memory duplicate order detection
- `src/middleware/`: Express middleware
  - `error-handler.ts`: Centralized error handling
  - `request-logger.ts`: HTTP request logging
- `src/worker.ts`: Long-polling SQS worker that processes queued orders

## Key Features Explained

### Retry Logic
All API calls to Clover and Lightspeed automatically retry on transient failures (network errors, 5xx status codes, rate limits). Uses exponential backoff with configurable attempts (default: 3 attempts).

### Duplicate Order Detection
In-memory cache prevents processing the same order ID twice within a 24-hour window. Orders are marked as processed only after successful creation in Lightspeed. For distributed systems, consider using Redis or a database instead.

### Order Mapping
The mapper comprehensively handles:
- **Modifiers**: Added to line item price with descriptive notes
- **Discounts**: Both line-item and order-level discounts mapped to Lightspeed format
- **Taxes & Tips**: Properly included in the sale payload
- **Metadata**: Order ID, creation timestamp, and other context preserved

### Error Handling
- Detailed error messages with context
- Proper HTTP status codes
- Structured error logging
- Validation errors returned as 400 Bad Request
- API errors logged with full context for debugging

### Lightspeed OAuth Support

The service supports both **personal tokens** and **OAuth authentication** for Lightspeed:

#### OAuth Mode (Recommended for Production)
When OAuth credentials are provided (`LIGHTSPEED_CLIENT_ID`, `LIGHTSPEED_CLIENT_SECRET`, `LIGHTSPEED_REFRESH_TOKEN`), the service:
- **Automatically refreshes** access tokens using refresh tokens
- **Caches tokens** in memory and refreshes 1 minute before expiration
- **Handles 401 errors** by automatically refreshing the token and retrying the request
- **Prevents concurrent refreshes** by queuing requests during token refresh
- **Updates refresh tokens** when Lightspeed provides a new one
- **Uses retry logic** for token refresh API calls

#### Personal Token Mode (Fallback)
If OAuth credentials are not provided, the service uses `LIGHTSPEED_PERSONAL_TOKEN`:
- Simpler setup for development/testing
- No automatic token refresh (tokens don't expire)
- Less secure for production use

**Note**: OAuth is preferred for production as it provides better security and automatic token management.

## Docker Deployment

### Build and Run with Docker

```bash
# Build the image
docker build -t clover-lightspeed-bridge .

# Run the container
docker run -p 4000:4000 --env-file .env clover-lightspeed-bridge
```

### Using Docker Compose

```bash
# Start the application
docker-compose up -d

# Start with worker (for async processing)
docker-compose --profile worker up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The `docker-compose.yml` includes:
- Main application service
- Optional worker service (use `--profile worker`)
- Health checks
- Automatic restart on failure

## Next Steps

- ✅ ~~Expand the mapper to cover modifiers, discounts, and taxes comprehensively~~ (Completed)
- ✅ ~~Add rate limiting middleware for webhook endpoints~~ (Completed)
- ✅ ~~Add Docker support for containerized deployment~~ (Completed)
- ✅ ~~Implement Lightspeed OAuth flow (instead of personal token) for long-term credentials~~ (Completed)
- Consider Redis-based duplicate detection for distributed deployments

## Deployment Notes

- Designed to run in a serverless function or containerized microservice
- Store secrets in a managed vault (e.g., AWS Secrets Manager)
- Configure HTTPS termination and allowlist Clover webhook IP ranges
