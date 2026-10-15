# Ethiopian Rental Platform

A peer-to-peer rental marketplace built specifically for the Ethiopian context. This app lets owners list gear, tools, or property for rent, while renters can book them using escrow payments. It also includes trust verification, real-time messaging, and reviews.

## What's Inside

We are using a monorepo setup managed by Turborepo and npm workspaces:

* **Frontend (`apps/frontend`)**: Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, React Query, and Zustand.
* **Backend (`apps/backend`)**: Node.js, Express, and TypeScript.
* **Database (`packages/database`)**: PostgreSQL with Prisma ORM.
* **Other packages**: Shared validation (Zod), auth utilities, and common Ethiopian phone number helpers.

---

## Getting Set Up Locally

### 1. Clone the repo and install dependencies

```bash
git clone [https://github.com/your-username/rental-platform.git](https://github.com/your-username/rental-platform.git)

cd rental-platform

npm install
