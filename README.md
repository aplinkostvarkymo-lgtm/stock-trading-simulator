# Stock Trading Simulator

A professional-grade stock trading simulator built with Next.js 15, featuring real-time market data, secure authentication, and a modern trading terminal interface.

## 🚀 Features

- **Real-Time Stock Data**: Live prices and market data from TwelveData API
- **Secure Authentication**: Email/password and Google OAuth via Auth.js v5
- **Portfolio Management**: Track holdings, performance, and gain/loss
- **Trading Interface**: Buy and sell stocks with real-time balance updates
- **Transaction History**: Complete audit trail of all trades
- **Watchlist**: Monitor favorite stocks with live price updates
- **Responsive Design**: Trading terminal aesthetic with dark theme
- **Type-Safe**: Full TypeScript implementation with Prisma

## 📋 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS
- **Database**: Neon Postgres with Prisma ORM
- **Authentication**: Auth.js v5 (NextAuth)
- **Market Data**: TwelveData API
- **Charts**: Recharts
- **Validation**: Zod
- **Date Handling**: date-fns
- **Icons**: Lucide React

## 🛠️ Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database (Neon recommended)
- TwelveData API key (free tier available)
- Google OAuth credentials (optional)

## 📦 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd stock-trading-simulator
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Auth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="" # Generate with: openssl rand -base64 32

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# TwelveData API
TWELVEDATA_API_KEY=""

# App Configuration
INITIAL_BALANCE="100000"
```

### 4. Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### 5. Set up database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed database with test data
npx prisma db seed
```

### 6. Run development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 API Keys Setup

### TwelveData API

1. Sign up at [twelvedata.com](https://twelvedata.com/)
2. Get your free API key (8 requests/minute)
3. Add to `.env` as `TWELVEDATA_API_KEY`

### Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Add credentials to `.env`

### Neon Postgres

1. Sign up at [neon.tech](https://neon.tech/)
2. Create a new project
3. Copy connection string to `.env` as `DATABASE_URL`

## 🏗️ Project Structure

```
.
├── app/
│   ├── actions/          # Server Actions
│   │   ├── auth.ts       # Authentication actions
│   │   ├── trade.ts      # Trading actions
│   │   └── watchlist.ts  # Watchlist actions
│   ├── api/              # API Routes
│   │   ├── auth/         # Auth.js routes
│   │   └── stocks/       # Stock API routes
│   ├── auth/             # Authentication pages
│   │   ├── signin/
│   │   └── signup/
│   ├── dashboard/        # Dashboard pages
│   │   ├── portfolio/
│   │   ├── trade/
│   │   ├── transactions/
│   │   └── watchlist/
│   ├── error.tsx         # Global error boundary
│   ├── layout.tsx        # Root layout
│   ├── not-found.tsx     # 404 page
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── PriceDisplay.tsx
│   │   └── StockCard.tsx
│   └── StockChart.tsx    # Chart component
├── lib/
│   ├── env.ts            # Environment validation
│   ├── logger.ts         # Logging utility
│   ├── prisma.ts         # Prisma singleton
│   └── stock-api.ts      # TwelveData client
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── types/
│   └── next-auth.d.ts    # Auth types
├── auth.config.ts        # Auth configuration
├── auth.ts               # Auth.js setup
├── middleware.ts         # Route protection
├── next.config.js        # Next.js config
├── tailwind.config.ts    # Tailwind config
└── tsconfig.json         # TypeScript config
```

## 🗄️ Database Schema

### Models

- **User**: Authentication and balance
- **Account**: OAuth provider data
- **Session**: JWT session management
- **Holding**: Stock positions with average price
- **Transaction**: Complete audit trail (BUY/SELL)
- **Watchlist**: Favorite stocks

## 🔒 Security Features

- ✅ Password hashing with bcryptjs (10 rounds)
- ✅ JWT sessions (stateless, Edge-compatible)
- ✅ Environment variable validation (Zod)
- ✅ Server-side input validation
- ✅ SQL injection prevention (Prisma)
- ✅ CSRF protection (Server Actions)
- ✅ Route protection (Middleware)
- ✅ Rate limiting ready

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Set build command: `npx prisma generate && next build`
5. Deploy

### Environment Variables for Production

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secure-secret"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
TWELVEDATA_API_KEY="..."
INITIAL_BALANCE="100000"
```

## 📊 Usage

1. **Sign Up**: Create an account with email/password or Google
2. **Initial Balance**: Start with $100,000 virtual capital
3. **Search Stocks**: Find stocks by symbol or company name
4. **Place Orders**: Buy and sell stocks at real-time prices
5. **Track Portfolio**: Monitor holdings and performance
6. **View History**: Check all past transactions
7. **Watchlist**: Keep track of favorite stocks

## 🧪 Testing

### Test User Credentials

If you ran the seed script:
- Email: `test@example.com`
- Password: `password123`

### Manual Testing Flow

1. Sign up → Sign in
2. Search for stock (e.g., "AAPL")
3. Buy 10 shares
4. Check portfolio
5. Sell 5 shares
6. View transaction history
7. Add stock to watchlist

## 🔧 Development

### Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Push schema without migration
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Seed database
npx prisma db seed
```

### Build for Production

```bash
npm run build
npm start
```

## 📝 API Rate Limits

- **TwelveData Free Tier**: 8 requests/minute
- Implemented request queuing and retry logic
- Caching enabled for search results (5 min)
- Quote caching (60 seconds)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Market data powered by [TwelveData](https://twelvedata.com/)
- Authentication by [Auth.js](https://authjs.dev/)
- Database hosting by [Neon](https://neon.tech/)
- Deployed on [Vercel](https://vercel.com/)

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the implementation plan (`implementation-plan.md`)

---

**Built with ❤️ using Next.js 15 and modern web technologies**

#   s t o c k - t r a d i n g - s i m u l a t o r  
 