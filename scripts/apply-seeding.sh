#!/bin/bash

# NutriScan Database Seeding Script
# This script applies the database schema and seeding to Supabase

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}NutriScan Database Seeding Script${NC}"
echo "=================================="
echo ""

# Check if Supabase URL and key are provided
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo -e "${RED}Error: Missing Supabase credentials${NC}"
    echo ""
    echo "Please set the following environment variables:"
    echo "  export SUPABASE_URL=your_supabase_url"
    echo "  export SUPABASE_KEY=your_supabase_service_key"
    echo ""
    exit 1
fi

# Check if seed script exists
if [ ! -f "scripts/seed-database.sql" ]; then
    echo -e "${RED}Error: seed-database.sql not found${NC}"
    exit 1
fi

echo -e "${BLUE}Using Supabase URL: ${SUPABASE_URL}${NC}"
echo ""

# Read SQL content
SQL_CONTENT=$(cat scripts/seed-database.sql)

# Create JSON payload for Supabase SQL endpoint
PAYLOAD=$(jq -n \
    --arg query "$SQL_CONTENT" \
    '{query: $query}')

echo -e "${BLUE}Applying database schema and seeding...${NC}"
echo ""

# Execute SQL via Supabase REST API
RESPONSE=$(curl -s -X POST \
    "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD")

# Check for errors
if echo "$RESPONSE" | grep -q "error"; then
    echo -e "${RED}Error applying schema:${NC}"
    echo "$RESPONSE" | jq .
    exit 1
fi

echo -e "${GREEN}✓ Database schema created successfully${NC}"
echo -e "${GREEN}✓ Tables created: users, food_scans, favorites, weekly_goals, health_history, notifications${NC}"
echo -e "${GREEN}✓ Row Level Security policies applied${NC}"
echo -e "${GREEN}✓ Sample data inserted${NC}"
echo ""

echo -e "${BLUE}Next steps:${NC}"
echo "1. Configure your .env.local with Supabase credentials"
echo "2. Start the backend: python -m uvicorn backend/main:app --port 10000"
echo "3. Start the frontend: npm run dev"
echo "4. Visit http://localhost:3000 to test the application"
echo ""

echo -e "${GREEN}Setup complete!${NC}"
