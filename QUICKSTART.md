# Quick Start Guide

Get your Stock Trading Simulator up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm
- PostgreSQL database (or Neon account)
- TwelveData API key

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/tradingsim"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
TWELVEDATA_API_KEY="your-api-key-here"
GOOGLE_CLIENT_ID="optional"
GOOGLE_CLIENT_SECRET="optional"
INITIAL_BALANCE="100000"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed with test data
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Test User (if seeded)

- Email: `test@example.com`
- Password: `password123`
- Initial Balance: $100,000

## First Steps

1. **Sign Up**: Create a new account at `/auth/signup`
2. **Explore**: Navigate to the dashboard
3. **Trade**: Search for stocks (try "AAPL" or "GOOGL")
4. **Buy**: Purchase some shares
5. **Monitor**: Check your portfolio

## Project Structure

```
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
├── lib/              # Utilities and configurations
├── prisma/           # Database schema and seed
└── types/            # TypeScript type definitions
```

## Key Features Implemented

✅ **Authentication**
- Email/Password sign-up and sign-in
- Google OAuth integration
- Protected routes with middleware

✅ **Trading**
- Real-time stock search (TwelveData API)
- Buy/Sell functionality with balance validation
- Transaction history

✅ **Portfolio Management**
- Holdings with real-time prices
- Gain/loss calculations
- Performance tracking

✅ **Watchlist**
- Add/remove stocks
- Live price updates
- Quick trade access

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Run production build

# Database
npx prisma studio        # Open Prisma Studio GUI
npx prisma db push       # Push schema changes
npx prisma generate      # Generate Prisma Client
npx prisma db seed       # Seed database

# Linting
npm run lint             # Run ESLint
```

## Troubleshooting

### "Prisma Client not found"
```bash
npx prisma generate
```

### "Environment variable validation failed"
Check that all required variables are set in `.env`

### "Can't reach database server"
Verify your `DATABASE_URL` is correct and database is running

### "Rate limit exceeded"
TwelveData free tier: 8 requests/minute. Wait a minute and try again.

## Need Help?

- 📖 Read the full [README.md](README.md)
- 🚀 Check [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
- 📋 Review [implementation-plan.md](implementation-plan.md) for architecture details

## What's Next?

Ready to deploy? Follow the [DEPLOYMENT.md](DEPLOYMENT.md) guide to deploy to Vercel with Neon Postgres.

---

**Happy Trading! 📈**

