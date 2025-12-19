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

### For Google OAuth (HIGHLY RECOMMENDED)

The app supports **"Sign in with Google"** for a better user experience!

#### GOOGLE_CLIENT_ID

**Get from:** https://console.cloud.google.com

**Setup Steps:**
1. Go to https://console.cloud.google.com
2. Create a new project (or select existing)
3. Click **"APIs & Services"** → **"Credentials"**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. Choose **"Web application"**
6. Add **Authorized JavaScript origins:**
   - Development: `http://localhost:3000`
   - Production: `https://your-app.vercel.app`
7. Add **Authorized redirect URIs:**
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-app.vercel.app/api/auth/callback/google`
8. Click **"Create"**
9. Copy the **Client ID**

```
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
```

#### GOOGLE_CLIENT_SECRET

**Get from:** Same credentials page as above

After creating OAuth client ID, you'll see both:
- **Client ID** (use for GOOGLE_CLIENT_ID)
- **Client Secret** (use for GOOGLE_CLIENT_SECRET)

```
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789
```

**⚠️ Important:**
- Keep Client Secret private (never commit to Git)
- You need BOTH Client ID and Client Secret for Google sign-in to work
- After deployment, update redirect URI to your Vercel domain

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

# Highly Recommended (for Google OAuth)
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789
```

**Note:** Google OAuth is optional but highly recommended. It provides:
- ✅ One-click sign-in for users
- ✅ No need to remember passwords
- ✅ Automatic profile photo
- ✅ Better user experience

If you skip Google OAuth, users can still sign up with email/password.

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

