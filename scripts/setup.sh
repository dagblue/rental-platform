#!/bin/bash

echo "🚀 Ethiopian Rental Platform Setup"
echo "=================================="

# Detect OS
OS=$(uname -s)
case "$OS" in
    Linux*)     OS="Linux" ;;
    Darwin*)    OS="Mac" ;;
    CYGWIN*)    OS="Cygwin" ;;
    MINGW*)     OS="MinGW" ;;
    *)          OS="UNKNOWN" ;;
esac

echo "📋 OS detected: $OS"

# Function to check for Docker
check_docker() {
   if command -v docker &> /dev/null && docker version &> /dev/null; then
    return 0
   else
    return 1
   fi

}

# Function to install Docker based on OS
install_docker_auto() {
    echo "🛠️  Installing Docker automatically..."
    
    case "$OS" in
        "Linux")
            # For Ubuntu/Debian
            if command -v apt-get &> /dev/null; then
                sudo apt-get update
                sudo apt-get install -y docker.io docker-compose
                sudo systemctl start docker
                sudo systemctl enable docker
                sudo usermod -aG docker $USER
                echo "⚠️  Please log out and back in, or run: newgrp docker"
            # For Fedora/RHEL
            elif command -v dnf &> /dev/null; then
                sudo dnf install -y docker docker-compose
                sudo systemctl start docker
                sudo systemctl enable docker
                sudo usermod -aG docker $USER
            fi
            ;;
        "Mac")
            echo "🔗 Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/"
            echo "   Then run this script again."
            exit 1
            ;;
        *)
            echo "❌ Automatic Docker installation not supported for $OS"
            echo "   Please install Docker manually from: https://docs.docker.com/get-docker/"
            exit 1
            ;;
    esac
}

# Main setup logic
setup_with_docker() {
    echo "🐳 Setting up with Docker..."
    
    # Create docker-compose if it doesn't exist
    if [ ! -f "infrastructure/docker/docker-compose.dev.yml" ]; then
        mkdir -p infrastructure/docker
        cat > infrastructure/docker/docker-compose.dev.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: rental
      POSTGRES_PASSWORD: rental123
      POSTGRES_DB: rental_platform
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
volumes:
  postgres_data:
EOF
    fi
    
    # Start services
    docker compose -f infrastructure/docker/docker-compose.dev.yml up -d
    
    # Wait for PostgreSQL
    echo "⏳ Waiting for PostgreSQL..."
    for i in {1..30}; do
        if docker exec $(docker compose -f infrastructure/docker/docker-compose.dev.yml ps -q postgres) pg_isready -U rental > /dev/null 2>&1; then
            echo "✅ PostgreSQL is ready!"
            break
        fi
        sleep 2
    done
    
    # Set DATABASE_URL for Docker
    DATABASE_URL="postgresql://rental:rental123@localhost:5432/rental_platform?schema=public"
}

setup_without_docker() {
    echo "💻 Setting up without Docker..."
    
    echo "📋 Manual setup instructions:"
    echo "   1. Install PostgreSQL 16+"
    echo "   2. Create database:"
    echo "      sudo -u postgres psql"
    echo "      CREATE USER rental WITH PASSWORD 'rental123';"
    echo "      CREATE DATABASE rental_platform;"
    echo "      GRANT ALL PRIVILEGES ON DATABASE rental_platform TO rental;"
    echo "   3. Install Redis"
    echo ""
    read -p "Have you set up PostgreSQL and Redis? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Please set up the databases first"
        exit 1
    fi
    
    read -p "Enter PostgreSQL host (default: localhost): " PG_HOST
    PG_HOST=${PG_HOST:-localhost}
    read -p "Enter PostgreSQL port (default: 5432): " PG_PORT
    PG_PORT=${PG_PORT:-5432}
    
    DATABASE_URL="postgresql://rental:rental123@${PG_HOST}:${PG_PORT}/rental_platform?schema=public"
}

# ===== MAIN SETUP FLOW =====

# Check Docker
if check_docker; then
    echo "✅ Docker is available"
    setup_with_docker
else
    echo "❌ Docker is not available"
    read -p "Do you want to install Docker automatically? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_docker_auto
        # After install, check again
        if check_docker; then
            setup_with_docker
        else
            echo "⚠️  Docker installation may require restart. Please run script again."
            exit 0
        fi
    else
        setup_without_docker
    fi
fi

# ===== COMMON SETUP (with or without Docker) =====

echo "📦 Installing dependencies..."
npm install
npm run install:all

echo "🔨 Building shared package..."
cd packages/shared && npm run build && cd ../..

echo "🗄️  Setting up database..."
cd packages/database

# Create .env with correct DATABASE_URL
cat > .env << EOF
DATABASE_URL="${DATABASE_URL}"
EOF

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🚀 Running migrations..."
npx prisma migrate dev --name init

echo "🌱 Seeding database..."
npm run seed

cd ../..

echo ""
echo "🎉 SETUP COMPLETE!"
echo "=================="
echo ""
echo "🚀 Start development: npm run dev"
echo "👑 Admin: Phone: +251911223344, Password: Admin@2024!"
echo ""