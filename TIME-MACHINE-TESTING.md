# Time Machine Feature - Testing Guide

Quick guide to test the Time Machine feature and verify it works correctly.

---

## 🚀 Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Time Machine:**
   ```
   http://localhost:3000/dashboard/time-machine
   ```

---

## ✅ Test Cases

### Test 1: Basic Simulation (Happy Path)

**Steps:**
1. Click on "Time Machine" in sidebar
2. In "Stock Symbol" field, type: `AAPL`
3. Select "Apple Inc." from dropdown
4. Choose date: `2023-01-15` (or any date ~1 year ago)
5. Enter amount: `10000`
6. Click "Simulate Investment"

**Expected Results:**
- ✅ Loading spinner appears
- ✅ Results section displays after ~2-3 seconds
- ✅ "What If?" card shows stock and date
- ✅ 4 metric cards display:
  - Initial Investment: $10,000
  - Shares Bought: (calculated)
  - Current Value: (calculated)
  - Total Profit/Loss: (with color coding)
- ✅ Price chart renders showing 1 year of data
- ✅ Historical data table shows OHLC values
- ✅ "Add to Watchlist" and "Simulate Another" buttons appear

---

### Test 2: Stock Search Autocomplete

**Steps:**
1. Click in "Stock Symbol" field
2. Type: `TS`
3. Wait 300ms

**Expected Results:**
- ✅ Dropdown appears with matching stocks
- ✅ Shows stock symbol, name, and exchange
- ✅ Clicking a stock fills the input
- ✅ Dropdown closes after selection

---

### Test 3: Date Validation

**Test 3a: Future Date**
1. Try to select tomorrow's date
2. **Expected:** Date picker prevents selection (grayed out)

**Test 3b: Too Old Date**
1. Select date: `2015-01-01` (>5 years ago)
2. Enter stock: `AAPL`
3. Enter amount: `5000`
4. Click "Simulate Investment"
5. **Expected:** Error message: "Date is too far back. Please select a date within the last 5 years."

**Test 3c: Weekend Adjustment**
1. Select date: `2023-12-16` (Saturday)
2. Enter stock: `MSFT`
3. Enter amount: `5000`
4. Click "Simulate Investment"
5. **Expected:** 
   - Results show
   - Yellow warning: "Adjusted to Dec 15, 2023 (closest trading day)"

---

### Test 4: Invalid Stock Symbol

**Steps:**
1. Enter symbol: `INVALID123`
2. Choose any valid date
3. Enter amount: `1000`
4. Click "Simulate Investment"

**Expected Results:**
- ✅ Error message appears
- ✅ No results section displays
- ✅ Error text in red: "Unable to fetch historical data..."

---

### Test 5: Amount Validation

**Test 5a: Too Small**
1. Enter amount: `0` or negative
2. Try to submit
3. **Expected:** Button disabled or validation error

**Test 5b: Too Large**
1. Enter amount: `10000000` (>1 million)
2. Try to submit
3. **Expected:** Validation error

**Test 5c: Valid Range**
1. Enter amount: `1` (minimum)
2. **Expected:** Accepts
3. Enter amount: `1000000` (maximum)
4. **Expected:** Accepts

---

### Test 6: Add to Watchlist Integration

**Steps:**
1. Complete a successful simulation (e.g., AAPL)
2. Click "Add to Watchlist" button
3. Wait for response

**Expected Results:**
- ✅ Button shows loading state ("Adding...")
- ✅ Success alert appears: "AAPL added to watchlist!"
- ✅ Navigate to `/dashboard/watchlist`
- ✅ Stock appears in watchlist

**Test Duplicate:**
1. Go back to Time Machine
2. Simulate same stock again
3. Click "Add to Watchlist"
4. **Expected:** Error: "Stock is already in your watchlist"

---

### Test 7: Simulate Another

**Steps:**
1. Complete a successful simulation
2. Scroll to bottom
3. Click "Simulate Another" button

**Expected Results:**
- ✅ Results section disappears
- ✅ Form remains filled (or resets - check UX preference)
- ✅ Can immediately start new simulation

---

### Test 8: Loading States

**Steps:**
1. Start a simulation
2. Observe UI during loading

**Expected Results:**
- ✅ Submit button shows spinner: "Simulating..."
- ✅ Form inputs are disabled
- ✅ Cannot submit multiple times
- ✅ Loading completes within 5 seconds

---

### Test 9: Chart Display

**Steps:**
1. Complete simulation with date 1+ year ago
2. Scroll to chart section

**Expected Results:**
- ✅ Chart renders with blue line
- ✅ X-axis shows dates (oldest to newest)
- ✅ Y-axis shows prices with $ formatting
- ✅ Hovering shows tooltip with date and price
- ✅ Chart is responsive (resize browser)

---

### Test 10: Profit/Loss Color Coding

**Test 10a: Profitable Investment**
1. Simulate: AAPL, 2020-01-15, $10,000
2. **Expected:**
   - Profit card shows green color
   - TrendingUp icon (green)
   - Positive percentage in green

**Test 10b: Loss Investment** (if possible)
1. Find a stock that declined
2. **Expected:**
   - Profit card shows red color
   - TrendingDown icon (red)
   - Negative percentage in red

---

### Test 11: Responsive Design

**Steps:**
1. Open Time Machine on desktop
2. Resize browser to mobile width (375px)
3. Test all interactions

**Expected Results:**
- ✅ Form stacks vertically
- ✅ Metric cards stack (1 column on mobile)
- ✅ Chart remains readable
- ✅ Buttons stack or shrink appropriately
- ✅ No horizontal scroll

---

### Test 12: Error Recovery

**Steps:**
1. Disconnect internet (or simulate API failure)
2. Try to simulate investment
3. **Expected:** Error message displayed
4. Reconnect internet
5. Try again
6. **Expected:** Works normally

---

## 🔍 Browser Console Checks

### Open DevTools (F12) and verify:

**Should NOT see:**
- ❌ "Decimal objects are not supported"
- ❌ Unhandled promise rejections
- ❌ React hydration errors
- ❌ Type errors

**Should see (normal):**
- ✅ Network requests to TwelveData API
- ✅ Successful fetch calls (200 status)
- ✅ Console logs for debugging (if any)

---

## 📊 Data Accuracy Verification

### Manual Calculation Check:

**Example:**
- Stock: AAPL
- Historical Price: $150.00
- Investment: $10,000
- Current Price: $195.00

**Expected Calculations:**
- Shares Bought: 10,000 / 150 = 66.67 shares
- Current Value: 66.67 × 195 = $13,000.65
- Profit: 13,000.65 - 10,000 = $3,000.65
- Profit %: (3,000.65 / 10,000) × 100 = 30.01%

**Verify in UI:**
- ✅ All numbers match calculations
- ✅ Decimals display correctly (2 places for $, 4 for shares)
- ✅ Percentages show 2 decimal places

---

## 🎯 Performance Checks

### Timing Expectations:
- **Stock Search:** < 500ms response
- **Simulation:** 2-5 seconds (depends on API)
- **Chart Render:** < 1 second after data loads
- **Page Load:** < 2 seconds

### Rate Limiting:
1. Run 10 simulations rapidly
2. **Expected:** 
   - First 8 succeed
   - 9th and 10th may show rate limit error
   - Wait 60 seconds
   - Should work again

---

## ✅ Success Criteria

All tests pass when:

1. ✅ Form accepts valid inputs and rejects invalid ones
2. ✅ Simulations complete successfully with real data
3. ✅ Results display correctly with proper calculations
4. ✅ Chart renders with historical price data
5. ✅ Profit/loss color coding works
6. ✅ Add to Watchlist integration functions
7. ✅ Error handling works gracefully
8. ✅ Loading states provide feedback
9. ✅ Responsive design works on all screen sizes
10. ✅ No console errors or warnings
11. ✅ Navigation works (sidebar link)
12. ✅ Trading Terminal aesthetic is consistent

---

## 🐛 Common Issues & Solutions

### Issue: "Rate limit exceeded"
**Solution:** Wait 60 seconds between tests, or use different stocks

### Issue: "Unable to fetch historical data"
**Solution:** 
- Check stock symbol is valid
- Verify date is within 5 years
- Ensure TwelveData API key is set in `.env`

### Issue: Chart not rendering
**Solution:**
- Check browser console for errors
- Verify `recharts` is installed: `npm install recharts`
- Clear Next.js cache: `rm -rf .next && npm run dev`

### Issue: Autocomplete not working
**Solution:**
- Verify `/api/stocks/search` endpoint is working
- Check network tab for API responses
- Ensure minimum 2 characters entered

---

## 📝 Testing Checklist

Copy this checklist and mark as you test:

```
[ ] Basic simulation works
[ ] Stock autocomplete functions
[ ] Date validation (future/past/range)
[ ] Invalid stock handling
[ ] Amount validation
[ ] Add to Watchlist integration
[ ] Simulate Another resets form
[ ] Loading states display
[ ] Chart renders correctly
[ ] Profit/loss color coding
[ ] Responsive on mobile
[ ] Error recovery works
[ ] No console errors
[ ] Calculations are accurate
[ ] Performance is acceptable
```

---

## 🎉 Testing Complete!

If all tests pass, the Time Machine feature is ready for production! 🚀

**Report any issues in the project's issue tracker.**

