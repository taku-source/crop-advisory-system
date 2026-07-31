#!/bin/bash
# ─── Crop Advisory System — Development Quick Start ──────────────────────────
# Run from the project root: bash start-dev.sh

echo ""
echo "🌽  Crop Advisory System — Dev Start"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Backend
echo ""
echo "📦  Installing backend dependencies..."
cd backend && npm install

echo ""
echo "⚙️   Make sure your .env is configured (cp .env.example .env)"
echo "    Then set MONGODB_URI and JWT_SECRET before continuing."
echo ""
read -p "Press ENTER once .env is ready to seed the database..."

echo ""
echo "🌱  Seeding database..."
npm run seed

echo ""
echo "🚀  Starting backend on port 5000..."
npm run dev &
BACKEND_PID=$!

# 2. Admin dashboard
echo ""
echo "📦  Installing admin dashboard dependencies..."
cd ../frontend-web && npm install

echo ""
echo "🖥️   Starting admin dashboard on port 3000..."
npm start &
ADMIN_PID=$!

# 3. Mobile app
echo ""
echo "📦  Installing mobile app dependencies..."
cd ../mobile-app && npm install

echo ""
echo "📱  Starting Expo (mobile app)..."
npx expo start &
EXPO_PID=$!

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅  All services started!"
echo ""
echo "  Backend API  → http://localhost:5000"
echo "  Admin UI     → http://localhost:3000"
echo "  Mobile App   → Scan QR code with Expo Go"
echo ""
echo "  Admin login  → admin@cropadvisory.zw / Admin@1234"
echo "  Test farmer  → farmer@test.zw / Farmer@1234"
echo ""
echo "Press Ctrl+C to stop all services."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Wait and clean up on Ctrl+C
trap "kill $BACKEND_PID $ADMIN_PID $EXPO_PID 2>/dev/null; echo ''; echo '👋  Stopped.'; exit 0" INT
wait
