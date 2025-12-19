# 🚀 Complete Deployment Guide - GitHub to Vercel

## ✅ Pre-Deployment Checklist

- [x] **Build passes:** `npm run build` exits with code 0
- [x] **TypeScript:** Zero type errors
- [x] **Database synced:** Prisma schema in sync with Neon
- [x] **Environment variables documented:** See `VERCEL-ENV-VARIABLES.md`
- [x] **No "Updating..." placeholders:** Clean fallback logic
- [x] **Next.js warnings fixed:** Removed deprecated `swcMinify`

---

## 📦 Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)

```bash
cd c:\CURSOR\SimT
git init
```

### 1.2 Create `.gitignore` (should already exist)

Verify `.gitignore` includes:
```
node_modules
.next
.env*
!.env.example
.DS_Store
*.log
.vercel
```

### 1.3 Stage All Files

```bash
git add .
```

### 1.4 Create Initial Commit

```bash
git commit -m "Initial commit - Stock Trading Simulator MVP v1.0"
```

**Commit message details:**
- ✅ Full trading functionality (buy, sell, portfolio)
- ✅ Time Machine for historical investment simulation
- ✅ Real-time stock prices from TwelveData API
- ✅ Authentication with Auth.js v5
- ✅ Neon Postgres database with Prisma ORM
- ✅ Responsive Trading Terminal UI

---

## 🌐 Step 2: Push to GitHub

### 2.1 Create a New GitHub Repository

1. Go to https://github.com/new
2. **Repository name:** `stock-trading-simulator` (or your preferred name)
3. **Description:** "A professional stock trading simulator built with Next.js 15, Prisma, and TwelveData API"
4. **Visibility:** Public or Private (your choice)
5. ⚠️ **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

### 2.2 Link Your Local Repository to GitHub

Copy the commands from GitHub's "push an existing repository" section:

```bash
git remote add origin https://github.com/YOUR_USERNAME/stock-trading-simulator.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username**

### 2.3 Verify Push

Go to `https://github.com/YOUR_USERNAME/stock-trading-simulator` and verify all files are there.

⚠️ **Important:** Make sure `.env` is NOT in the repository (it should be ignored by `.gitignore`)

---

## ☁️ Step 3: Deploy to Vercel

### 3.1 Sign Up / Log In to Vercel

1. Go to https://vercel.com/signup
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account

### 3.2 Import Your Project

1. From Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find `stock-trading-simulator` in the list
3. Click **"Import"**

### 3.3 Configure Project

**Framework Preset:** Next.js (should be auto-detected)  
**Root Directory:** `./` (leave default)  
**Build Command:** `npm run build` (leave default)  
**Output Directory:** `.next` (leave default)  
**Install Command:** `npm install` (leave default)

### 3.4 Add Environment Variables

Click **"Environment Variables"** and add each one:

#### Required Variables:

1. **DATABASE_URL**
   ```
   Key: DATABASE_URL
   Value: postgresql://username:password@host/database?sslmode=require
   Environments: Production, Preview, Development (check all)
   ```

2. **NEXTAUTH_URL**
   ```
   Key: NEXTAUTH_URL
   Value: https://your-app-name.vercel.app
   Environments: Production
   ```
   ⚠️ You'll update this after deployment with your actual Vercel URL

3. **NEXTAUTH_SECRET**
   ```
   Key: NEXTAUTH_SECRET
   Value: <paste your generated secret>
   Environments: Production, Preview, Development (check all)
   ```
   
   **Generate with:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

4. **TWELVEDATA_API_KEY**
   ```
   Key: TWELVEDATA_API_KEY
   Value: <your TwelveData API key>
   Environments: Production, Preview, Development (check all)
   ```

5. **INITIAL_BALANCE**
   ```
   Key: INITIAL_BALANCE
   Value: 100000
   Environments: Production, Preview, Development (check all)
   ```

6. **NODE_ENV**
   ```
   Key: NODE_ENV
   Value: production
   Environments: Production
   ```

#### Optional (for Google OAuth):

7. **GOOGLE_CLIENT_ID** (if using Google Sign-In)
8. **GOOGLE_CLIENT_SECRET** (if using Google Sign-In)

### 3.5 Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. You'll see "Congratulations! Your project has been deployed."

---

## 🔧 Step 4: Post-Deployment Configuration

### 4.1 Update NEXTAUTH_URL

1. Copy your Vercel deployment URL (e.g., `https://stock-trading-simulator-abc123.vercel.app`)
2. Go to **Project Settings** → **Environment Variables**
3. Find `NEXTAUTH_URL` and click **"Edit"**
4. Update value to your actual Vercel URL
5. Click **"Save"**

### 4.2 Redeploy

1. Go to **Deployments** tab
2. Click the **three dots** on the latest deployment
3. Click **"Redeploy"**
4. Confirm with **"Redeploy"**

This ensures Auth.js uses the correct callback URLs.

### 4.3 Run Database Migrations (if needed)

Vercel automatically runs `prisma generate` during build. If you need to push schema changes:

```bash
# On your local machine
npx prisma db push
```

Or use Vercel CLI:
```bash
vercel env pull .env.production
npx prisma db push
```

---

## ✅ Step 5: Verify Deployment

### 5.1 Test Core Features

Visit your Vercel URL and test:

1. **Home Page**
   - ✅ Loads without errors
   - ✅ Sign In / Sign Up buttons work

2. **Authentication**
   - ✅ Sign up with email/password
   - ✅ Log in successfully
   - ✅ Redirects to dashboard after login

3. **Dashboard**
   - ✅ Shows Total Assets, Cash Balance, Portfolio Value
   - ✅ Displays correct starting balance ($100,000)
   - ✅ No console errors

4. **Trade Page**
   - ✅ Search for stocks (try "AMD")
   - ✅ Stock quote loads with real-time price
   - ✅ Buy 10 shares
   - ✅ Balance decreases correctly
   - ✅ Portfolio table shows new holding

5. **Portfolio Page**
   - ✅ Holdings display with real-time prices
   - ✅ Gain/Loss calculations are correct
   - ✅ Pie chart renders

6. **Sell Functionality**
   - ✅ Go to Trade page
   - ✅ Click "Sell" on a holding
   - ✅ Sell some shares
   - ✅ Balance increases

7. **Time Machine**
   - ✅ Select a stock (AMD)
   - ✅ Choose a past date
   - ✅ Enter investment amount
   - ✅ Historical price fetches
   - ✅ Profit/Loss calculates
   - ✅ Chart displays

8. **Transactions**
   - ✅ All buy/sell transactions appear
   - ✅ Filtering works
   - ✅ Pagination works

### 5.2 Check Vercel Logs

1. Go to Vercel dashboard → Your project → **"Logs"** tab
2. Look for any errors (should be none)
3. Verify no environment variable errors

### 5.3 Performance Check

1. Go to Vercel dashboard → **"Speed Insights"** (if enabled)
2. Check page load times
3. All pages should load in < 2 seconds

---

## 🔄 Step 6: Making Updates

### 6.1 Local Development

```bash
# Make changes to your code
git add .
git commit -m "Description of changes"
git push origin main
```

### 6.2 Automatic Deployment

Vercel automatically deploys every push to `main`:
- Watch the deployment in Vercel dashboard
- Check logs for any build errors
- Test the updated deployment

### 6.3 Rollback (if needed)

1. Go to **Deployments** tab
2. Find a previous working deployment
3. Click **three dots** → **"Promote to Production"**

---

## 🐛 Troubleshooting

### Build Fails

**Error:** `NEXTAUTH_SECRET` is missing
- **Fix:** Add it in Environment Variables, click "Redeploy"

**Error:** `DATABASE_URL` connection failed
- **Fix:** Verify Neon database is active, check connection string

**Error:** TypeScript errors
- **Fix:** Run `npx tsc --noEmit` locally to find errors

### Runtime Errors

**Error:** "API Rate Limit Reached"
- **Fix:** TwelveData free tier limit (8 calls/minute). Wait 60 seconds.

**Error:** Authentication loop
- **Fix:** Verify `NEXTAUTH_URL` matches your Vercel domain exactly

**Error:** Database connection pool exhausted
- **Fix:** Neon free tier has connection limits. Check Neon dashboard.

### API Not Fetching Prices

**Error:** "TwelveData API Failed"
- **Fix:** Verify `TWELVEDATA_API_KEY` in Vercel environment variables
- **Test:** Go to https://twelvedata.com/account/api-keys and verify key is active

---

## 📊 Monitoring

### Vercel Analytics

1. Go to Project → **"Analytics"** tab
2. Track page views, API calls, errors
3. Monitor performance metrics

### Vercel Logs

1. Go to Project → **"Logs"** tab
2. Filter by deployment, function, or time
3. Look for errors or slow queries

### Database Monitoring

1. Go to Neon dashboard
2. Check **"Monitoring"** tab
3. Watch for connection issues or slow queries

---

## 🎯 Production Checklist

Before sharing your app with users:

- [ ] All environment variables set correctly
- [ ] `NEXTAUTH_URL` matches Vercel domain
- [ ] Database migrations completed
- [ ] Authentication flow tested
- [ ] Buy/Sell transactions tested
- [ ] Real-time prices loading
- [ ] No console errors in browser
- [ ] No errors in Vercel logs
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled (optional)

---

## 🌟 Optional Enhancements

### Custom Domain

1. Go to Project → **"Settings"** → **"Domains"**
2. Click **"Add"**
3. Enter your domain (e.g., `tradesim.com`)
4. Follow DNS configuration instructions
5. Update `NEXTAUTH_URL` to your custom domain

### Environment-Specific Variables

For different values in preview vs production:
1. Edit environment variable
2. Select only "Production" or "Preview"
3. Save

### Vercel CLI for Local Development

```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
```

---

## 📞 Support

If you encounter issues:
- Check Vercel logs first
- Verify all environment variables
- Test locally with `npm run build`
- Review error messages carefully
- Check Neon database status
- Verify TwelveData API key is valid

---

## 🎉 Success!

Your Stock Trading Simulator is now live at:
**https://your-app-name.vercel.app**

Share with friends, test with real users, and enjoy! 🚀

---

## 📈 Next Steps

Post-MVP features to consider:
- Email notifications for price alerts
- Portfolio performance charts over time
- Advanced order types (limit, stop-loss)
- Stock news integration
- Social features (share trades)
- Mobile app (React Native)

**Your MVP is production-ready. Time to get users!** 🎯

