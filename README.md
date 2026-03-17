# AI Process Automation System

A full-stack workflow automation platform that ingests messages from multiple sources, classifies them with AI, extracts structured data, routes each message into the correct business workflow, assigns it to an operator, generates a reply, and logs every step — all observable through a React dashboard.

Built as a portfolio project targeting **Automation Engineer**, **Automation Support Engineer**, **AI Workflow Engineer**, and **RPA-style operational roles**.

> **Demo dataset** is localized to a Brazilian telecom / technology / media / community platform context — including newsletter operations, partnership leads, sponsorship inquiries, podcast collaboration, and community support workflows. Sample operators and scenarios use Brazilian names and cities (São Paulo, Rio de Janeiro, Brasília, Campinas, Curitiba, etc.).

---

## Why this project is relevant

| Role | What this project demonstrates |
|------|-------------------------------|
| Automation Engineer | Multi-step pipeline: trigger → classify → extract → validate → route → action → log |
| Automation Support Engineer | Retry system, error state tracking, manual override, per-message audit log |
| AI Workflow Engineer | LLM integration (GPT-4o-mini), structured output, retry on failure, heuristic fallback |
| RPA / Low-code Engineer | Gmail IMAP polling, webhook ingestion, multi-source message handling, round-robin assignment |

---

## Architecture overview

```
┌──────────────────────────────────────────────────────────┐
│                     INGESTION LAYER                       │
│  Dashboard form │ REST API / Webhook │ Gmail IMAP polling │
└───────────────────────────┬──────────────────────────────┘
                            │
                   workflowService.js
                            │
          ┌─────────────────▼──────────────────┐
          │           WORKFLOW PIPELINE         │
          │  1. Store raw message               │
          │  2. Classify  (AI → fallback)        │
          │  3. Extract   (AI → retry → fallback)│
          │  4. Validate  (Zod schema)           │
          │  5. Route     (order/support/query)  │
          │  6. Assign    (round-robin operator) │
          │  7. Create entity (DB record)        │
          │  8. Generate reply (AI → fallback)   │
          │  9. Send email  (Gmail SMTP)         │
          │ 10. Log every step                  │
          └─────────────────┬──────────────────┘
                            │
                     SQLite Database
                            │
                    Express REST API
                            │
                     React Dashboard
```

---

## Workflow engine detail

```
trigger
  └─ classify        → order | support | query | other
       └─ extract    → structured JSON (customerName, phone, city, email, org…)
            └─ validate    → Zod schema check
                 └─ assign      → round-robin to role-matched operator
                      └─ create entity  → orders / support_tickets / query_cases
                           └─ reply     → AI-generated or template fallback
                                └─ send email  → SMTP (Gmail source only)
                                     └─ log    → every step recorded
```

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express |
| Database | SQLite (better-sqlite3) |
| AI | OpenAI GPT-4o-mini |
| Email (IMAP) | ImapFlow |
| Email (SMTP) | Nodemailer |
| Validation | Zod |
| Frontend | React 18, Vite |
| Python utility | Python 3 (tools/normalize_data.py) |

---

## Project structure

```
ai-process-automation-system-gmail/
├── README.md
├── tools/
│   └── normalize_data.py          # Python data normalization utility
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js              # Entry point (port 4000)
│       ├── app.js                 # Express + routes setup
│       ├── config/env.js          # All environment variables
│       ├── db/
│       │   ├── database.js        # SQLite connection (WAL mode)
│       │   └── initDb.js          # Schema + triggers + indexes
│       ├── services/
│       │   ├── workflowService.js # Main orchestration (all 10 pipeline steps)
│       │   ├── aiService.js       # GPT-4o-mini + fallback logic
│       │   ├── messageService.js  # Message CRUD
│       │   ├── orderService.js    # Commercial lead records
│       │   ├── supportService.js  # Support ticket records
│       │   ├── queryService.js    # Query/inquiry case records
│       │   ├── assignmentService.js # Round-robin role-based assignment
│       │   ├── emailService.js    # SMTP reply sending
│       │   ├── gmailFetchService.js # IMAP polling + deduplication
│       │   ├── logService.js      # Step-by-step audit logging
│       │   ├── dashboardService.js # Aggregated metrics
│       │   └── userService.js     # Operator CRUD
│       ├── controllers/           # Thin HTTP handlers (9 files)
│       ├── routes/                # Express routers (10 files)
│       ├── prompts/
│       │   ├── classificationPrompt.js
│       │   ├── extractionPrompt.js
│       │   └── responsePrompt.js
│       ├── utils/
│       │   ├── validators.js      # Zod schemas
│       │   ├── heuristics.js      # Rule-based fallback NLP
│       │   └── json.js            # Safe JSON parsing
│       ├── middleware/
│       │   └── errorHandler.js
│       └── seed/
│           ├── seed.js            # Demo data loader
│           ├── demoMessages.js    # 15 realistic Brazilian scenarios
│           └── resetDb.js         # DB wipe utility
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx                # Main component + state
        ├── services/api.js        # All API calls
        ├── pages/                 # 6 page components
        ├── components/            # StatCard, StatusBadge, JsonEditorModal…
        ├── utils/format.js
        └── styles/index.css
```

---

## Setup instructions

### Prerequisites

- Node.js 18+ (required for top-level `await` in seed script)
- npm
- Python 3.8+ (optional — for `tools/normalize_data.py`)
- A Gmail account with an **App Password** (optional — for Gmail integration)
- An OpenAI API key (optional — heuristic fallbacks work without it)

---

### 1. Clone / open the project

```bash
cd "ai-process-automation-system-gmail"
```

---

### 2. Backend setup

```bash
cd backend
npm install
```

Copy the environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values (see [Environment variables](#environment-variables) below).

**Minimum required to run without Gmail or AI:**
```
PORT=4000
CLIENT_URL=http://localhost:5173
ENABLE_AI=false
ENABLE_GMAIL_POLLING=false
```

---

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

Copy the environment file:

```bash
cp .env.example .env
```

The default `VITE_API_URL=http://localhost:4000` works without changes.

---

### 4. Database setup

The SQLite database is created automatically on first run. No manual setup needed.

The `data/` directory and `automation.db` file are created by the backend at startup.

---

### 5. Seed demo data (optional)

To pre-populate the system with 15 realistic Brazilian telecom/media scenarios:

```bash
cd backend
npm run seed
```

This creates 5 mock operators and processes all 15 demo messages through the full pipeline.

To reset the database and start fresh:

```bash
npm run reset-db
npm run seed
```

---

### 6. Run the backend

```bash
cd backend
npm run dev       # development (auto-restart with --watch)
# or
npm start         # production
```

The API will be available at `http://localhost:4000`.

Health check: `GET http://localhost:4000/health`

---

### 7. Run the frontend

```bash
cd frontend
npm run dev
```

The dashboard will be available at `http://localhost:5173`.

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | API server port |
| `NODE_ENV` | `development` | Environment |
| `CLIENT_URL` | `http://localhost:5173` | Frontend origin for CORS |
| `OPENAI_API_KEY` | *(empty)* | OpenAI key — leave empty to use heuristic fallbacks |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model to use |
| `DB_PATH` | `./data/automation.db` | SQLite file path |
| `ENABLE_AI` | `true` | Set to `false` to force heuristic-only mode |
| `EMAIL_USER` | *(empty)* | Gmail address (e.g. `you@gmail.com`) |
| `EMAIL_PASS` | *(empty)* | Gmail App Password (not your regular password) |
| `IMAP_HOST` | `imap.gmail.com` | IMAP server |
| `IMAP_PORT` | `993` | IMAP port |
| `IMAP_SECURE` | `true` | Use TLS |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server |
| `SMTP_PORT` | `465` | SMTP port |
| `SMTP_SECURE` | `true` | Use TLS |
| `GMAIL_POLL_INTERVAL_MS` | `60000` | Polling interval in milliseconds |
| `ENABLE_GMAIL_POLLING` | `false` | Set to `true` to activate IMAP polling |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:4000` | Backend base URL |

---

## Gmail setup and testing

### Create a Gmail App Password

1. Go to your Google Account → Security → 2-Step Verification (must be enabled)
2. At the bottom: **App passwords**
3. Create a new App Password for **Mail / Other (custom name)**
4. Copy the 16-character password

### Configure `.env`

```
EMAIL_USER=youraddress@gmail.com
EMAIL_PASS=abcdefghijklmnop
ENABLE_GMAIL_POLLING=true
GMAIL_POLL_INTERVAL_MS=60000
```

### How Gmail flow works

1. Every 60 seconds (configurable), the system connects to Gmail via IMAP
2. It fetches all **unread** emails from INBOX
3. Each email is saved as a message with `source = gmail`
4. The full workflow pipeline runs (classify → extract → assign → reply)
5. An AI-generated reply is sent back to the sender via SMTP
6. The email is marked as **read** to prevent duplicate processing
7. The message ID is stored as `external_id` for deduplication on future polls

### Test Gmail flow

- Send a test email to the configured Gmail address from another account
- Wait up to 60 seconds, or click **"Buscar Gmail Agora"** on the dashboard
- Check the Messages tab — the email should appear with `source=gmail`
- The sender should receive an AI-generated reply

### Disable Gmail polling

Set `ENABLE_GMAIL_POLLING=false` in `.env`. You can still trigger a manual fetch from the dashboard or via:

```bash
curl -X POST http://localhost:4000/api/gmail/fetch-now
```

---

## API endpoint summary

### Messages
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/messages` | Submit and process a new message |
| `GET` | `/api/messages` | List messages (filters: `source`, `classification`, `processingState`) |
| `POST` | `/api/messages/retry/:id` | Retry full workflow for a message |
| `POST` | `/api/messages/:id/retry-reply` | Retry email reply only |
| `PUT` | `/api/messages/:id/extracted-data` | Override extracted data and re-run |

### Commercial Leads (Orders)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/orders` | List leads (filter: `status`) |
| `PUT` | `/api/orders/:id/status` | Update lead status |

### Support Tickets
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/support-tickets` | List support tickets |
| `PUT` | `/api/support-tickets/:id/status` | Update ticket status |

### Query / Inquiry Cases
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/query-cases` | List query cases (filter: `status`) |
| `PUT` | `/api/query-cases/:id/status` | Update query status |

### Logs
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/logs` | Recent automation logs (last 200 entries) |

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/dashboard/stats` | Aggregate metrics |

### Gmail
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/gmail/status` | Gmail polling status |
| `POST` | `/api/gmail/fetch-now` | Trigger immediate Gmail fetch |

### Webhook / External ingestion
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/webhook/incoming-message` | Ingest message from external system |

### Health
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service health check |

---

## Retry and manual override

### Retry a failed workflow

If a message fails (AI error, DB error, or processing exception), the system:
- Sets `processing_state = failed`
- Records the error in `automation_logs`
- Shows a **Retry fluxo** button in the Messages tab

```bash
POST /api/messages/retry/42
```

This increments `retry_count`, resets state to `queued`, and re-runs the full pipeline.

### Retry a failed email reply

If the workflow succeeded but the Gmail reply failed:

```bash
POST /api/messages/42/retry-reply
```

This retries only the email delivery step.

### Manual override

If the AI extracted wrong data:

1. Open the **Messages** tab
2. Click **Override** on any message
3. Edit the extracted JSON in the modal
4. Click **Save & Re-run**

The corrected data is saved and the workflow re-runs using your manual values (skipping AI extraction).

---

## Example test messages

Paste these in the **Enviar Mensagem** form to test each workflow type:

**Commercial lead:**
```
Olá, meu nome é Lucas Almeida. Gostaria de conversar sobre uma parceria de
conteúdo com foco em 5G e infraestrutura. Empresa: ConectaHub.
Cidade: São Paulo. Telefone: +55 11 98888-1111.
```

**Support ticket:**
```
Preciso de ajuda: não estou recebendo a newsletter há duas semanas.
Já verifiquei minha caixa de spam. Meu email é felipe.costa@gmail.com.
```

**Query / information request:**
```
Bom dia! Quero saber como participar da comunidade no WhatsApp e receber
os próximos eventos do setor telecom em Campinas.
```

**Webhook ingestion (curl):**
```bash
curl -X POST http://localhost:4000/api/webhook/incoming-message \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Boa tarde! Falo em nome da FiberWave. Temos interesse em patrocinar a newsletter.",
    "source": "api",
    "emailSender": "comercial@fiberwave.com.br",
    "emailSubject": "Proposta de patrocínio"
  }'
```

---

## Python utility

The `tools/normalize_data.py` script normalizes extracted field data.

**Run demo:**
```bash
python3 tools/normalize_data.py --demo
```

**Normalize a JSON string:**
```bash
python3 tools/normalize_data.py '{"customerName": "lucas almeida", "phone": "11 98888-1111", "city": "sao paulo"}'
```

**Normalize a JSON file:**
```bash
python3 tools/normalize_data.py --file extracted_data.json
```

**What it normalizes:**
- Phone numbers → `+55 (DDD) NNNNN-NNNN`
- Brazilian city names → canonical accented form (handles `sp`, `bsb`, `sao paulo`, `cwb`, etc.)
- Person names → proper capitalization with Brazilian particles (`de`, `da`, `dos`)
- Email addresses → lowercase, validates format
- String fields → trims whitespace, null-coalesces empty strings

---

## Database models

| Table | Purpose |
|-------|---------|
| `users` | Operators (account-manager, support-operator, community-manager) |
| `messages` | All incoming messages with full state tracking |
| `assignments` | Operator-to-message assignment history |
| `orders` | Commercial lead records (from order workflow) |
| `support_tickets` | Support issue records |
| `query_cases` | Inquiry/information case records |
| `automation_logs` | Step-by-step audit trail for every message |

### Message state transitions

```
processing_state: queued → processing → completed | failed | manual-review
reply_status:     not_applicable | queued | sent | failed
workflow_status:  pending → order | support | query | other
```

---

## Operators and roles

| Role | Assigned to |
|------|------------|
| `account-manager` | Commercial leads (order workflow) |
| `support-operator` | Support tickets and query fallback |
| `community-manager` | Query/inquiry cases, events, community |

Assignment is round-robin: the operator with the fewest existing assignments in the matched role group is selected.

---

## AI fallback strategy

The system works **fully without an OpenAI key**:

```
AI available?
  YES → GPT-4o-mini call
         ├─ Success → use AI result
         └─ Fail    → retry once with simplified prompt
                       ├─ Success → use AI result
                       └─ Fail    → use heuristic fallback

  NO  → use heuristic fallback directly
```

Heuristics use keyword matching for Brazilian Portuguese business vocabulary. All replies fall back to pre-written templates in Portuguese (Brazil).

---

## Future improvements

- Authentication for the dashboard (JWT or session)
- WhatsApp Business API integration
- n8n / Zapier webhook connector
- Prometheus metrics endpoint
- Rate limiting middleware
- Full-text search with SQLite FTS5
- HTML email templates with Nodemailer
- CSV/Excel export for leads
- Slack/Teams notification on high-priority tickets

---

## License

MIT — free to use, modify, and deploy.
