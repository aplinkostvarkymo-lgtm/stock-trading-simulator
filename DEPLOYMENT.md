# Deployment Guide

This guide will walk you through deploying the Stock Trading Simulator to Vercel with Neon Postgres.

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Neon Postgres account (free tier available)
- TwelveData API key (free tier available)
- Google OAuth credentials (optional)

## Step 1: Set Up Database (Neon Postgres)

### 1.1 Create Neon Project

1. Go to [neon.tech](https://neon.tech/) and sign up
2. Click "Create Project"
3. Choose a name (e.g., "stock-trading-sim")
4. Select region closest to your users
5. Click "Create Project"

### 1.2 Get Connection String

1. In your Neon dashboard, click "Connection Details"
2. Copy the connection string (should look like: `postgresql://user:password@host/dbname?sslmode=require`)
3. Save this for later

## Step 2: Get API Keys

### 2.1 TwelveData API Key

1. Go to [twelvedata.com](https://twelvedata.com/)
2. Sign up for a free account
3. Navigate to "API" section
4. Copy your API key
5. Free tier: 8 requests/minute (sufficient for testing)

### 2.2 Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.vercel.app/api/auth/callback/google`
7. Copy Client ID and Client Secret

## Step 3: Prepare Repository

### 3.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 3.2 Verify Files

Ensure these files are in your repository:
- ✅ `package.json`
- ✅ `prisma/schema.prisma`
- ✅ `next.config.js`
- ✅ `.gitignore` (should include `.env` and `node_modules`)
- ❌ `.env` (should NOT be in git)

## Step 4: Deploy to Vercel

### 4.1 Import Project

1. Go to [vercel.com](https://vercel.com/) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 4.2 Configure Build Settings

**Framework Preset**: Next.js  
**Build Command**: `npx prisma generate && next build`  
**Output Directory**: `.next`  
**Install Command**: `npm install` (or your package manager)

### 4.3 Add Environment Variables

Click "Environment Variables" and add:

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-secure-random-string
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
TWELVEDATA_API_KEY=your-twelvedata-api-key
INITIAL_BALANCE=100000
NODE_ENV=production
```

**To generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

### 4.4 Deploy

1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Once deployed, click "Visit" to see your app

## Step 5: Initialize Database

### Option A: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Link to project:
   ```bash
   vercel link
   ```

3. Run Prisma commands:
   ```bash
   vercel env pull .env.production.local
   npx prisma db push
   ```

### Option B: Using Prisma Studio

1. Install dependencies locally
2. Copy production DATABASE_URL to local `.env`
3. Run:
   ```bash
   npx prisma db push
   npx prisma studio
   ```
4. Manually verify tables were created

## Step 6: Verify Deployment

### 6.1 Test Authentication

1. Visit your deployed URL
2. Click "Sign Up"
3. Create an account
4. Verify you can sign in

### 6.2 Test Trading

1. Search for a stock (e.g., "AAPL")
2. Place a buy order
3. Check portfolio
4. Check transaction history
5. Try selling shares

### 6.3 Check Environment

- ✅ Database connection works
- ✅ Authentication works (email + Google)
- ✅ Stock API returns data
- ✅ Transactions update balance
- ✅ Pages load quickly (< 2 seconds)

## Step 7: Post-Deployment Setup

### 7.1 Custom Domain (Optional)

1. In Vercel dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` to your custom domain
5. Update Google OAuth redirect URI

### 7.2 Update Google OAuth Redirect

If using Google OAuth:
1. Go to Google Cloud Console
2. Add production URL to authorized redirect URIs
3. Format: `https://yourdomain.vercel.app/api/auth/callback/google`

### 7.3 Monitor Performance

Vercel provides:
- Real-time logs
- Performance analytics
- Error tracking
- Usage statistics

Access via: Dashboard → Your Project → Analytics

## Troubleshooting

### Build Fails

**Error**: "Prisma Client not found"  
**Solution**: Ensure build command includes `npx prisma generate`

**Error**: "Environment variable validation failed"  
**Solution**: Check all required env vars are set in Vercel

### Database Connection Issues

**Error**: "Can't reach database server"  
**Solution**: 
- Verify DATABASE_URL is correct
- Check Neon project is not suspended
- Ensure SSL mode is set: `?sslmode=require`

### Authentication Issues

**Error**: "Invalid callback URL"  
**Solution**: 
- Verify NEXTAUTH_URL matches deployment URL
- Check Google OAuth redirect URI is correct
- Ensure NEXTAUTH_SECRET is set

### API Rate Limiting

**Error**: "Rate limit exceeded"  
**Solution**: 
- TwelveData free tier: 8 requests/minute
- Implement caching (already built-in)
- Consider upgrading API plan

### Prisma Migration Issues

**Error**: "Database schema not in sync"  
**Solution**:
```bash
npx prisma db push --force-reset
```
⚠️ Warning: This will delete all data

## Performance Optimization

### 1. Caching Strategy

Already implemented:
- Stock quotes cached for 60s
- Search results cached for 5 minutes
- Static pages cached at CDN level

### 2. Database Optimization

- Indexes added for frequently queried columns
- Connection pooling via Neon
- Efficient queries with Prisma

### 3. Image Optimization

- Next.js Image component used throughout
- Automatic WebP/AVIF generation
- Responsive image sizing

## Security Checklist

Before going live:
- ✅ All env vars stored securely in Vercel
- ✅ No secrets in code or repository
- ✅ NEXTAUTH_SECRET is strong (32+ chars)
- ✅ Database uses SSL connection
- ✅ CORS configured correctly
- ✅ Rate limiting enabled
- ✅ Error messages don't leak sensitive info

## Monitoring & Maintenance

### Vercel Logs

View real-time logs:
1. Dashboard → Your Project
2. Click "Logs" tab
3. Filter by function, status, etc.

### Database Monitoring

Neon dashboard shows:
- Connection count
- Query performance
- Storage usage
- CPU/memory metrics

### API Usage

TwelveData dashboard:
- Requests used
- Rate limit status
- API key health

## Scaling Considerations

### Free Tier Limits

- **Vercel**: 100GB bandwidth/month
- **Neon**: 10GB storage, 100 hours compute/month
- **TwelveData**: 8 requests/minute

### When to Upgrade

Consider upgrading if:
- More than 1000 daily active users
- Need for real-time WebSocket data
- Require faster API rate limits
- Want custom domain without Vercel branding

## Backup Strategy

### Database Backups

Neon provides:
- Automatic daily backups (retained 7 days)
- Point-in-time recovery
- Manual backup triggers

### Code Backups

- GitHub repository (primary)
- Vercel maintains deployment history
- Download production build artifacts

## Rollback Procedure

If deployment has issues:

1. Go to Vercel dashboard
2. Click "Deployments"
3. Find previous working deployment
4. Click "..." → "Promote to Production"
5. Instant rollback (< 1 minute)

## Support Resources

- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)
- **TwelveData Docs**: [twelvedata.com/docs](https://twelvedata.com/docs)
- **Auth.js Docs**: [authjs.dev](https://authjs.dev)

## Continuous Deployment

Vercel automatically deploys when you push to main:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Deployment triggers automatically (2-5 minutes).

---

**Deployment Complete! 🎉**

Your Stock Trading Simulator is now live and ready to use.

