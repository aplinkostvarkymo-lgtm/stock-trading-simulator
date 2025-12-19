# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
# Neon Postgres connection string
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# Authentication (Auth.js v5)
# Your app URL (use http://localhost:3000 for development)
NEXTAUTH_URL="http://localhost:3000"

# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
NEXTAUTH_SECRET="your-generated-secret-here-at-least-32-chars"

# OAuth Providers (Optional - only needed if using Google Sign-In)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# TwelveData API (Required for stock prices)
# Get your free API key at: https://twelvedata.com/pricing
TWELVEDATA_API_KEY="your-twelvedata-api-key-here"

# App Configuration
# Initial balance for new users (in dollars)
INITIAL_BALANCE="100000"

# Node Environment
NODE_ENV="development"
```

## How to Get API Keys

### 1. Neon Postgres (DATABASE_URL)
1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy the connection string from the dashboard
5. Paste it as `DATABASE_URL` in your `.env`

### 2. NextAuth Secret (NEXTAUTH_SECRET)
Run this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Copy the output and use it as `NEXTAUTH_SECRET`

### 3. TwelveData API (TWELVEDATA_API_KEY)
1. Go to https://twelvedata.com
2. Sign up for a free account (8 API calls/minute)
3. Go to https://twelvedata.com/account/api-keys
4. Copy your API key
5. Paste it as `TWELVEDATA_API_KEY` in your `.env`

### 4. Google OAuth (Optional)
Only needed if you want Google Sign-In:
1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret

## Validation

The app uses Zod to validate environment variables at startup (`lib/env.ts`).

If any required variable is missing or invalid, you'll see an error message like:
```
❌ Environment variable validation failed:
  - TWELVEDATA_API_KEY: TWELVEDATA_API_KEY is required
  - NEXTAUTH_SECRET: NEXTAUTH_SECRET must be at least 32 characters
```

## Production Deployment (Vercel)

When deploying to Vercel, add all these variables in:
**Project Settings → Environment Variables**

Make sure to:
- Set `NEXTAUTH_URL` to your production domain (e.g., `https://your-app.vercel.app`)
- Set `NODE_ENV` to `production`
- Keep `NEXTAUTH_SECRET` and API keys secret (never commit to Git)

