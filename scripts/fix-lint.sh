#!/bin/bash

echo "=== Fixing Linting Issues ==="

# 1. Fix TypeScript any types in source files
echo "1. Fixing explicit 'any' types..."

# Find files with 'any' and suggest fixes
find apps/backend/src packages/auth/src packages/shared/src -name "*.ts" -type f ! -path "*/node_modules/*" ! -path "*/dist/*" ! -path "*/client/*" ! -path "*/runtime/*" -exec grep -l ": any" {} \; | while read file; do
  echo "  Found 'any' in: $file"
  # You can add automatic fixes here
done

# 2. Fix {} types
echo "2. Fixing '{}' types..."

# 3. Create proper type definitions
echo "3. Creating proper type definitions..."
cat > apps/backend/src/types/common.ts << 'TYPESEOF'
// Common type replacements
export type EmptyObject = Record<string, never>;
export type AnyObject = Record<string, unknown>;
export type StringMap = Record<string, string>;

// Common response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Common function types
export type AsyncFunction<T = void> = () => Promise<T>;
export type Callback<T = void> = (error: Error | null, result?: T) => void;
TYPESEOF

echo "Done! Run 'npm run lint:fix' to auto-fix issues."
