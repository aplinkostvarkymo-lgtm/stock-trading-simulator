# 🔐 Google OAuth Setup Guide

Complete step-by-step guide to enable "Sign in with Google" in your Stock Trading Simulator.

---

## ✨ Why Add Google OAuth?

**Benefits:**
- ✅ One-click sign-in for users
- ✅ No passwords to remember or manage
- ✅ Automatic profile photo from Google
- ✅ Trusted authentication by Google
- ✅ Better user experience
- ✅ Increased sign-up conversion

**Without Google OAuth:**
- Users must create username/password
- No profile photos
- Password reset flow needed

---

## 🚀 Quick Setup (10 minutes)

### Step 1: Create Google Cloud Project

1. Go to **https://console.cloud.google.com**
2. Click **"Select a project"** dropdown (top left)
3. Click **"New Project"**
4. **Project name:** `Stock Trading Simulator` (or your preferred name)
5. **Organization:** Leave as "No organization" (free tier)
6. Click **"Create"**
7. Wait 10-20 seconds for project creation

---

### Step 2: Configure OAuth Consent Screen

1. In Google Cloud Console, click **"APIs & Services"** → **"OAuth consent screen"**
2. **User Type:**
   - Select **"External"** (allows any Google user)
   - Click **"Create"**

3. **OAuth consent screen configuration:**
   - **App name:** `Stock Trading Simulator`
   - **User support email:** Your email address
   - **App logo:** (Optional - upload if you have one)
   - **App domain:** Leave blank for now
   - **Authorized domains:** Add your Vercel domain (e.g., `your-app.vercel.app`)
   - **Developer contact:** Your email address
   - Click **"Save and Continue"**

4. **Scopes:**
   - Click **"Add or Remove Scopes"**
   - Select these scopes:
     - ✅ `userinfo.email`
     - ✅ `userinfo.profile`
   - Click **"Update"**
   - Click **"Save and Continue"**

5. **Test users:** (Optional for testing)
   - Click **"Add Users"**
   - Add your Gmail address
   - Click **"Save and Continue"**

6. **Summary:**
   - Review your settings
   - Click **"Back to Dashboard"**

---

### Step 3: Create OAuth Credentials

1. Click **"Credentials"** in the left sidebar
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. **Application type:** Select **"Web application"**
4. **Name:** `Stock Trading Simulator Web Client`

5. **Authorized JavaScript origins:**
   Click **"Add URI"** and add:
   - `http://localhost:3000` (for local development)
   - `https://your-app.vercel.app` (your Vercel deployment URL)

6. **Authorized redirect URIs:**
   Click **"Add URI"** and add:
   - `http://localhost:3000/api/auth/callback/google` (local)
   - `https://your-app.vercel.app/api/auth/callback/google` (production)

   ⚠️ **Important:** The redirect URI must match EXACTLY (including `/api/auth/callback/google`)

7. Click **"Create"**

---

### Step 4: Copy Credentials

After clicking "Create", a popup will show:

**OAuth client created**
- **Client ID:** `123456789-abc123def456.apps.googleusercontent.com`
- **Client Secret:** `GOCSPX-abc123def456ghi789`

**Copy both values immediately!**

You can also find them later by:
1. Going to **"Credentials"**
2. Clicking on your OAuth client name
3. Viewing the **Client ID** and **Client secret**

---

### Step 5: Add to Your .env File

**For Local Development:**

Create or update `.env` file:

```env
# Existing variables...
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
TWELVEDATA_API_KEY=...

# Add Google OAuth
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789
```

---

### Step 6: Add to Vercel (Production)

1. Go to your Vercel project
2. Click **"Settings"** → **"Environment Variables"**
3. Add two new variables:

**GOOGLE_CLIENT_ID:**
```
Key: GOOGLE_CLIENT_ID
Value: 123456789-abc123def456.apps.googleusercontent.com
Environments: Production, Preview, Development (check all)
```

**GOOGLE_CLIENT_SECRET:**
```
Key: GOOGLE_CLIENT_SECRET
Value: GOCSPX-abc123def456ghi789
Environments: Production, Preview, Development (check all)
```

4. Click **"Save"**
5. **Redeploy** your app for changes to take effect

---

### Step 7: Test Google Sign-In

**Local Testing:**
1. Run `npm run dev`
2. Go to `http://localhost:3000/auth/signin`
3. Click **"Sign in with Google"**
4. Choose your Google account
5. ✅ You should be redirected to `/dashboard`
6. Check sidebar - your Google profile photo should appear!

**Production Testing:**
1. Go to `https://your-app.vercel.app/auth/signin`
2. Click **"Sign in with Google"**
3. Sign in with any Google account
4. ✅ Should redirect to dashboard with $100,000 starting balance

---

## ✅ Verification Checklist

After setup, verify:

- [ ] OAuth consent screen configured
- [ ] OAuth credentials created
- [ ] Client ID added to `.env` (local)
- [ ] Client Secret added to `.env` (local)
- [ ] Both variables added to Vercel
- [ ] Redirect URIs match exactly
- [ ] App redeployed on Vercel
- [ ] Google sign-in works locally
- [ ] Google sign-in works in production
- [ ] New Google users get $100,000 balance
- [ ] User name and photo display in dashboard
- [ ] Sign out works correctly

---

## 🔧 Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem:** Redirect URI doesn't match Google Cloud Console configuration

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Click your OAuth client
3. Check **Authorized redirect URIs**
4. Make sure it includes: `https://your-app.vercel.app/api/auth/callback/google`
5. Wait 1-2 minutes for changes to propagate
6. Try again

### Error: "Access blocked: This app's request is invalid"

**Problem:** OAuth consent screen not properly configured

**Solution:**
1. Go to **OAuth consent screen**
2. Make sure **User Type** is "External"
3. Make sure scopes include `userinfo.email` and `userinfo.profile`
4. Click **"Publish App"** (if you see this option)
5. Try again

### Error: "invalid_client"

**Problem:** Client ID or Secret is incorrect

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Copy Client ID and Secret again
3. Update `.env` file
4. Update Vercel environment variables
5. Restart dev server (`npm run dev`)
6. Redeploy on Vercel

### Google Sign-In Works, But User Has No Balance

**Problem:** Initial balance not set for OAuth users

**Solution:**
1. Check `auth.ts` file has the `events.createUser` callback
2. Make sure `INITIAL_BALANCE` environment variable is set
3. Delete the test user from database and try again
4. Check Vercel logs for errors

### Profile Photo Not Showing

**Problem:** Next.js not configured to allow Google images

**Solution:**
1. Check `next.config.js` has `remotePatterns` for `lh3.googleusercontent.com`
2. Restart dev server
3. Clear browser cache
4. Try again

---

## 🔒 Security Best Practices

1. **Keep Client Secret Private**
   - Never commit to Git
   - Only add to `.env` (which is in `.gitignore`)
   - Only add to Vercel environment variables

2. **Use Different Credentials for Dev/Prod** (Recommended)
   - Create two OAuth clients in Google Cloud
   - One for `localhost:3000`
   - One for `your-app.vercel.app`

3. **Restrict Domains**
   - Only add authorized domains you own
   - Remove test domains before production

4. **Monitor Usage**
   - Check Google Cloud Console for API usage
   - Set up billing alerts if needed
   - Free tier is usually sufficient

---

## 📊 User Flow

### New Google User:
1. Click "Sign in with Google"
2. Choose Google account
3. Consent screen (first time only)
4. App creates user in database with:
   - Email from Google
   - Name from Google
   - Profile photo from Google
   - Initial balance: $100,000
5. Redirects to dashboard
6. User can immediately start trading!

### Existing Google User:
1. Click "Sign in with Google"
2. Choose Google account
3. Immediately redirected to dashboard
4. No password needed!

### Mixed Auth (Same Email):
If someone signs up with email/password using `user@gmail.com`, they can later also sign in with Google using the same email. Our config has:

```typescript
allowDangerousEmailAccountLinking: true
```

This allows the same email to be used for both methods.

---

## 🎉 Success!

Your Stock Trading Simulator now supports:
- ✅ Email/password sign-up and sign-in
- ✅ Google OAuth sign-in
- ✅ Profile photos from Google
- ✅ Seamless authentication experience

**Next Steps:**
- Test with different Google accounts
- Share with friends to test user experience
- Monitor sign-up conversion rates
- Consider adding more OAuth providers (GitHub, Twitter, etc.)

---

## 📞 Support

If you encounter issues:
1. Check Google Cloud Console logs
2. Check Vercel deployment logs
3. Verify all redirect URIs match exactly
4. Make sure environment variables are set correctly
5. Wait 1-2 minutes after making changes to Google Cloud settings

**Common mistake:** Forgetting to add `/api/auth/callback/google` to redirect URIs. This MUST be exact!

---

**Google OAuth is now fully configured! Users can sign in with one click. 🚀**

