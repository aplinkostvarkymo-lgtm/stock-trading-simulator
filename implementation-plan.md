# Stock Trading Simulator - Implementation Plan

## Project Overview
A professional-grade Stock Trading Simulator built with Next.js 15 (App Router), Tailwind CSS, Prisma (Neon Postgres), and Auth.js v5. This application will provide real-time stock trading simulation with authentic market data, secure authentication, and a modern trading terminal interface.

## Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
- **Backend**: Next.js Server Actions, API Routes
- **Database**: Neon Postgres with Prisma ORM
- **Authentication**: Auth.js v5 (NextAuth)
- **Market Data**: TwelveData API
- **Deployment**: Vercel

## Core Principles
- ✅ Real API integration (TwelveData)
- ✅ Secure environment variable handling
- ✅ Type-safe database operations with Prisma
- ✅ Server-side validation for all transactions
- ✅ Optimistic UI updates with proper error handling
- ❌ NO hardcoded credentials
- ❌ NO mock/simulated data
- ❌ NO placeholder functions

---

## Phase 1: Infrastructure & Security Setup

### 1.1 Project Initialization & Dependencies

#### Files to Create:
- `package.json` (with all required dependencies)
- `.env.example` (template for environment variables)
- `.gitignore` (exclude sensitive files)
- `next.config.js` (Next.js configuration)
- `tailwind.config.ts` (Tailwind configuration with trading theme)
- `tsconfig.json` (TypeScript configuration)

#### Dependencies Required:
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@prisma/client": "^5.0.0",
    "next-auth": "^5.0.0-beta",
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.0",
    "date-fns": "^3.0.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/bcryptjs": "^2.4.6",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### 1.2 Environment Variables & Validation

#### File: `.env.example`
```env
# Database
DATABASE_URL="postgresql://..."

# Auth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="" # Generate with: openssl rand -base64 32

# OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# TwelveData API
TWELVEDATA_API_KEY=""

# App Configuration
INITIAL_BALANCE="100000"
```

#### File: `lib/env.ts`
**Purpose**: Validate all environment variables at startup using Zod
**Logic**:
- Define Zod schema for all required env variables
- Parse and validate `process.env` on app initialization
- Throw descriptive errors if any variable is missing or invalid
- Export typed environment object for use across the app
- Ensure no runtime errors due to missing configuration

### 1.3 Prisma Singleton & Database Connection

#### File: `lib/prisma.ts`
**Purpose**: Create a singleton Prisma client to prevent connection pool exhaustion
**Logic**:
- Check if Prisma client exists in global scope (for hot reload in development)
- Create new PrismaClient only if it doesn't exist
- Store instance in `globalThis` during development
- Export single instance for use across the application
- Handle connection errors gracefully
- Log connection status in development mode

**Implementation Pattern**:
```typescript
// Singleton pattern with global caching for dev
// Prevents "too many clients" error in Next.js dev mode
// Production creates single instance per deployment
```

### 1.4 Auth.js Configuration

#### File: `auth.config.ts`
**Purpose**: Centralized Auth.js configuration for use in both middleware and route handlers
**Logic**:
- Define session strategy as "jwt" (for Edge compatibility)
- Configure session max age (30 days)
- Export configuration object for reuse

#### File: `auth.ts`
**Purpose**: Main Auth.js setup with providers and callbacks
**Logic**:
- **Credentials Provider**:
  - Accept email and password
  - Query user from database via Prisma
  - Verify password using bcryptjs
  - Return user object or null
- **Google Provider**:
  - Use environment variables for client ID/secret
  - Handle OAuth callback
  - Create or update user in database
- **Callbacks**:
  - `jwt()`: Add user ID and email to JWT token
  - `session()`: Attach user ID and email to session object
  - `signIn()`: Validate user before allowing sign-in
- **Pages**: Custom sign-in page at `/auth/signin`

#### File: `middleware.ts`
**Purpose**: Route protection and authentication middleware
**Logic**:
- Use Auth.js middleware to protect routes
- Define public routes: `/`, `/auth/signin`, `/auth/signup`, `/api/auth/*`
- Redirect unauthenticated users to `/auth/signin`
- Redirect authenticated users from auth pages to `/dashboard`
- Protect all `/dashboard/*` and `/api/*` routes (except auth)

---

## Phase 2: Database Schema Design

### 2.1 Prisma Schema Definition

#### File: `prisma/schema.prisma`
**Purpose**: Define complete database schema with all models and relations

#### Models & Relations:

**User Model**:
- `id`: String (cuid, primary key)
- `email`: String (unique, indexed)
- `emailVerified`: DateTime (nullable)
- `name`: String (nullable)
- `password`: String (nullable, for credentials auth)
- `image`: String (nullable)
- `balance`: Decimal (default: 100000.00) - Trading balance
- `createdAt`: DateTime (default: now)
- `updatedAt`: DateTime (updated automatically)
- **Relations**:
  - `accounts`: Account[] (for OAuth)
  - `sessions`: Session[]
  - `holdings`: Holding[]
  - `transactions`: Transaction[]
  - `watchlist`: Watchlist[]

**Account Model** (for OAuth):
- `id`: String (cuid, primary key)
- `userId`: String (foreign key)
- `type`: String (oauth, email, etc.)
- `provider`: String (google, credentials)
- `providerAccountId`: String
- `refresh_token`: String (nullable)
- `access_token`: String (nullable)
- `expires_at`: Int (nullable)
- `token_type`: String (nullable)
- `scope`: String (nullable)
- `id_token`: String (nullable)
- `session_state`: String (nullable)
- **Relations**: `user`: User
- **Unique constraint**: [provider, providerAccountId]

**Session Model**:
- `id`: String (cuid, primary key)
- `sessionToken`: String (unique, indexed)
- `userId`: String (foreign key)
- `expires`: DateTime
- **Relations**: `user`: User

**Holding Model**:
- `id`: String (cuid, primary key)
- `userId`: String (foreign key, indexed)
- `symbol`: String (stock ticker, e.g., "AAPL")
- `companyName`: String
- `quantity`: Int (number of shares)
- `averagePrice`: Decimal (average purchase price per share)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Relations**: `user`: User
- **Unique constraint**: [userId, symbol]
- **Indexes**: [userId], [symbol]

**Transaction Model**:
- `id`: String (cuid, primary key)
- `userId`: String (foreign key, indexed)
- `type`: Enum (BUY, SELL)
- `symbol`: String (stock ticker)
- `companyName`: String
- `quantity`: Int (number of shares)
- `price`: Decimal (price per share at transaction)
- `total`: Decimal (total transaction amount)
- `balanceAfter`: Decimal (user balance after transaction)
- `timestamp`: DateTime (default: now, indexed)
- **Relations**: `user`: User
- **Indexes**: [userId], [timestamp], [symbol]

**Watchlist Model**:
- `id`: String (cuid, primary key)
- `userId`: String (foreign key, indexed)
- `symbol`: String (stock ticker)
- `companyName`: String
- `addedAt`: DateTime (default: now)
- **Relations**: `user`: User
- **Unique constraint**: [userId, symbol]
- **Indexes**: [userId]

**Enums**:
- `TransactionType`: BUY, SELL

### 2.2 Database Initialization Scripts

#### File: `prisma/seed.ts`
**Purpose**: Optional seed script for testing (NOT for production)
**Logic**:
- Create test user with hashed password
- Set initial balance
- Can be run with `npx prisma db seed`

#### Commands to Run:
```bash
# Initialize Prisma
npx prisma init --datasource-provider postgresql

# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Push schema to database (for development)
npx prisma db push
```

---

## Phase 3: Core API & Server Actions

### 3.1 TwelveData API Integration

#### File: `lib/stock-api.ts`
**Purpose**: Centralized API client for TwelveData with error handling and rate limiting
**Logic**:

**Functions to Implement**:

1. **`searchStocks(query: string)`**:
   - Endpoint: `/symbol_search`
   - Validates query is not empty
   - Returns array of stock symbols matching query
   - Includes symbol, name, exchange, type
   - Handles API errors and returns empty array on failure
   - Caches results for 5 minutes

2. **`getStockQuote(symbol: string)`**:
   - Endpoint: `/quote`
   - Fetches real-time price for a single stock
   - Returns: symbol, name, price, change, changePercent, volume, timestamp
   - Validates symbol format (uppercase, 1-5 chars)
   - Throws error if symbol not found
   - Implements retry logic (max 3 attempts)

3. **`getBatchQuotes(symbols: string[])`**:
   - Endpoint: `/quote` with comma-separated symbols
   - Fetches quotes for multiple stocks in one request
   - Returns Map<symbol, quote>
   - Handles partial failures (some symbols invalid)
   - Maximum 10 symbols per request

4. **`getTimeSeries(symbol: string, interval: string, outputSize: number)`**:
   - Endpoint: `/time_series`
   - Fetches historical price data
   - Intervals: 1min, 5min, 15min, 1h, 1day
   - Returns array of {datetime, open, high, low, close, volume}
   - Used for charts

5. **Error Handling**:
   - Network errors: Retry with exponential backoff
   - Rate limit (8 API calls/minute): Queue requests
   - Invalid API key: Throw descriptive error
   - Invalid symbol: Return null or throw
   - Log all errors to console in development

6. **Caching Strategy**:
   - Use Next.js cache for `getStockQuote` (revalidate: 60s)
   - Cache search results for 5 minutes
   - No caching for batch quotes (real-time data)

### 3.2 Server Actions for Trading Operations

#### File: `app/actions/trade.ts`
**Purpose**: Secure server-side functions for buying and selling stocks

**Function: `buyStock(data)`**:
- **Input Validation** (using Zod):
  - `symbol`: String, uppercase, 1-5 chars, required
  - `quantity`: Integer, min: 1, max: 10000, required
- **Logic**:
  1. Get authenticated user session (Auth.js)
  2. If no session, return error: "Unauthorized"
  3. Fetch current stock price from TwelveData API
  4. If stock not found, return error: "Invalid symbol"
  5. Calculate total cost: `price * quantity`
  6. Query user's current balance from database
  7. Check if balance >= total cost
  8. If insufficient funds, return error: "Insufficient balance"
  9. Start Prisma transaction:
     - Deduct total cost from user balance
     - Create Transaction record (type: BUY)
     - Upsert Holding record:
       - If holding exists: Update quantity and average price
       - If new: Create holding with quantity and current price
  10. Commit transaction
  11. Return success with updated balance and holding
- **Error Handling**:
  - Catch all errors and rollback transaction
  - Return descriptive error messages
  - Log errors to console

**Function: `sellStock(data)`**:
- **Input Validation**:
  - `symbol`: String, uppercase, required
  - `quantity`: Integer, min: 1, required
- **Logic**:
  1. Get authenticated user session
  2. If no session, return error: "Unauthorized"
  3. Fetch current stock price from TwelveData API
  4. Query user's holding for this symbol
  5. If no holding or quantity > holding.quantity:
     - Return error: "Insufficient shares"
  6. Calculate total proceeds: `price * quantity`
  7. Start Prisma transaction:
     - Add proceeds to user balance
     - Create Transaction record (type: SELL)
     - Update Holding:
       - If quantity = holding.quantity: Delete holding
       - Else: Reduce holding.quantity
  8. Commit transaction
  9. Return success with updated balance
- **Error Handling**: Same as buyStock

**Function: `getPortfolioValue()`**:
- **Logic**:
  1. Get authenticated user session
  2. Fetch all user holdings from database
  3. Extract unique symbols
  4. Fetch batch quotes for all symbols
  5. Calculate total value: Sum of (quantity * currentPrice)
  6. Calculate total gain/loss: totalValue - (quantity * averagePrice)
  7. Return portfolio summary

### 3.3 Server Actions for Watchlist

#### File: `app/actions/watchlist.ts`

**Function: `addToWatchlist(symbol, companyName)`**:
- Validate symbol exists via API
- Create watchlist entry for user
- Handle duplicate entries gracefully

**Function: `removeFromWatchlist(symbol)`**:
- Delete watchlist entry
- Return success/failure

**Function: `getWatchlist()`**:
- Fetch all user watchlist items
- Get current prices for all symbols
- Return array with live data

### 3.4 API Routes

#### File: `app/api/stocks/search/route.ts`
**Purpose**: Search endpoint for stock symbols
- **GET** request with query parameter
- Call `searchStocks()` from stock-api
- Return JSON response
- Requires authentication

#### File: `app/api/stocks/quote/[symbol]/route.ts`
**Purpose**: Get quote for a specific symbol
- **GET** request with symbol in path
- Call `getStockQuote()` from stock-api
- Return JSON response
- Requires authentication

---

## Phase 4: Main UI Components

### 4.1 Design System & Tailwind Configuration

#### File: `tailwind.config.ts`
**Purpose**: Trading terminal aesthetic with dark theme
**Configuration**:
- **Colors**:
  - `terminal-bg`: #0a0e27 (dark navy)
  - `terminal-surface`: #141b34
  - `terminal-border`: #1e293b
  - `terminal-text`: #e2e8f0
  - `terminal-muted`: #64748b
  - `success-green`: #10b981
  - `danger-red`: #ef4444
  - `warning-yellow`: #f59e0b
  - `accent-blue`: #3b82f6
- **Fonts**: 
  - `mono`: ['JetBrains Mono', 'Fira Code', 'monospace']
- **Animations**:
  - `pulse-price`: Custom animation for price updates
  - `slide-in`: For notifications

#### File: `app/globals.css`
**Purpose**: Global styles and custom CSS
**Styles**:
- Dark theme by default
- Custom scrollbar styling
- Trading terminal grid patterns
- Glow effects for active elements
- Price change animations (green up, red down)

### 4.2 Authentication Pages

#### File: `app/auth/signin/page.tsx`
**Purpose**: Sign-in page with multiple auth methods
**Components**:
- Email/password form
- Google OAuth button
- Link to sign-up page
- Form validation with error display
- Redirect to dashboard on success

#### File: `app/auth/signup/page.tsx`
**Purpose**: User registration page
**Components**:
- Registration form (name, email, password, confirm password)
- Client-side validation
- Server action for user creation
- Hash password with bcryptjs before storing
- Auto sign-in after registration
- Link to sign-in page

### 4.3 Dashboard Layout

#### File: `app/dashboard/layout.tsx`
**Purpose**: Main dashboard layout with navigation
**Components**:
- **Sidebar**:
  - Logo/Brand
  - Navigation links: Dashboard, Portfolio, Transactions, Watchlist
  - User profile dropdown
  - Sign out button
- **Header**:
  - Current balance display (with real-time update)
  - Portfolio value
  - Search bar for stocks
  - Notifications icon
- **Main Content Area**: 
  - Renders child pages
  - Uses grid layout for responsive design

**Styling**: Trading terminal aesthetic with neon accents

### 4.4 Dashboard Home Page

#### File: `app/dashboard/page.tsx`
**Purpose**: Main dashboard with portfolio overview and trading interface
**Layout**: Grid layout with multiple sections

**Sections**:

1. **Portfolio Summary Card**:
   - Total portfolio value
   - Cash balance
   - Total gain/loss (with percentage)
   - Change indicator (up/down arrows)
   - Color-coded: green for gains, red for losses

2. **Quick Stats Grid**:
   - Number of holdings
   - Total invested
   - Best performing stock
   - Worst performing stock
   - Today's change

3. **Top Holdings Table** (Top 5):
   - Columns: Symbol, Name, Quantity, Avg Price, Current Price, Total Value, Gain/Loss
   - Real-time price updates
   - Click to view details
   - Sortable columns

4. **Recent Transactions** (Last 10):
   - Timestamp
   - Type (BUY/SELL with color coding)
   - Symbol
   - Quantity
   - Price
   - Total
   - Scrollable list

5. **Market Movers** (Optional):
   - Trending stocks
   - Top gainers
   - Top losers

### 4.5 Stock Search & Trading Interface

#### File: `app/dashboard/trade/page.tsx`
**Purpose**: Search and trade stocks
**Components**:

1. **Search Bar**:
   - Real-time search as user types
   - Debounced API calls (300ms)
   - Dropdown with search results
   - Displays: symbol, company name, exchange
   - Click to select stock

2. **Stock Details Card**:
   - Company name and symbol
   - Current price (large, prominent)
   - Change and change percentage
   - Volume, Market cap
   - 52-week high/low
   - Mini price chart (today's movement)

3. **Trading Panel**:
   - Tab switcher: BUY / SELL
   - Quantity input
   - Price display (live)
   - Total cost/proceeds calculation
   - Available balance/shares display
   - Validation messages
   - Execute button (disabled if invalid)
   - Confirmation dialog before execution

4. **Order Confirmation Modal**:
   - Review order details
   - Confirm or cancel
   - Loading state during execution
   - Success/error toast notification

### 4.6 Portfolio Page

#### File: `app/dashboard/portfolio/page.tsx`
**Purpose**: Detailed portfolio view with charts
**Components**:

1. **Portfolio Chart**:
   - Line chart showing portfolio value over time
   - Time range selector: 1D, 1W, 1M, 3M, 1Y, ALL
   - Uses Recharts library
   - Responsive and interactive

2. **Holdings Table** (All holdings):
   - Columns: Symbol, Name, Quantity, Avg Price, Current Price, Total Value, Gain/Loss, Gain/Loss %, Actions
   - Real-time price updates (WebSocket or polling every 30s)
   - Color-coded gain/loss
   - Actions: Trade, Add to Watchlist, Remove
   - Search and filter functionality
   - Export to CSV option

3. **Allocation Pie Chart**:
   - Visual representation of portfolio distribution
   - Click segment to highlight in table

4. **Performance Metrics**:
   - Total return
   - Annualized return
   - Best/worst performing stock
   - Average position size

### 4.7 Transaction History Page

#### File: `app/dashboard/transactions/page.tsx`
**Purpose**: Complete transaction history
**Components**:

1. **Filters**:
   - Date range picker
   - Transaction type (BUY/SELL/ALL)
   - Symbol search
   - Reset filters button

2. **Transactions Table**:
   - Columns: Date, Type, Symbol, Name, Quantity, Price, Total, Balance After
   - Pagination (20 per page)
   - Sortable by all columns
   - Color-coded type badges
   - Export to CSV

3. **Transaction Summary**:
   - Total transactions
   - Total bought
   - Total sold
   - Net investment

### 4.8 Watchlist Page

#### File: `app/dashboard/watchlist/page.tsx`
**Purpose**: Track favorite stocks
**Components**:

1. **Add to Watchlist**:
   - Search bar with autocomplete
   - Add button

2. **Watchlist Table**:
   - Columns: Symbol, Name, Price, Change, Change %, Volume, Actions
   - Real-time price updates
   - Color-coded price changes
   - Actions: Trade, Remove
   - Drag to reorder (optional)

3. **Quick Trade**:
   - Click symbol to open trading modal
   - Inline trading without leaving page

### 4.9 Reusable Components

#### File: `components/ui/StockCard.tsx`
**Purpose**: Reusable stock display card
**Props**: symbol, name, price, change, changePercent
**Styling**: Card with terminal aesthetic

#### File: `components/ui/PriceDisplay.tsx`
**Purpose**: Animated price display
**Features**:
- Flashes green on price increase
- Flashes red on price decrease
- Smooth number transitions

#### File: `components/ui/LoadingSpinner.tsx`
**Purpose**: Loading indicator
**Styling**: Terminal-themed spinner

#### File: `components/ui/Toast.tsx`
**Purpose**: Notification system
**Types**: success, error, warning, info
**Features**: Auto-dismiss, closable, stacked

#### File: `components/ui/Modal.tsx`
**Purpose**: Reusable modal component
**Features**: Backdrop, close on ESC, responsive

#### File: `components/ui/Button.tsx`
**Purpose**: Styled button component
**Variants**: primary, secondary, danger, success, ghost
**Sizes**: sm, md, lg

#### File: `components/StockChart.tsx`
**Purpose**: Interactive stock chart using Recharts
**Features**:
- Line chart with gradient fill
- Tooltip with price and timestamp
- Zoom and pan
- Responsive

---

## Phase 5: Deployment & Middleware

### 5.1 Production Optimizations

#### File: `next.config.js`
**Optimizations**:
```javascript
{
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [], // Add CDN domains if needed
    formats: ['image/webp', 'image/avif']
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
}
```

### 5.2 Middleware Enhancements

#### File: `middleware.ts` (Enhanced)
**Additional Logic**:
- Rate limiting for API routes (prevent abuse)
- CORS headers for API routes
- Security headers (CSP, X-Frame-Options, etc.)
- Request logging in production
- Geo-blocking if needed

**Protected Routes**:
- `/dashboard/*` - Requires authentication
- `/api/stocks/*` - Requires authentication
- `/api/trade/*` - Requires authentication

**Public Routes**:
- `/` - Landing page
- `/auth/*` - Authentication pages
- `/api/auth/*` - Auth.js routes

### 5.3 Environment Variables for Production

#### Vercel Environment Variables:
- `DATABASE_URL` - Neon Postgres connection string
- `NEXTAUTH_URL` - Production URL (https://yourdomain.com)
- `NEXTAUTH_SECRET` - Secure random string
- `GOOGLE_CLIENT_ID` - Google OAuth credentials
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `TWELVEDATA_API_KEY` - TwelveData API key
- `INITIAL_BALANCE` - Default user balance (100000)

### 5.4 Error Handling & Logging

#### File: `lib/logger.ts`
**Purpose**: Centralized logging utility
**Features**:
- Log levels: debug, info, warn, error
- Production: Send errors to monitoring service (optional: Sentry)
- Development: Console logs with colors
- Log request/response for debugging

#### File: `app/error.tsx`
**Purpose**: Global error boundary
**Features**:
- Catch React errors
- Display user-friendly error message
- Log error details
- Retry button

#### File: `app/not-found.tsx`
**Purpose**: Custom 404 page
**Features**:
- Trading terminal themed
- Navigation back to dashboard

### 5.5 Performance Optimization

**Strategies**:
1. **Code Splitting**:
   - Use dynamic imports for heavy components
   - Lazy load charts and tables

2. **Image Optimization**:
   - Use Next.js Image component
   - Serve images in WebP format

3. **API Optimization**:
   - Implement request caching
   - Use batch requests where possible
   - Implement pagination for large datasets

4. **Database Optimization**:
   - Add indexes to frequently queried columns
   - Use connection pooling (configured in DATABASE_URL)
   - Implement database query caching

5. **Client-Side Optimization**:
   - Minimize JavaScript bundle size
   - Use React.memo for expensive components
   - Implement virtual scrolling for large lists

### 5.6 Testing Strategy

**Types of Testing**:
1. **Unit Tests** (Optional):
   - Test utility functions
   - Test server actions
   - Use Jest + React Testing Library

2. **Integration Tests**:
   - Test API routes
   - Test authentication flow
   - Test trading operations

3. **End-to-End Tests** (Optional):
   - Use Playwright or Cypress
   - Test critical user flows:
     - Sign up → Sign in → Buy stock → Sell stock → Sign out

### 5.7 Deployment Checklist

**Pre-Deployment**:
- ✅ All environment variables configured
- ✅ Database schema pushed to production
- ✅ Auth.js providers tested
- ✅ TwelveData API key validated
- ✅ Error handling implemented
- ✅ Security headers configured

**Vercel Deployment**:
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set up Neon Postgres database
4. Configure build settings:
   - Build Command: `npx prisma generate && next build`
   - Output Directory: `.next`
5. Deploy to production

**Post-Deployment**:
- ✅ Test authentication flow
- ✅ Test stock search
- ✅ Execute test buy/sell transactions
- ✅ Verify real-time price updates
- ✅ Check error logging
- ✅ Test on multiple devices

---

## Phase-by-Phase File Summary

### Phase 1 Files (Infrastructure):
1. `package.json` - Dependencies
2. `.env.example` - Environment template
3. `.gitignore` - Exclude sensitive files
4. `next.config.js` - Next.js config
5. `tailwind.config.ts` - Tailwind theme
6. `tsconfig.json` - TypeScript config
7. `lib/env.ts` - Environment validation
8. `lib/prisma.ts` - Prisma singleton
9. `auth.config.ts` - Auth config
10. `auth.ts` - Auth setup
11. `middleware.ts` - Route protection

### Phase 2 Files (Database):
1. `prisma/schema.prisma` - Database schema
2. `prisma/seed.ts` - Seed script (optional)

### Phase 3 Files (API & Actions):
1. `lib/stock-api.ts` - TwelveData client
2. `app/actions/trade.ts` - Trading server actions
3. `app/actions/watchlist.ts` - Watchlist actions
4. `app/api/stocks/search/route.ts` - Search API
5. `app/api/stocks/quote/[symbol]/route.ts` - Quote API

### Phase 4 Files (UI):
1. `app/globals.css` - Global styles
2. `app/auth/signin/page.tsx` - Sign-in page
3. `app/auth/signup/page.tsx` - Sign-up page
4. `app/dashboard/layout.tsx` - Dashboard layout
5. `app/dashboard/page.tsx` - Dashboard home
6. `app/dashboard/trade/page.tsx` - Trading interface
7. `app/dashboard/portfolio/page.tsx` - Portfolio page
8. `app/dashboard/transactions/page.tsx` - Transactions page
9. `app/dashboard/watchlist/page.tsx` - Watchlist page
10. `components/ui/StockCard.tsx` - Stock card component
11. `components/ui/PriceDisplay.tsx` - Price display component
12. `components/ui/LoadingSpinner.tsx` - Loading component
13. `components/ui/Toast.tsx` - Notification component
14. `components/ui/Modal.tsx` - Modal component
15. `components/ui/Button.tsx` - Button component
16. `components/StockChart.tsx` - Chart component

### Phase 5 Files (Deployment):
1. `lib/logger.ts` - Logging utility
2. `app/error.tsx` - Error boundary
3. `app/not-found.tsx` - 404 page

---

## Implementation Order

### Week 1: Foundation
- Days 1-2: Phase 1 (Infrastructure & Security)
- Days 3-4: Phase 2 (Database Schema)
- Day 5: Testing infrastructure and database

### Week 2: Backend
- Days 1-3: Phase 3 (Core API & Server Actions)
- Days 4-5: Testing API integration and server actions

### Week 3: Frontend
- Days 1-2: Authentication pages and dashboard layout
- Days 3-5: Phase 4 (Main UI Components)

### Week 4: Polish & Deploy
- Days 1-2: Bug fixes and optimizations
- Day 3: Phase 5 (Deployment & Middleware)
- Days 4-5: Testing and production deployment

---

## Key Technical Decisions

### 1. Why Server Actions over API Routes?
- **Type Safety**: Direct function calls with TypeScript
- **Less Boilerplate**: No need to handle HTTP methods
- **Automatic Security**: CSRF protection built-in
- **Better DX**: Easier to use with forms and mutations

### 2. Why JWT Sessions over Database Sessions?
- **Edge Compatibility**: Works with Vercel Edge Functions
- **Better Performance**: No database query for each request
- **Stateless**: Easier to scale horizontally

### 3. Why Prisma over Raw SQL?
- **Type Safety**: Auto-generated types for models
- **Migrations**: Easy schema versioning
- **Relations**: Simplified complex queries
- **Connection Pooling**: Built-in for serverless

### 4. Why TwelveData over Alpha Vantage?
- **Better Free Tier**: 8 requests/minute vs 5/minute
- **More Reliable**: Better uptime and data quality
- **Batch Requests**: Fetch multiple quotes at once
- **WebSocket Support**: Real-time data (premium)

---

## Security Considerations

### 1. Authentication
- ✅ Passwords hashed with bcryptjs (10 rounds)
- ✅ JWT tokens signed with secure secret
- ✅ OAuth 2.0 for Google authentication
- ✅ Session expiration (30 days)

### 2. Authorization
- ✅ All server actions check user session
- ✅ User can only access their own data
- ✅ Middleware protects all dashboard routes

### 3. Input Validation
- ✅ Zod schemas for all inputs
- ✅ Server-side validation (never trust client)
- ✅ SQL injection prevention (Prisma parameterized queries)

### 4. API Security
- ✅ API keys stored in environment variables
- ✅ Rate limiting to prevent abuse
- ✅ CORS configured correctly
- ✅ Error messages don't leak sensitive info

### 5. Database Security
- ✅ Connection string encrypted
- ✅ Neon Postgres with SSL
- ✅ Row-level security (implicit via user ID)
- ✅ Regular backups (Neon auto-backup)

---

## Success Metrics

### Functional Requirements:
- ✅ Users can register and sign in
- ✅ Users can search for real stocks
- ✅ Users can buy stocks with sufficient balance
- ✅ Users can sell stocks they own
- ✅ Portfolio reflects real-time prices
- ✅ Transaction history is accurate
- ✅ Watchlist tracks favorite stocks

### Non-Functional Requirements:
- ✅ Page load time < 2 seconds
- ✅ API response time < 500ms
- ✅ Mobile responsive design
- ✅ Accessible (WCAG 2.1 AA)
- ✅ 99% uptime on Vercel
- ✅ Secure against common vulnerabilities

---

## Future Enhancements (Post-MVP)

### Phase 6: Advanced Features
1. **Real-Time Price Updates**: WebSocket integration
2. **Limit Orders**: Buy/sell at specific price
3. **Stop Loss**: Auto-sell when price drops
4. **Portfolio Analytics**: Detailed performance metrics
5. **Social Features**: Follow other traders, leaderboard
6. **News Feed**: Stock-specific news from API
7. **Notifications**: Email/push for price alerts
8. **Mobile App**: React Native version
9. **Options Trading**: Call and put options
10. **Multiple Portfolios**: Separate strategies

### Phase 7: Gamification
1. **Achievements**: Badges for milestones
2. **Leaderboard**: Top traders by return
3. **Challenges**: Weekly trading challenges
4. **Virtual Tournaments**: Compete with others

---

## Conclusion

This implementation plan provides a comprehensive roadmap for building a professional Stock Trading Simulator. Each phase builds upon the previous, ensuring a solid foundation before adding complexity.

**Key Principles**:
- Security first (no hardcoded secrets)
- Real data only (no mocks or placeholders)
- Type safety throughout (TypeScript + Prisma + Zod)
- User experience focus (fast, responsive, intuitive)
- Production-ready code (error handling, logging, optimization)

**Estimated Timeline**: 3-4 weeks for full implementation
**Team Size**: 1-2 developers

---

## Questions for Clarification

Before starting implementation, please confirm:

1. **TwelveData API**: Do you have an API key, or should we use the free tier?
2. **Google OAuth**: Do you want to set up Google OAuth, or start with just credentials?
3. **Initial Balance**: Is $100,000 the right starting balance?
4. **Deployment**: Will you provide Vercel and Neon Postgres accounts?
5. **Features Priority**: Any features to skip or prioritize in MVP?

---

**Ready to start Phase 1 upon your approval.**

