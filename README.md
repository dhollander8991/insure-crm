# InsureCRM

A production-grade insurance CRM platform built for Israeli insurance agents. The system comprises four Java Spring Boot microservices (auth, customer, policy, and AI), a React TypeScript web application, a React Native mobile app, and a Claude-powered AI assistant that answers natural-language questions about customers and policies using real-time tool calling against live CRM data.

## Live Demo

- 🌐 Web: https://insurecrm-navy.vercel.app
- 📱 Mobile: React Native (Expo) — run locally
- 🔗 GitHub: https://github.com/dhollander8991/insure-crm

---

## Architecture

```
┌─────────────────────────┐     ┌──────────────────────────┐
│  React Frontend (Vercel) │     │  React Native Mobile App  │
└────────────┬────────────┘     └────────────┬─────────────┘
             │ via Vercel Proxy               │ direct
             ▼                               ▼
     ┌───────────────┐          ┌────────────────────────────────────────────┐
     │  API Gateway  │          │               AWS EC2 (Docker)             │
     │ (Vercel Proxy)│          │                                            │
     └───────┬───────┘          │  ┌──────────────┐  ┌──────────────┐       │
             │                  │  │ auth-service │  │customer-svc  │       │
             └──────────────────┼─►│  port 8081   │  │  port 8082   │       │
                                │  └──────┬───────┘  └──────┬───────┘       │
                                │         │ PostgreSQL       │ PostgreSQL     │
                                │         ▼                  ▼               │
                                │  ┌──────────────┐  ┌──────────────┐       │
                                │  │  auth-db     │  │ customer-db  │       │
                                │  └──────────────┘  └──────────────┘       │
                                │                                            │
                                │  ┌──────────────┐  ┌──────────────┐       │
                                │  │ policy-svc   │  │  ai-service  │       │
                                │  │  port 8083   │  │  port 8084   │       │
                                │  └──────┬───────┘  └──────┬───────┘       │
                                │         │ PostgreSQL       │               │
                                │         ▼                  │               │
                                │  ┌──────────────┐          │               │
                                │  │  policy-db   │   ┌──────▼──────────┐   │
                                │  └──────────────┘   │   Claude API    │   │
                                │                      │ (claude-sonnet) │   │
                                │                      └─────────────────┘   │
                                └────────────────────────────────────────────┘
```

---

## Services

### auth-service · port 8081

Handles identity and access. Issues JWTs signed with a shared secret that all other services verify independently — no per-request calls back to auth.

- JWT register/login with BCrypt password hashing
- Role-based access: `AGENT`, `MANAGER`
- Stateless authentication shared across all services

### customer-service · port 8082

Owns the policyholder domain. Built for the Israeli market with locale-specific validation.

- Full CRUD for insurance policyholders
- Israeli phone format (`05X-XXXXXXX`) and 9-digit ID validation
- Agent-based customer filtering
- Seed data: 5 realistic Israeli customers

### policy-service · port 8083

Owns the policy domain. Communicates with customer-service via REST to validate that a customer exists before a policy can be created — no cross-DB joins.

- Full CRUD for insurance policies (`CAR`, `APARTMENT`, `LIFE`, `HEALTH`)
- Inter-service validation: calls customer-service on policy creation
- Auto-generated policy numbers (`POL-XXXXX`)
- Denormalized `customerName` to avoid a network call on every policy read
- Seed data: 10 realistic policies

### ai-service · port 8084

Gives agents a natural-language interface to the entire CRM. The AI has real-time access to customer and policy data through registered tools — it calls live APIs rather than searching stale embeddings.

- Claude `claude-sonnet-4-5` via LangChain4j
- Tool calling: AI has real-time read access to all CRM APIs
- Conversation memory (`MessageWindowChatMemory`)
- Bilingual: responds in Hebrew or English based on user input
- Extensible for RAG with pgvector

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3.4.x, Spring Security, Spring Data JPA |
| Database | PostgreSQL 16 (one per service) |
| AI | LangChain4j, Claude `claude-sonnet-4-5`, Tool calling |
| Frontend | React 18, TypeScript, React Router v6, TanStack Query, Tailwind CSS, shadcn/ui |
| Mobile | React Native, Expo, Expo Router, expo-secure-store |
| Infrastructure | Docker, docker-compose, AWS EC2, AWS ECR |
| CI/CD | GitHub Actions |
| Hosting | Vercel (frontend), AWS EC2 (backend) |
| Testing | JUnit 5, Mockito, MockMvc, Vitest, React Testing Library, Cypress, TestCafe |

---

## Getting Started

### Prerequisites

- Java 21
- Docker Desktop
- Node.js 18+
- Expo CLI (for mobile)

### Run everything locally

```bash
git clone https://github.com/dhollander8991/insure-crm
cd insure-crm
docker-compose up
```

All 4 services and 3 PostgreSQL databases start automatically. Services are pre-seeded with demo data.

**Default credentials:** `agent@insure.com` / `secret123`

### Run frontend

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

### Run mobile

```bash
cd mobile
npx expo run:ios   # requires Xcode
npx expo start     # scan QR with Expo Go
```

---

## API Reference

### auth-service

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new agent |
| POST | `/auth/login` | Login, returns JWT |

### customer-service · requires JWT

| Method | Endpoint | Description |
|---|---|---|
| GET | `/customers` | List all customers |
| GET | `/customers/:id` | Get customer by ID |
| GET | `/customers/agent/:email` | Get customers by agent |
| POST | `/customers` | Create customer |
| PUT | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Delete customer |

### policy-service · requires JWT

| Method | Endpoint | Description |
|---|---|---|
| GET | `/policies` | List all policies |
| GET | `/policies/:id` | Get policy by ID |
| GET | `/policies/customer/:id` | Get by customer |
| GET | `/policies/agent/:email` | Get by agent |
| GET | `/policies/status/:status` | Get by status |
| POST | `/policies` | Create policy |
| PUT | `/policies/:id` | Update policy |
| DELETE | `/policies/:id` | Delete policy |

### ai-service · requires JWT

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/ai/chat` | `{message, agentEmail}` | Chat with AI assistant |

---

## Testing

```bash
# Backend unit tests (107 tests across 3 services)
cd auth-service && mvn test
cd customer-service && mvn test
cd policy-service && mvn test

# Frontend unit tests
cd frontend && npm run test

# E2E tests (Cypress)
cd e2e && npx cypress run

# Cross-browser (TestCafe)
cd e2e && npx testcafe chrome,firefox testcafe/

# Production smoke tests
cd e2e && npx cypress run --spec "cypress/e2e/13-production-smoke.cy.ts"
```

---

## Deployment

### Backend — AWS EC2

Services are built as Docker images, pushed to AWS ECR, and run on EC2 via docker-compose.

```bash
# Build and push images (repeat for each service)
docker buildx build --platform linux/amd64 \
  -t 186048966015.dkr.ecr.eu-central-1.amazonaws.com/insurecrm/auth-service:latest \
  --push ./auth-service

# SSH to EC2 and start services
ssh -i insurecrm-key.pem ubuntu@35.157.14.12
sudo docker-compose up -d
```

### Frontend — Vercel

```bash
cd frontend
vercel --prod
```

---

## Architecture Decisions

**Microservices over monolith**
Each service owns its domain and its database. There are no cross-service DB joins — policy-service stores `customerId` as a plain value and calls customer-service via REST when it needs to validate a customer. This keeps the data model clean and the services independently deployable.

**Stateless JWT auth**
All services share the same JWT secret and validate tokens independently. No service calls auth-service on every request. This makes the system horizontally scalable without introducing an auth service as a runtime dependency for every API call.

**Tool calling over RAG**
For a CRM backed by structured, relational data, tool calling gives more accurate and up-to-date answers than retrieval-augmented generation. The AI calls live APIs at query time rather than searching over embedded snapshots of data. pgvector integration is planned for unstructured content such as notes and email threads.

**Denormalized `customerName` in policy-service**
Avoids a synchronous network hop on every policy read. The tradeoff — a customer name change requires a corresponding update to all their policies — is acceptable for this domain where names rarely change.

---

## Known Limitations

- Deployed on AWS EC2 `t3.micro` (free tier) — cold-start and response times are higher than a production environment would tolerate. A production deployment would use ECS Fargate with auto-scaling and an Application Load Balancer.
- `SecurityConfig` is duplicated across all three secured services. Planned refactor: extract to a shared Maven library module.
- The Claims module is UI-only — the backend service is planned but not yet implemented.

---

## Project Structure

```
insure-crm/
├── auth-service/          # JWT authentication
├── customer-service/      # Customer management
├── policy-service/        # Policy management
├── ai-service/            # Claude AI assistant
├── frontend/              # React TS web app
├── mobile/                # React Native Expo app
├── e2e/                   # Cypress + TestCafe tests
├── docker-compose.yml     # Local development
└── .github/workflows/     # CI/CD pipeline
```
