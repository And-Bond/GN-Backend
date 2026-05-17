# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GN Backend** is a Node.js/TypeScript backend service built with Hapi.js framework, MongoDB, and integrations with Telegram Bot API and Planning Center Online (church service planning software). The application manages church-related data, schedules, and provides a Telegram bot for notifications and reminders.

## Build, Run, and Development Commands

### Installation
```bash
npm install
```

### Development Mode
```bash
npm start
```
Runs in development mode with:
- TypeScript compiler in watch mode (`tsc --watch`)
- Automatic HTML template copying from `/Templates` to `/dist/Templates`
- Nodemon for automatic server restart on file changes
- Loads environment variables from `.env` file

### Build for Production
```bash
npm run build
```
Compiles TypeScript and copies HTML templates to `/dist/` directory.

### Production Mode
```bash
npm run prod
```
Runs the application using PM2 runtime with dotenv/config preloading. Used for Railway deployment.

### Debug Mode
```bash
npm run debug
```
Same as development mode but with Node's inspector enabled on port 9229 for debugging.

### Linting
```bash
npx eslint . --ext .ts
```
Configuration file: `.eslintrc.cjs`
- Uses TypeScript ESLint parser and recommended rules
- Enforces single quotes and warns on unused variables
- Allows `any` type (disabled)

## Project Structure

```
GN-Backend/
├── Controllers/          # Request handlers (business logic)
├── Models/              # Mongoose schema definitions
├── Routes/              # Hapi route definitions and validation
├── Services/            # Data access layer (repository pattern)
├── Other/               # Utilities: auth, Telegram bot, cron jobs, constants
├── Templates/           # HTML templates for Handlebars rendering
├── types/               # TypeScript type definitions for external APIs
├── dist/                # Compiled JavaScript output
├── server.ts            # Main entry point
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Architecture & Design Patterns

### Layered Architecture
The application follows a three-layer MVC-inspired pattern:

1. **Routes** (presentation layer)
   - Define HTTP endpoints using Hapi.js framework
   - Handle request validation with Joi schema validation
   - Route files: `AccountRoute.ts`, `TelegramRoute.ts`, `ContactRoute.ts`, etc.
   - Include type definitions for request/response contracts

2. **Controllers** (business logic layer)
   - Process requests and orchestrate services
   - Handle error responses and data transformation
   - Located in `/Controllers/` with naming pattern `*Controller.ts`
   - Use utility functions from `Other/UniversalFunctions.ts` for standardized responses

3. **Services** (data access layer)
   - Interact directly with MongoDB models
   - Provide CRUD and aggregation operations
   - Located in `/Services/` with naming pattern `*Service.ts`
   - All services exported from `Services/index.ts`

### Request Flow Example
```
HTTP Request → Route (validation) → Controller (business logic) → Service (DB access) → Response
```

Example: `AccountRoute.ts` → `AccountController.ts` → `AccountService.ts` → `AccountModel.ts`

### Database & Mongoose
- **MongoDB** connection via Mongoose ODM
- Models define schemas with TypeScript interfaces (e.g., `IAccountModel`)
- Connection: `mongoose.connect(MONGODB_PATH)` in `server.ts`
- Services use Mongoose operations: `findById()`, `findOne()`, `create()`, `updateOne()`, `aggregate()`

### Validation
- **Joi** for schema validation in routes
- Extended with `joi-objectid` for MongoDB ObjectId validation
- Custom Joi instance created in `/joi.ts` with ObjectId support
- Validation errors handled by `UniversalFunctions.failAction()`

### Authentication
- **JWT (JSON Web Tokens)** via `hapi-auth-jwt2`
- Authentication registered in `Other/auth.ts`
- Token validation checks:
  1. Token exists in request
  2. Token is valid in `AuthTokenModel`
  3. Associated contact/admin exists in database
- Routes can require auth with `options: { auth: 'jwt' }`

## External Integrations

### Telegram Bot Integration
- **node-telegram-bot-api** for Telegram bot functionality
- Webhook-based approach (not polling)
- Bot initialization in `Other/TelegramBots.ts`
  - **Development**: Uses ngrok for exposing local server to Telegram
  - **Production**: Uses Railway public domain
- Message handlers registered in `Routes/TelegramRoute.ts` and `Services/TelegramBot.ts`
- Supports text messages and callback queries
- Key features:
  - `/reminder` command for scheduling notifications
  - Group/supergroup message filtering (ignores unless bot mentioned)
  - Thread ID support for Telegram topics

### Planning Center Online (PlanningCenterService)
- REST API client for church service planning
- Endpoints for:
  - Service types and plans
  - Songs, arrangements, and attachments
  - Team members and organization data
- Used by cron jobs to fetch Sunday service details
- Type definitions in `types/planning-center.ts`

### ProPresenter Integration
- Minimal integration in `Services/ProPresenterService.ts`
- Used for presentation software coordination

## Scheduled Tasks & Cron Jobs

Located in `Other/CronJob.ts` - runs every 15 minutes (`*/15 * * * *`):

- **Sunday Service Reminder** (type: `SUNDAY_SERVICE_REMINDER`)
  - Fetches upcoming Sunday service from Planning Center
  - Extracts songs and media team members
  - Renders HTML template with Handlebars
  - Sends formatted messages to subscribed Telegram chats
  - Reschedules next send time to next Thursday at 3 PM UTC

Schedules stored in MongoDB `ScheduleEventsModel` with fields:
- `nextSendAt`: When to send the next reminder
- `type`: Schedule type code
- `chatId`: Telegram chat ID
- `threadId`: Telegram topic/thread ID (optional)

## Response Format

All responses follow a standardized JSON structure via `Other/UniversalFunctions.ts`:

**Success:**
```json
{
  "success": true,
  "message": "Success",
  "data": { /* response data */ }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "data": { /* error details */ }
}
```

## Environment Variables

Required environment variables (see `.env`):
- `API_HOST`: Port (e.g., `8080`)
- `MONGODB_PATH`: MongoDB connection string
- `NODE_ENV`: `LOCAL` or `PROD`
- `JWT_SECRET`: Secret key for JWT signing
- `TELEGRAM_KEY`: Telegram bot API token
- `TELEGRAM_BOT_TOKEN_GN`: Bot token for GN bot
- `TELEGRAM_WEBHOOK_SECRET_TOKEN`: Webhook security token (required for PROD)
- `RAILWAY_PUBLIC_DOMAIN`: Public domain for webhook (Railway deployment URL)
- `PLANNING_CENTER_CLIENT_ID`: Planning Center API credentials
- `PLANNING_CENTER_SECRET_TOKEN`: Planning Center API credentials

## File Organization Notes

- **Models**: Only contain schema definitions; no business logic
- **Templates**: HTML files with Handlebars syntax for rendering (e.g., `SundayService.html`)
- **Constants**: Environment-specific and hardcoded values in `Other/constants.ts`
  - Telegram bot name varies by environment
  - Planning Center service IDs and team names
  - Whitelisted phone numbers
- **Types**: External API type definitions (Planning Center, ProPresenter)

## TypeScript Configuration

- Target: **ES2022**
- Module: **NodeNext** (ESM with CommonJS interop)
- Strict mode enabled
- Source maps enabled for debugging
- Path aliases not configured (absolute imports used)

## Deployment

Deployed to **Railway.app**:
- Build command: `npm run build`
- Start command: `npm run prod` (defined in `railpack.json`)
- Expects environment variables from Railway dashboard
- Uses PM2 runtime for process management
