/**
 * Seeds verified admin + customer users for local development.
 *
 * Run from server/src:
 *   pnpm run seed:users
 *
 * Override defaults via .env:
 *   SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
 *   SEED_CUSTOMER_EMAIL, SEED_CUSTOMER_PASSWORD
 */
import '../config/env.js'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import User from '../features/users/model/user.model.js'

type SeedUser = {
  name: string
  email: string
  password: string
  role: 'admin' | 'customer'
}

const seedUsers: SeedUser[] = [
  {
    name: 'CRM Admin',
    email: (process.env.SEED_ADMIN_EMAIL ?? 'admin@crm.local').toLowerCase(),
    password: process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!',
    role: 'admin',
  },
  {
    name: 'Test Customer',
    email: (process.env.SEED_CUSTOMER_EMAIL ?? 'customer@crm.local').toLowerCase(),
    password: process.env.SEED_CUSTOMER_PASSWORD ?? 'Customer123!',
    role: 'customer',
  },
]

async function run(): Promise<void> {
  await connectDB()

  for (const entry of seedUsers) {
    const existing = await User.findOne({ email: entry.email })

    if (existing) {
      console.log(`Skipped (already exists): ${entry.email} [${existing.role}]`)
      continue
    }

    await User.create({
      name: entry.name,
      email: entry.email,
      password: entry.password,
      role: entry.role,
      isVerified: true,
    })

    console.log(`Created: ${entry.email} [${entry.role}]`)
  }

  console.log('\nSeed users (defaults):')
  console.log('  Admin:    admin@crm.local    / Admin123!')
  console.log('  Customer: customer@crm.local / Customer123!')
}

run()
  .then(async () => {
    await mongoose.disconnect()
    process.exit(0)
  })
  .catch(async (err) => {
    console.error('User seed failed:', err)
    await mongoose.disconnect().catch(() => {})
    process.exit(1)
  })
