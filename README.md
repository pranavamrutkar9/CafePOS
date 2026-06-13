# Cafe POS Monorepo

This monorepo contains the scaffolding for the Cafe Point of Sale (POS) system.

## Project Structure

```
ROOT
├── frontend/          (Next.js 14, App Router, TypeScript, TailwindCSS)
├── backend/           (Node.js + Express, TypeScript)
├── packages/
│   └── shared-types/  (shared TS interfaces/enums used by both frontend and backend)
└── docker-compose.yml (Postgres + Redis for local dev)
```

## Setup & Running

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher recommended)
- Docker & Docker Compose

### Getting Started

1. **Install dependencies in all packages:**
   ```bash
   npm install
   ```

2. **Start Postgres and Redis docker containers:**
   ```bash
   docker-compose up -d
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to both backend and frontend directories:
   ```bash
   cp .env.example backend/.env
   cp .env.example frontend/.env
   ```
   *(Adjust parameters in the `.env` files as needed for your local port requirements).*

4. **Run development servers:**
   - Start the Express backend:
     ```bash
     npm run dev:backend
     ```
   - Start the Next.js frontend:
     ```bash
     npm run dev:frontend
     ```

### Second-Screen KDS Demo

To test the Kitchen Display System (KDS) in real-time on a second screen, open:
* **KDS Dashboard**: [http://localhost:3000/kds](http://localhost:3000/kds)

To simulate a new kitchen ticket being created, run the following command in your terminal while the servers are running:
```bash
curl -X POST http://localhost:5000/debug/emit-dummy-ticket
```
This triggers a dummy ticket insertion and immediately broadcasts a socket event to the KDS dashboard, updating the active ticket list in real-time without a browser reload.


## Working with Workspace Dependencies

The package `@cafepos/shared-types` contains typescript definitions shared across applications.
* When adding or updating types, compile the shared types module using:
  ```bash
  npm run build:shared
  ```
* Both frontend and backend applications import shared structures directly using:
  ```typescript
  import { IProduct, OrderStatus } from '@cafepos/shared-types';
  ```
