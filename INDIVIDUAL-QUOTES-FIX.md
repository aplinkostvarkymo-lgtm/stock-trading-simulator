# Individual Quotes Fix for Free Tier

## 🚨 Root Cause
TwelveData's **batch endpoint** (`/quote?symbol=AMD,NVDA`) is **unreliable on free tier** accounts, returning 0 quotes even with valid API keys.

---

## ✅ Solution Applied

### Changed: Batch → Individual Requests
**File**: `lib/stock-api.ts` → `getBatchQuotes()`

**Before (Batch Request):**
```typescript
const url = `/quote?symbol=AMD,NVDA&apikey=...`
// Free tier returns: 0 quotes, no error
```

**After (Individual Requests):**
```typescript
for (const symbol of symbols) {
  const url = `/quote?symbol=${symbol}&apikey=...`
  // Fetch AMD separately, then NVDA separately
}
```

---

## 🔍 Enhanced Diagnostics

### New Console Logs:
Every API call now logs:

```
[TwelveData] Fetching quotes individually for: ['AMD', 'NVDA']
[TwelveData] API Key present: true
[TwelveData] API Key length: 32
[TwelveData] Fetching AMD from: https://api.twelvedata.com/quote?symbol=AMD&apikey=***
[TwelveData] Raw response for AMD: {"symbol":"AMD","name":"Advanced Micro...
[TwelveData] ✓ AMD: $142.50 (Advanced Micro Devices)
[TwelveData] Fetching NVDA from: https://api.twelvedata.com/quote?symbol=NVDA&apikey=***
[TwelveData] Raw response for NVDA: {"symbol":"NVDA","name":"NVIDIA Corp...
[TwelveData] ✓ NVDA: $495.20 (NVIDIA Corporation)
[TwelveData] Results: 2 success, 0 errors
```

### Error Scenarios:

**If price is 0 or invalid:**
```
[TwelveData] ✗ AMD: Price is 0 or invalid. Raw data: {...}
```

**If all symbols fail:**
```
TwelveData API Failed: All symbols returned 0 quotes
```

**If rate limited:**
```
API Rate Limit Reached (8 calls/minute on free tier). Wait 60 seconds and refresh.
```

---

## 📊 What to Expect

### ✅ Success Case:
1. Navigate to http://localhost:3000/dashboard
2. Terminal shows:
   ```
   [TwelveData] ✓ AMD: $142.50 (Advanced Micro Devices)
   [TwelveData] ✓ NVDA: $495.20 (NVIDIA Corporation)
   [TwelveData] Results: 2 success, 0 errors
   [Dashboard] Processed 2 holdings, 2 with valid prices
   ```
3. Dashboard displays real-time prices with green/red gain/loss

### ⚠️ Partial Success:
If one symbol fails but others succeed:
```
[TwelveData] ✓ AMD: $142.50
[TwelveData] ✗ NVDA: Price is 0 or invalid
[TwelveData] Results: 1 success, 1 errors
```
- Dashboard shows: **Yellow warning banner**: "Partial failure: 1 of 2 symbols failed"
- AMD displays with live price
- NVDA shows "—" (dash)

### ❌ Complete Failure:
If all symbols fail:
```
[TwelveData] ✗ AMD: Price is 0 or invalid
[TwelveData] ✗ NVDA: Price is 0 or invalid
[TwelveData] Results: 0 success, 2 errors
```
- Dashboard shows: **Red error banner**: "TwelveData API Failed: All symbols returned 0 quotes"
- Holdings display with database prices only

---

## 🧪 Test Now

1. **Open Dashboard**: http://localhost:3000/dashboard
2. **Watch Terminal**: Look for `[TwelveData]` logs
3. **Check Browser**: Verify prices display or see error banner

### Expected Logs for Success:
```
[TwelveData] Module loaded
[TwelveData] API Key configured: true
[Dashboard] Fetching quotes for symbols: ['AMD', 'NVDA']
[TwelveData] Fetching quotes individually for: ['AMD', 'NVDA']
[TwelveData] Fetching AMD from: https://...
[TwelveData] Raw response for AMD: {"symbol":"AMD","close":"142.50"...
[TwelveData] ✓ AMD: $142.50 (Advanced Micro Devices)
[TwelveData] Fetching NVDA from: https://...
[TwelveData] Raw response for NVDA: {"symbol":"NVDA","close":"495.20"...
[TwelveData] ✓ NVDA: $495.20 (NVIDIA Corporation)
[TwelveData] Results: 2 success, 0 errors
```

---

## 🔍 If Still Failing

### Step 1: Check Raw Response
Look for this log line:
```
[TwelveData] Raw response for AMD: {...}
```

**If you see:**
- `"close":"142.50"` → Price field exists, should work ✅
- `"status":"error"` → API error, check message
- `"code":400` → Invalid request
- Empty `{}` → API returned nothing

### Step 2: Test API Directly
```powershell
# Test AMD
Invoke-WebRequest "https://api.twelvedata.com/quote?symbol=AMD&apikey=YOUR_KEY_HERE" | Select-Object -ExpandProperty Content

# Expected output:
# {"symbol":"AMD","name":"Advanced Micro Devices","close":"142.50",...}
```

### Step 3: Verify Database Holdings
```powershell
npx prisma studio
```
- Open `Holding` table
- Verify symbols are **uppercase**: AMD, NVDA (not amd, nvda)
- Verify `quantity > 0`

### Step 4: Check API Key
```powershell
cat .env | findstr TWELVEDATA_API_KEY
```
Should show: `TWELVEDATA_API_KEY=your_32_character_key`

---

## 📁 Changes Made

**File**: `lib/stock-api.ts`
- Function: `getBatchQuotes()`
- Change: Loop through symbols individually instead of batch request
- Added: Raw response logging for each symbol
- Added: Detailed success/error counts
- Added: Specific error messages for 0-quote scenarios

**Benefits:**
- ✅ Works reliably on free tier
- ✅ More transparent error reporting
- ✅ Shows exactly which symbols fail
- ✅ Logs raw API responses for debugging

---

## ⏱️ Performance Note

**Before (Batch):** 1 API call for all symbols (but unreliable)
**After (Individual):** 1 API call PER symbol (more reliable)

**Free Tier Limit:** 8 calls per minute
- If you have 2 holdings (AMD, NVDA): Uses 2 calls, leaves 6 available
- If you have 8 holdings: Uses all 8 calls, wait 60s before next refresh

**Recommendation:** Keep your portfolio under 5 holdings to avoid hitting the rate limit during normal usage.

---

## ✨ Next Step

**Refresh your dashboard now:** http://localhost:3000/dashboard

You should see in the terminal:
```
[TwelveData] ✓ AMD: $XX.XX (Advanced Micro Devices)
```

And on the dashboard, the real price of AMD in the "Current Price" column.

**If you still see "—" instead of a price, immediately share the terminal logs showing the `[TwelveData] Raw response for AMD:` line.**

