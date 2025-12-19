# 🚀 Nustatymo Instrukcijos (Lietuviškai)

## ✅ Phase 1 Baigta!

Visos bibliotekos įdiegtos ir baziniai failai sukurti. Dabar reikia sukonfigūruoti aplinką.

## 📋 1 Žingsnis: Sukurkite .env Failą

Projekto šakniniame kataloge sukurkite failą `.env` ir nukopijuokite šį turinį:

```env
# ============================================
# DATABASE (Neon Postgres arba lokalus)
# ============================================
DATABASE_URL="postgresql://user:password@localhost:5432/tradingsim"

# ============================================
# AUTH.JS KONFIGŪRACIJA
# ============================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""

# ============================================
# GOOGLE OAUTH (Neprivaloma)
# ============================================
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ============================================
# TWELVEDATA API (Būtina)
# ============================================
TWELVEDATA_API_KEY=""

# ============================================
# APLIKACIJOS KONFIGŪRACIJA
# ============================================
INITIAL_BALANCE="100000"
NODE_ENV="development"
```

## 🔑 2 Žingsnis: Sugeneruokite NEXTAUTH_SECRET

**Windows PowerShell:**
```powershell
# Atidarykite PowerShell ir vykdykite:
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Git Bash arba Linux/Mac:**
```bash
openssl rand -base64 32
```

**Rezultatas** bus panašus į: `xK2n9mZ8pQ4rL6tY3wV5jH7dF1cB0sA9eG8hI2kM4nO=`

Nukopijuokite šį slaptažodį į `.env` faile `NEXTAUTH_SECRET="..."` vietą.

## 💾 3 Žingsnis: Neon Postgres Duomenų Bazė

### Pasirinkimas A: Neon (Rekomenduojama - Nemokama)

1. Eikite į [neon.tech](https://neon.tech/)
2. Registruokitės nemokamai
3. Sukurkite naują projektą:
   - Pavadinimas: `stock-trading-sim`
   - Pasirinkite regioną (Europa)
4. Nukopijuokite "Connection string":
   ```
   postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
5. Įdėkite į `.env` faile `DATABASE_URL="..."`

### Pasirinkimas B: Lokalus PostgreSQL

1. Įdiekite PostgreSQL
2. Sukurkite duomenų bazę:
   ```sql
   CREATE DATABASE tradingsim;
   ```
3. Nustatykite `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/tradingsim"
   ```

## 📊 4 Žingsnis: TwelveData API Raktas

1. Eikite į [twelvedata.com](https://twelvedata.com/)
2. Registruokitės nemokamai
3. Eikite į "API" skiltį
4. Nukopijuokite savo API raktą
5. Įdėkite į `.env`: `TWELVEDATA_API_KEY="jūsų_raktas"`

**Nemokama versija**: 8 užklausos per minutę (pakanka testavimui)

## 🔐 5 Žingsnis: Google OAuth (Neprivaloma)

Jei norite Google prisijungimą:

1. Eikite į [console.cloud.google.com](https://console.cloud.google.com/)
2. Sukurkite naują projektą
3. Įjunkite "Google+ API"
4. Sukurkite "OAuth 2.0 Client ID":
   - Tipas: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Nukopijuokite Client ID ir Client Secret
6. Įdėkite į `.env`:
   ```env
   GOOGLE_CLIENT_ID="jūsų_client_id"
   GOOGLE_CLIENT_SECRET="jūsų_client_secret"
   ```

**Arba** galite praleisti - veiks tik el. pašto/slaptažodžio prisijungimas.

## 🗄️ 6 Žingsnis: Inicializuokite Duomenų Bazę

Kai `.env` failas užpildytas, vykdykite:

```bash
# Sugeneruoti Prisma Client (jau atlikta per npm install)
npx prisma generate

# Sukurti lentelės duomenų bazėje
npx prisma db push

# (Neprivaloma) Užpildyti testiniais duomenimis
npx prisma db seed
```

**Testinis vartotojas** (jei vykdėte seed):
- El. paštas: `test@example.com`
- Slaptažodis: `password123`
- Balansas: $100,000

## ▶️ 7 Žingsnis: Paleiskite Programą

```bash
npm run dev
```

Atidarykite naršyklėje: [http://localhost:3000](http://localhost:3000)

## ✅ Patikrinimo Sąrašas

Prieš paleisdami, įsitikinkite:

- ✅ `.env` failas sukurtas projekto šaknyje
- ✅ `DATABASE_URL` nustatytas (Neon arba lokalus)
- ✅ `NEXTAUTH_SECRET` sugeneruotas (32+ simboliai)
- ✅ `TWELVEDATA_API_KEY` gautas ir įdėtas
- ✅ `GOOGLE_CLIENT_ID` ir `GOOGLE_CLIENT_SECRET` (jei norite OAuth)
- ✅ `npx prisma db push` vykdytas sėkmingai
- ✅ `npm run dev` veikia be klaidų

## 🎮 Pirmieji Žingsniai

1. **Registracija**: Eikite į `/auth/signup` ir sukurkite paskyrą
2. **Prisijungimas**: Prisijunkite su savo el. paštu
3. **Ieškoti akcijų**: Dashboard → Trade → Ieškokite "AAPL"
4. **Pirkti akcijas**: Pirkite 10 akcijų
5. **Peržiūrėti portfelį**: Dashboard → Portfolio
6. **Pardavimo testas**: Parduokite 5 akcijas
7. **Transakcijų istorija**: Dashboard → Transactions

## 🔧 Dažniausios Problemos

### "Environment variable validation failed"
**Sprendimas**: Patikrinkite, ar visi būtini kintamieji `.env` faile užpildyti.

### "Prisma Client not found"
**Sprendimas**: 
```bash
npx prisma generate
```

### "Can't reach database server"
**Sprendimas**: 
- Patikrinkite `DATABASE_URL` - ar teisingas?
- Jei Neon - ar projektas aktyvus?
- Ar SSL režimas nustatytas: `?sslmode=require`

### "Invalid stock symbol"
**Sprendimas**: 
- Patikrinkite `TWELVEDATA_API_KEY`
- Ieškokite tik teisingų simbolių (pvz., AAPL, GOOGL, MSFT)
- Nemokama versija: 8 užklausos/minutę

## 📁 Phase 1 Failus Struktūra

```
SimT/
├── lib/
│   ├── env.ts           ✅ Aplinkos validacija (Zod)
│   ├── prisma.ts        ✅ Prisma singleton
│   └── stock-api.ts     ✅ TwelveData klientas
├── auth.config.ts       ✅ Auth.js konfigūracija
├── auth.ts              ✅ Auth.js nustatymai
├── middleware.ts        ✅ Maršrutų apsauga
├── app/
│   ├── layout.tsx       ✅ Pagrindinis išdėstymas
│   ├── page.tsx         ✅ Pagrindinis puslapis
│   ├── globals.css      ✅ Globalūs stiliai
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts  ✅ Auth API
├── package.json         ✅ Priklausomybės
├── next.config.js       ✅ Next.js konfigūracija
├── tailwind.config.ts   ✅ Tailwind tema
├── tsconfig.json        ✅ TypeScript konfigūracija
└── .env                 ⚠️  REIKIA SUKURTI!
```

## 🎯 Phase 1 Baigta ✅

Kai viską nustatėte ir `npm run dev` veikia - **Phase 1 užbaigta**!

Sekantys žingsniai:
- ✅ **Phase 1**: Infrastructure & Security (BAIGTA)
- ⏭️ **Phase 2**: Database Schema (Jau sukurta)
- ⏭️ **Phase 3**: Core API & Server Actions (Jau sukurta)
- ⏭️ **Phase 4**: UI Components (Jau sukurta)
- ⏭️ **Phase 5**: Deployment (Dokumentacija paruošta)

**Viskas paruošta kūrimui!** 🚀

## 📞 Pagalba

- 📖 Detalesnė dokumentacija: `README.md`
- 🚀 5 minučių startas: `QUICKSTART.md`
- 🌐 Deployment gidas: `DEPLOYMENT.md`
- 📋 Pilnas planas: `implementation-plan.md`

---

**Sėkmės kuriant! 📈**

