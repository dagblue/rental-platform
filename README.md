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

### 2. Configure Environment Variables


Copy the example environment files over and fill in your local PostgreSQL credentials and secret keys:

# Backend config
cp apps/backend/.env.example apps/backend/.env

# Database config
cp packages/database/.env.example packages/database/.env

Make sure your apps/backend/.env has at least these set:
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/rental_platform"
JWT_SECRET="your-secret-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"

### 3. Set Up PostgreSQL

If you need to quickly spin up the database and user locally via psql:

psql -U postgres -c "CREATE USER rental WITH PASSWORD 'your_password';"
psql -U postgres -c "CREATE DATABASE rental_platform OWNER rental;"
psql -U postgres -c "CREATE DATABASE rental_platform_shadow OWNER rental;"
Then run the Prisma migrations:

npm run db:migrate

### 4. Run everything concurrently in development mode:
npm run dev

Frontend runs on http://localhost:3000
Backend runs on http://localhost:3001
Handy Scripts
Command                   What it does 
npm run dev          Boots up both frontend and backend           npm run build        Builds all apps and packages for production
npm run lint         Runs the linter across workspaces
npm run type-check   Runs TypeScript checks
npm run db:migrate   Runs pending Prisma migrations
npm run db:studio    Opens Prisma Studio GUI to inspect data
npm run db:seed      Seeds local DB with sample data

## Core Features
Listings & Bookings: Full CRUD for items, availability checking, and booking requests.
Local Payments: Escrow-based system designed to work with local payment methods like Telebirr, CBE Birr, and M-PESA.
Trust & Verification: Phone verification, ID uploads, and a 4-level trust score system.
Messaging: Direct chat between owners and renters.
Ethiopian Context: Handles local phone number formats and regional address structures down to Woreda and Kebele.

## License

MIT