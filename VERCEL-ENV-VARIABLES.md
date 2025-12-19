# Vercel Environment Variables

## 🔑 Required Environment Variables for Vercel Deployment

When deploying to Vercel, add these environment variables in **Project Settings → Environment Variables**:

---

### 1. DATABASE_URL
**Value:** Your Neon Postgres connection string  
**Example:** `postgresql://username:password@host/database?sslmode=require`  
**Get it from:** https://neon.tech → Your Project → Connection String

```
DATABASE_URL=postgresql://username:password@ep-xxxxx.aws.neon.tech/neondb?sslmode=require
```

---

### 2. NEXTAUTH_URL
**Value:** Your Vercel app URL  
**Example:** `https://your-app-name.vercel.app`  
**Important:** Use your actual Vercel deployment URL (NOT localhost)

```
NEXTAUTH_URL=https://your-app-name.vercel.app
```

---

### 3. NEXTAUTH_SECRET
**Value:** A random 32+ character secret  
**Generate with:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
**Example output:** `7vG4xK9Lm2nP8qR5tU7wY0zB3cD6eF9hJ1kM4nO7pR=`

```
NEXTAUTH_SECRET=7vG4xK9Lm2nP8qR5tU7wY0zB3cD6eF9hJ1kM4nO7pR=
```

---

### 4. TWELVEDATA_API_KEY
**Value:** Your TwelveData API key  
**Get it from:** https://twelvedata.com/pricing → Sign up (free) → https://twelvedata.com/account/api-keys  
**Example:** `abc123def456ghi789jkl012mno345pq`

```
TWELVEDATA_API_KEY=abc123def456ghi789jkl012mno345pq
```

---

### 5. INITIAL_BALANCE
**Value:** `100000`  
**Description:** Starting balance for new users (in dollars)

```
INITIAL_BALANCE=100000
```

---

### 6. NODE_ENV
**Value:** `production`  
**Description:** Tells the app it's running in production mode

```
NODE_ENV=production
```

---

## 🔒 Optional Environment Variables

### For Google OAuth (if you want Google Sign-In):

#### GOOGLE_CLIENT_ID
**Get from:** https://console.cloud.google.com  
**Steps:**
1. Create a new project
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `https://your-app.vercel.app/api/auth/callback/google`
5. Copy Client ID

```
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
```

#### GOOGLE_CLIENT_SECRET
**Get from:** Same as above (Google Cloud Console)

```
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789
```

---

## 📋 Complete List (Copy-Paste Ready)

```env
# Required Variables
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<generate-with-node-command>
TWELVEDATA_API_KEY=<your-api-key>
INITIAL_BALANCE=100000
NODE_ENV=production

# Optional Variables (for Google OAuth)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## ✅ How to Add to Vercel

1. Go to your Vercel project
2. Click **Settings**
3. Click **Environment Variables** in the left sidebar
4. Add each variable:
   - **Key**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Your actual value
   - **Environment**: Select **Production**, **Preview**, and **Development**
5. Click **Save**
6. Redeploy your app for changes to take effect

---

## 🔍 How to Verify

After deployment, check the Vercel logs:
- If you see `❌ Environment variable validation failed`, a required variable is missing
- If the app loads, all variables are configured correctly

---

## 🚨 Important Security Notes

- ✅ **NEVER** commit `.env` to Git
- ✅ Keep `NEXTAUTH_SECRET` private and unique
- ✅ Regenerate secrets if they're ever exposed
- ✅ Use different secrets for development and production
- ✅ TwelveData free tier has rate limits (8 calls/minute)

---

## 📞 Need Help?

If deployment fails, check:
1. ✅ All required variables are set
2. ✅ `DATABASE_URL` is correct (test with `npx prisma db push`)
3. ✅ `NEXTAUTH_URL` matches your Vercel domain
4. ✅ `NEXTAUTH_SECRET` is at least 32 characters
5. ✅ `TWELVEDATA_API_KEY` is valid (test at https://twelvedata.com/account/api-keys)

