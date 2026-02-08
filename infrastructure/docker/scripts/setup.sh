#!/bin/bash

echo "🚀 Setting up Ethiopian Rental Platform Database"
echo "================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker and try again."
  exit 1
fi

# Check Node version
echo "📦 Checking Node.js version..."
if ! node --version | grep -q "v18\|v20"; then
  echo "❌ Node.js 18 or 20 is required"
  exit 1
fi
echo "✅ Node.js $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install workspace dependencies
echo "📦 Installing workspace dependencies..."
npm run install:all

# Build shared package
echo "🔨 Building shared package..."
cd packages/shared
npm run build
cd ../..

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose -f infrastructure/docker/docker-compose.dev.yml up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker exec rental-postgres pg_isready -U rental > /dev/null 2>&1; do
  sleep 2
done
echo "✅ PostgreSQL is ready!"

# Setup database package
echo "🗄️  Setting up database package..."
cd packages/database

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  cat > .env << EOF
DATABASE_URL="postgresql://rental:rental123@localhost:5432/rental_platform?schema=public"
SHADOW_DATABASE_URL="postgresql://rental:rental123@localhost:5432/rental_platform_shadow?schema=public"
EOF
  echo "✅ Created .env file"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run migrations
echo "🚀 Running database migrations..."
npx prisma migrate dev --name init

# Seed database
echo "🌱 Seeding database with sample data..."
npm run seed

cd ../..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📊 Services running:"
echo "   PostgreSQL: localhost:5432"
echo "   Redis: localhost:6379"
echo "   pgAdmin: http://localhost:5050"
echo ""
echo "🔗 Access points:"
echo "   Prisma Studio: http://localhost:5555 (run: npx prisma studio)"
echo ""
echo "👑 Admin credentials:"
echo "   📱 Phone: +251911223344"
echo "   🔑 Password: Admin@2024!"
echo "   📧 Email: admin@rentalplatform.et"
echo ""
echo "🚀 To start development:"
echo "   Backend: cd apps/backend && npm run dev"
echo "   or use: npm run dev (from root)"