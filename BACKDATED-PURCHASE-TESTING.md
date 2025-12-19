# Backdated Purchase - Testing Guide

Quick guide to test the new "Execute Purchase" feature in Time Machine.

---

## 🚀 Quick Start

```bash
npm run dev
```

Navigate to: `http://localhost:3000/dashboard/time-machine`

---

## ✅ Test Cases

### Test 1: Successful Backdated Purchase

**Goal:** Verify basic purchase flow works

**Steps:**
1. Enter stock symbol: `AAPL`
2. Wait for current price to load (~1s)
3. Select date: `2020-01-15` (4+ years ago)
4. Wait for historical price to load (~1s)
5. Verify historical price shows (should be ~$75)
6. Keep default amount: `10000`
7. Verify Quick Preview shows:
   - Shares Bought: ~133.3333
   - Current Value: ~$26,000
   - Profit: ~+$16,000 (+160%)
8. Click **"Execute Purchase"** button
9. Review confirmation modal:
   - Verify all details match
   - Note the backdated timestamp
10. Click **"Confirm Purchase"**

**Expected Results:**
- ✅ Success message appears (green banner)
- ✅ Message says: "Successfully purchased 133.3333 shares of AAPL at $75.00 on Jan 15, 2020"
- ✅ Form auto-resets after 3 seconds
- ✅ Navigate to `/dashboard` - balance should be $90,000 (was $100,000)
- ✅ Navigate to `/dashboard/portfolio` - AAPL holding appears with 133.3333 shares
- ✅ Navigate to `/dashboard/transactions` - transaction shows with date 2020-01-15

---

### Test 2: Insufficient Balance

**Goal:** Verify balance validation works

**Steps:**
1. Note your current balance (check dashboard)
2. Go to Time Machine
3. Enter symbol: `TSLA`
4. Select date: `2020-01-01`
5. Enter amount: `500000` (more than your balance)
6. Click "Execute Purchase"
7. Click "Confirm"

**Expected Results:**
- ❌ Error message: "Insufficient balance. You have $X, but need $500,000"
- ✅ No transaction created
- ✅ Balance unchanged
- ✅ No holding created

---

### Test 3: Multiple Purchases - Average Price

**Goal:** Verify average price calculation for multiple purchases

**Steps:**
1. **First Purchase:**
   - Symbol: `MSFT`
   - Date: `2020-01-01`
   - Amount: `5000`
   - Execute purchase
2. **Second Purchase:**
   - Symbol: `MSFT` (same stock)
   - Date: `2022-01-01`
   - Amount: `5000`
   - Execute purchase
3. Navigate to Portfolio

**Expected Results:**
- ✅ One MSFT holding (not two)
- ✅ Total shares = shares from purchase 1 + shares from purchase 2
- ✅ Average price = weighted average of both purchases
- ✅ Two transactions in history (with different dates)

---

### Test 4: Weekend Date Adjustment

**Goal:** Verify weekend dates get adjusted to Friday

**Steps:**
1. Enter symbol: `AAPL`
2. Select date: `2023-12-16` (Saturday)
3. Wait for historical price to load

**Expected Results:**
- ✅ Warning message appears: "Market was closed on Dec 16, 2023. Using Dec 15, 2023"
- ✅ Historical price field shows adjusted date
- ✅ If you execute purchase, transaction date will be Dec 15, 2023

---

### Test 5: Minimum Shares Validation

**Goal:** Verify tiny investments are rejected

**Steps:**
1. Enter symbol: `BRK.A` (Berkshire Hathaway - expensive stock)
2. Select date: 1 year ago
3. Historical price will be ~$600,000/share
4. Enter amount: `10`
5. This would buy 0.0000167 shares (< 0.0001 minimum)
6. Click "Execute Purchase"
7. Click "Confirm"

**Expected Results:**
- ❌ Error: "Investment amount too small. Minimum 0.0001 shares required"
- ✅ No transaction created

---

### Test 6: Invalid Symbol

**Goal:** Verify error handling for non-existent stocks

**Steps:**
1. Enter symbol: `INVALID123`
2. Select any valid date
3. Wait ~2 seconds

**Expected Results:**
- ❌ Historical price field shows error (red)
- ❌ Error message: "Unable to fetch historical data for INVALID123"
- ✅ "Execute Purchase" button is disabled
- ✅ Cannot proceed with purchase

---

### Test 7: Date Constraints

**Goal:** Verify date picker limits

**Test 7a: Future Date**
1. Try to select tomorrow's date
2. **Expected:** Date picker prevents selection (grayed out)

**Test 7b: Too Old**
1. Select date: `2015-01-01` (>5 years ago)
2. **Expected:** Error: "Date is too far back. Please select within last 5 years"

**Test 7c: Valid Range**
1. Select date: exactly 5 years ago
2. **Expected:** Works fine

---

### Test 8: Transaction History Integration

**Goal:** Verify backdated transactions appear correctly in history

**Steps:**
1. Execute 3 purchases:
   - AAPL on 2020-01-01
   - TSLA on 2021-06-01
   - MSFT on 2019-03-15
2. Navigate to `/dashboard/transactions`
3. Look at the transaction list

**Expected Results:**
- ✅ Transactions are sorted by timestamp
- ✅ MSFT appears first (2019)
- ✅ AAPL second (2020)
- ✅ TSLA third (2021)
- ✅ Each shows correct historical date
- ✅ "Type" column shows "BUY"
- ✅ Prices match historical prices

---

### Test 9: Portfolio Value Calculation

**Goal:** Verify portfolio shows correct current values

**Steps:**
1. Execute purchase: AAPL, 2020-01-15, $10,000
2. Navigate to `/dashboard/portfolio`
3. Look at AAPL holding

**Expected Results:**
- ✅ Quantity: 133.3333 shares (approx)
- ✅ Avg Price: $75.00
- ✅ Current Price: $195.00 (approx, real-time)
- ✅ Total Value: $26,000 (approx)
- ✅ Gain/Loss: +$16,000 (+160%)
- ✅ Values are color-coded (green for profit)

---

### Test 10: Dashboard Summary Update

**Goal:** Verify dashboard reflects new holdings

**Steps:**
1. Note dashboard metrics before purchase
2. Execute a purchase
3. Return to `/dashboard`

**Expected Results:**
- ✅ Cash Balance decreased
- ✅ Portfolio Value increased
- ✅ Total Assets updated
- ✅ Recent transactions shows new purchase
- ✅ Top holdings shows new stock (if top 5)

---

## 🎯 Success Criteria

All tests pass when:

1. ✅ Purchases execute successfully with valid inputs
2. ✅ Balance validation prevents over-spending
3. ✅ Minimum shares check works
4. ✅ Average price calculated correctly for multiple purchases
5. ✅ Weekend dates adjust to previous trading day
6. ✅ Transactions use backdated timestamps
7. ✅ Portfolio updates immediately
8. ✅ Dashboard reflects changes
9. ✅ Error messages are clear and helpful
10. ✅ No console errors or warnings

---

## 🔍 Manual Verification

### Check Database (Prisma Studio)

```bash
npx prisma studio
```

**Verify:**
1. **User table:** Balance decreased correctly
2. **Holding table:** 
   - New holdings created
   - Quantities correct
   - Average prices correct
3. **Transaction table:**
   - Timestamps are backdated (historical dates)
   - Type is "BUY"
   - All fields populated correctly

---

## 🐛 Common Issues & Solutions

### Issue: "Execute Purchase" button is disabled
**Check:**
- Is historical price loaded?
- Is amount entered?
- Are there any error messages?
- Is symbol valid?

### Issue: "Insufficient balance" error
**Solution:**
- Check current balance on dashboard
- Reduce investment amount
- Or reset account to $100,000 (if needed)

### Issue: Prices not loading
**Solution:**
- Verify `.env` has `TWELVEDATA_API_KEY`
- Check browser console for API errors
- Wait longer (API might be slow)
- Try different stock symbol

### Issue: Transaction not appearing in history
**Solution:**
- Refresh the page
- Check filters (make sure not filtering out BUY transactions)
- Look for transaction in date range

---

## 📊 Performance Expectations

### Timing:
- **Historical Price Fetch:** 1-2 seconds
- **Current Price Fetch:** 1-2 seconds
- **Purchase Execution:** 1-2 seconds
- **Total Flow:** ~5-6 seconds from start to finish

### Rate Limits:
- TwelveData Free: 8 calls/minute
- Each purchase uses ~2-3 API calls
- Don't spam purchases rapidly

---

## ✅ Final Checklist

Before marking as complete, verify:

```
[ ] Test 1: Successful purchase - PASS
[ ] Test 2: Insufficient balance - PASS
[ ] Test 3: Average price calculation - PASS
[ ] Test 4: Weekend adjustment - PASS
[ ] Test 5: Minimum shares - PASS
[ ] Test 6: Invalid symbol - PASS
[ ] Test 7: Date constraints - PASS
[ ] Test 8: Transaction history - PASS
[ ] Test 9: Portfolio values - PASS
[ ] Test 10: Dashboard update - PASS
[ ] No console errors
[ ] No linting errors
[ ] All data persists after page refresh
[ ] Success messages display correctly
[ ] Confirmation modal works
```

---

## 🎉 Testing Complete!

If all tests pass, the Backdated Purchase feature is **production-ready**! 🚀

Users can now learn from history by actually executing simulated trades at historical prices.

**Happy testing! 📈⏰**

