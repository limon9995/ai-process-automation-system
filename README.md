# AI Process Automation System

## Overview
AI Process Automation System is a full-stack workflow automation platform that ingests incoming messages from multiple sources (Dashboard, API, Gmail), uses AI to classify and extract structured data, and routes them into business workflows such as support, inquiry, and lead handling.

This project simulates real-world automation platforms used by Automation Engineers, Automation Support Engineers, and AI Workflow Engineers.

## Key Features
- Multi-source message ingestion (Dashboard, API, Gmail)
- AI-based classification (`support`, `query`, `order`, `other`)
- Structured data extraction from unstructured text
- Workflow engine (trigger -> classify -> extract -> validate -> route -> action -> log)
- Retry mechanism for failed workflows and failed replies
- Manual override and reprocessing from dashboard
- Round-robin operator assignment (role-based)
- Gmail auto-fetch + processing + reply flow
- Webhook/API trigger support
- Dashboard with filters, metrics, statuses, and logs

## Architecture

```text
Incoming Message
  -> AI Processing (classification + extraction)
  -> Workflow Engine
  -> Business Action (order/support/query)
  -> Assignment + Reply
  -> Logs + Dashboard
```

## Tech Stack
- Backend: Node.js, Express
- Frontend: React + Vite
- Database: SQLite (`better-sqlite3`)
- AI: OpenAI API
- Email Integration: Gmail IMAP + SMTP
- Validation: Zod
- Utility Scripts: Python

## Supported Inputs
- Dashboard form input
- REST API endpoint
- Webhook endpoint
- Gmail inbox polling

## Workflow Example
1. Message received
2. AI classifies message type
3. AI extracts structured JSON
4. Data is validated
5. Message is routed to the correct workflow
6. Business action is executed
7. Logs are recorded and visible in dashboard

## Sample Use Cases
- Partnership inquiry from Gmail
- Podcast collaboration request
- Sponsorship/lead intake
- Telecom/media-related query handling
- Customer support ticket handling

## Retry and Error Handling
- Automatic retry on extraction failures
- Manual retry from dashboard
- Failed reply retry endpoint
- Full step-by-step audit logging
- Heuristic fallback when AI output is invalid/unavailable

## Dashboard Highlights
- View all incoming messages
- Inspect processing and error logs
- Track workflow statuses
- Retry failed workflows
- Edit extracted JSON and rerun pipeline
- Update order/support/query statuses

## Screenshots

### Main Dashboard
![Dashboard](./screenshots/dashboard.png)

### Logs View
![Logs](./screenshots/logs.png)

### Orders View
![Orders](./screenshots/orders.png)

### Gmail Flow
![Gmail Flow](./screenshots/gmail-flow.png)

## Setup Instructions

### 1) Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2) Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 3) Optional Seed Data
```bash
cd backend
npm run seed
```

## Environment Variables
Create `backend/.env`:

```env
PORT=4000
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini
ENABLE_AI=true

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_SECURE=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
ENABLE_GMAIL_POLLING=true
GMAIL_POLL_INTERVAL_MS=60000
```

## Gmail Testing
1. Configure Gmail credentials in `backend/.env`
2. Start backend + frontend
3. Send test email to configured inbox
4. Trigger **Search Gmail Now** from dashboard (or wait for polling)
5. Verify message, route, and logs

## Why This Project Matters
This project demonstrates:
- End-to-end workflow automation design
- AI-powered classification and extraction
- Error handling, retries, and fallback logic
- Observability through logs and dashboard metrics
- External integrations (Gmail + API + webhook)
- Real-world Automation Support Engineer workflow patterns

## Author
- GitHub: [limon9995](https://github.com/limon9995)
