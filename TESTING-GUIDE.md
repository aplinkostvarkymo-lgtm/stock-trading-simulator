# 🧪 Testing Guide - Stock Trading Simulator

## Quick Testing Checklist

Use this guide to verify all Phase 3 functionality is working correctly.

---

## 🔐 Prerequisites

1. **Logged In**: You must be authenticated to test these features
2. **Balance**: Check your current balance in the dashboard
3. **TwelveData API**: Ensure your API key is set in `.env`

---

## 1️⃣ Test Stock Search

### From Dashboard → Trade Page

1. Click "Trade" in the sidebar
2. In the search bar, type: **AAPL**
3. **Expected**: Dropdown appears with search results
4. **Verify**: See "Apple Inc." with symbol "AAPL"

### Test Various Searches
```
✓ "GOOGL" → Should show Alphabet Inc.
✓ "MSFT" → Should show Microsoft Corporation
✓ "TSLA" → Should show Tesla, Inc.
✓ "Apple" → Should show AAPL in results
```

---

## 2️⃣ Test Buy Stock

### Scenario A: Successful Purchase

1. Search for **AAPL**
2. Click on Apple Inc. from results
3. **Verify**: Stock details appear with current price
4. Enter quantity: **1**
5. **Verify**: Total cost displays correctly
6. **Verify**: "Available Balance" shows your current balance
7. Click **"Buy Stock"**
8. Confirm the order
9. **Expected**: 
   - ✓ Success notification appears
   - ✓ Balance decreases by purchase amount
   - ✓ Holding appears in Portfolio

### Scenario B: Insufficient Balance

1. Try to buy **1000 shares** of AAPL
2. **Expected**: Error message "Insufficient balance"
3. **Verify**: Balance unchanged

### Check Results
- Navigate to **Dashboard**
- **Verify**: New holding appears in "Top Holdings"
- Navigate to **Portfolio**
- **Verify**: Stock appears with quantity and average price
- Navigate to **Transactions**
- **Verify**: BUY transaction recorded with timestamp

---

## 3️⃣ Test Sell Stock

### Scenario A: Successful Sale

1. Navigate to **Portfolio**
2. Find a stock you own (e.g., AAPL)
3. Note: Quantity owned (e.g., 1 share)
4. Navigate to **Trade**
5. Search for the same stock
6. Switch to **SELL** tab
7. Enter quantity: **1** (or less than owned)
8. **Verify**: Shows proceeds calculation
9. Click **"Sell Stock"**
10. Confirm the order
11. **Expected**:
    - ✓ Success notification
    - ✓ Balance increases by proceeds
    - ✓ Holding updated or removed

### Scenario B: Insufficient Shares

1. Try to sell **100 shares** of a stock you own 1 share of
2. **Expected**: Error "Insufficient shares. You own X shares."
3. **Verify**: Holding unchanged

### Check Results
- **Portfolio**: Quantity updated or holding removed
- **Transactions**: SELL transaction recorded
- **Dashboard**: Balance reflects proceeds

---

## 4️⃣ Test Average Price Calculation

### Test Scenario

1. **Buy 5 shares of AAPL at $175.00** = $875
   - Holding: 5 @ $175.00
   
2. **Buy 5 more shares at $180.00** = $900
   - Expected Average: ($875 + $900) / 10 = $177.50
   - Holding: 10 @ $177.50

3. **Verify**: Portfolio shows correct average price

---

## 5️⃣ Test Watchlist

### Add to Watchlist

1. Navigate to **Watchlist**
2. Search for: **GOOGL**
3. Click **"Add"** button
4. **Expected**:
   - ✓ Success notification
   - ✓ GOOGL appears in watchlist table
   - ✓ Shows live price and change

### Remove from Watchlist

1. Find GOOGL in watchlist
2. Click **X** (remove) button
3. **Expected**:
   - ✓ Confirmation or immediate removal
   - ✓ GOOGL disappears from list

### Verify Live Prices

1. Add multiple stocks to watchlist
2. **Verify**: Each shows current price
3. **Verify**: Change % is color-coded (green/red)
4. **Verify**: Volume displays correctly

---

## 6️⃣ Test Transaction History

### Verify Completeness

1. Navigate to **Transactions**
2. **Verify**: All your BUY/SELL transactions appear
3. **Check Each Transaction**:
   - ✓ Date and time are correct
   - ✓ Type badge (BUY/SELL) color-coded
   - ✓ Symbol and company name
   - ✓ Quantity matches your action
   - ✓ Price at time of transaction
   - ✓ Total amount
   - ✓ Balance After shows post-transaction balance

### Test Summary Stats

1. Look at top summary cards
2. **Verify**:
   - ✓ Total Transactions count is correct
   - ✓ Total Bought sum is accurate
   - ✓ Total Sold sum is accurate
   - ✓ Net Investment calculation correct

---

## 7️⃣ Test Real-Time Price Updates

### Manual Refresh Test

1. Note current price of a stock in Portfolio
2. Wait 60 seconds (cache expiry)
3. Refresh the page
4. **Expected**: Price updates if market moved
5. **Verify**: Change % reflects new price

---

## 8️⃣ Test Error Handling

### Invalid Stock Symbol

1. Try to buy: **XXXXX** (doesn't exist)
2. **Expected**: Error "Invalid stock symbol"

### Rate Limiting

1. Make multiple rapid searches/quotes
2. After ~8 requests in a minute
3. **Expected**: Error "Rate limit exceeded. Wait X seconds"
4. Wait 60 seconds
5. **Verify**: Can make requests again

### Network Errors

1. Disconnect internet
2. Try to search stocks
3. **Expected**: Error message (not crash)
4. Reconnect internet
5. **Verify**: App works again

---

## 9️⃣ Test Data Consistency

### Balance Integrity

1. Note starting balance: `$B`
2. Buy stock: Cost `$C`
3. **Verify**: New balance = `$B - $C`
4. Sell stock: Proceeds `$P`
5. **Verify**: Final balance = `$B - $C + $P`

### Holdings Accuracy

1. Buy 10 shares of AAPL
2. **Verify**: Portfolio shows 10 shares
3. Buy 5 more shares
4. **Verify**: Portfolio shows 15 shares
5. Sell 8 shares
6. **Verify**: Portfolio shows 7 shares

### Transaction Log

1. Perform: BUY 10 AAPL, SELL 5 AAPL
2. **Verify**: Both transactions in history
3. **Verify**: Timestamps in correct order
4. **Verify**: Balance After in transaction 2 > transaction 1

---

## 🔟 Test Edge Cases

### Concurrent Transactions

1. Open two browser tabs
2. Try to buy in both simultaneously
3. **Expected**: One succeeds, one may fail if insufficient balance
4. **Verify**: No negative balance
5. **Verify**: Holdings match balance deductions

### Decimal Precision

1. Buy stock with odd price (e.g., $123.456789)
2. **Verify**: Calculations use correct precision
3. **Verify**: No rounding errors in balance
4. **Verify**: Average price calculates correctly

### Zero Balance

1. Spend all money
2. Try to buy any stock
3. **Expected**: "Insufficient balance" error

---

## ✅ Testing Checklist

Use this to track your testing progress:

### Phase 3 - Core API & Server Actions
- [ ] Stock search works (multiple queries)
- [ ] Stock quote displays real-time price
- [ ] Buy stock (successful purchase)
- [ ] Buy stock (insufficient balance error)
- [ ] Sell stock (successful sale)
- [ ] Sell stock (insufficient shares error)
- [ ] Average price calculates correctly
- [ ] Watchlist add works
- [ ] Watchlist remove works
- [ ] Watchlist shows live prices
- [ ] Transaction history accurate
- [ ] Transaction summary stats correct
- [ ] Balance updates correctly
- [ ] Holdings update correctly
- [ ] Rate limiting works
- [ ] Error messages clear and helpful
- [ ] No crashes on errors
- [ ] Data consistency maintained

### Integration Tests
- [ ] End-to-end: Sign up → Buy → Sell → Sign out
- [ ] Balance integrity across operations
- [ ] Holdings match transaction log
- [ ] Average price persists correctly
- [ ] Real-time prices refresh
- [ ] Page navigation doesn't lose data

---

## 🐛 Common Issues & Solutions

### "Environment variable validation failed"
**Solution**: Check `.env` file has all required variables

### "Rate limit exceeded"
**Solution**: Wait 60 seconds between API-heavy operations

### "Invalid stock symbol"
**Solution**: Use valid ticker symbols (AAPL, GOOGL, MSFT, etc.)

### Prices not updating
**Solution**: Clear cache or wait 60 seconds for cache expiry

### Transaction doesn't appear
**Solution**: Refresh page - may need path revalidation

---

## 📊 Expected Results Summary

After complete testing, you should see:
- ✅ Successful stock purchases
- ✅ Accurate balance tracking
- ✅ Correct holdings with average price
- ✅ Complete transaction history
- ✅ Working watchlist with live prices
- ✅ Real-time data from TwelveData
- ✅ Proper error handling
- ✅ Data consistency across all operations

---

## 🎯 Next Steps

Once Phase 3 testing is complete:
1. **Phase 4**: UI Components (already implemented)
2. **Phase 5**: Deployment optimizations
3. **Production**: Deploy to Vercel

---

**Happy Testing!** 🚀

If you find any issues, check:
1. Browser console for errors
2. Network tab for failed requests
3. `.env` file configuration
4. TwelveData API key validity

