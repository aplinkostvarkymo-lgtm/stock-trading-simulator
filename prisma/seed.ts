import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Hash password for test user
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      balance: 100000.00,
    },
  })

  console.log('✅ Created test user:', testUser.email)

  // Create some sample holdings for the test user
  await prisma.holding.createMany({
    data: [
      {
        userId: testUser.id,
        symbol: 'AAPL',
        companyName: 'Apple Inc.',
        quantity: 10,
        averagePrice: 175.50,
      },
      {
        userId: testUser.id,
        symbol: 'GOOGL',
        companyName: 'Alphabet Inc.',
        quantity: 5,
        averagePrice: 140.25,
      },
      {
        userId: testUser.id,
        symbol: 'MSFT',
        companyName: 'Microsoft Corporation',
        quantity: 15,
        averagePrice: 380.00,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Created sample holdings')

  // Create sample transactions
  await prisma.transaction.createMany({
    data: [
      {
        userId: testUser.id,
        type: 'BUY',
        symbol: 'AAPL',
        companyName: 'Apple Inc.',
        quantity: 10,
        price: 175.50,
        total: 1755.00,
        balanceAfter: 98245.00,
      },
      {
        userId: testUser.id,
        type: 'BUY',
        symbol: 'GOOGL',
        companyName: 'Alphabet Inc.',
        quantity: 5,
        price: 140.25,
        total: 701.25,
        balanceAfter: 97543.75,
      },
      {
        userId: testUser.id,
        type: 'BUY',
        symbol: 'MSFT',
        companyName: 'Microsoft Corporation',
        quantity: 15,
        price: 380.00,
        total: 5700.00,
        balanceAfter: 91843.75,
      },
    ],
  })

  console.log('✅ Created sample transactions')

  // Create watchlist
  await prisma.watchlist.createMany({
    data: [
      {
        userId: testUser.id,
        symbol: 'TSLA',
        companyName: 'Tesla, Inc.',
      },
      {
        userId: testUser.id,
        symbol: 'AMZN',
        companyName: 'Amazon.com, Inc.',
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Created sample watchlist')
  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

