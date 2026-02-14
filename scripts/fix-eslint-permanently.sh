#!/bin/bash

echo "í´§ Permanently fixing ESLint configuration..."

# Install correct versions
echo "í³¦ Installing correct package versions..."
npm install

# Regenerate Prisma client
echo "í´„ Regenerating Prisma client..."
cd packages/database
npx prisma generate
cd ../..

# Test linting
echo "âœ… Testing linting configuration..."
npm run lint

echo "í¾‰ ESLint should now work correctly!"
echo ""
echo "If you still see errors, run:"
echo "  npm run lint:fix  # Auto-fix what can be fixed"
echo "  cd packages/database && npm run lint  # Test database package separately"
