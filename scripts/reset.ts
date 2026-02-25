import 'dotenv/config'
import pg from 'pg'
import { execSync } from 'child_process'

async function reset() {
  const { Pool } = pg

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  })

  const client = await pool.connect()

  try {
    console.log('🗑️  Dropping public schema...')
    await client.query('DROP SCHEMA public CASCADE')
    await client.query('CREATE SCHEMA public')
    console.log('✅ Schema reset complete.')
  } finally {
    client.release()
    await pool.end()
  }

  // Forward any --files argument to the migrate script
  const filesArg = process.argv.find((a) => a.startsWith('--files=')) ?? ''
  const migrateCmd = `npx tsx scripts/migrate.ts${filesArg ? ` ${filesArg}` : ''}`

  console.log(`\n🚀 Running migrations: ${migrateCmd}\n`)
  execSync(migrateCmd, { stdio: 'inherit' })
}

reset().catch((err) => {
  console.error('Reset failed:', err)
  process.exit(1)
})
