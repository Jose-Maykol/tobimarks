import 'dotenv/config'
import { readdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = join(__dirname, '..', 'migrations')

// Parse --files=001,003,007 argument
function getFilesFilter(): string[] | null {
  const arg = process.argv.find((a) => a.startsWith('--files='))
  if (!arg) return null
  return arg.replace('--files=', '').split(',').map((s) => s.trim())
}

async function migrate() {
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
    // Create control table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    const filter = getFilesFilter()

    // Read and sort migration files
    const allFiles = (await readdir(MIGRATIONS_DIR))
      .filter((f) => f.endsWith('.sql'))
      .sort()

    const files = filter
      ? allFiles.filter((f) => filter.some((prefix) => f.startsWith(prefix)))
      : allFiles

    if (files.length === 0) {
      console.log('⚠️  No migration files matched the given filter.')
      return
    }

    // Get already applied migrations
    const { rows: applied } = await client.query<{ filename: string }>(
      'SELECT filename FROM schema_migrations'
    )
    const appliedSet = new Set(applied.map((r) => r.filename))

    let ran = 0
    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`⏭️  Skipping (already applied): ${file}`)
        continue
      }

      const filePath = join(MIGRATIONS_DIR, file)
      const sql = await readFile(filePath, 'utf-8')

      console.log(`🔄 Running migration: ${file}`)
      await client.query('BEGIN')
      try {
        await client.query(sql)
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file]
        )
        await client.query('COMMIT')
        console.log(`✅ Applied: ${file}`)
        ran++
      } catch (err) {
        await client.query('ROLLBACK')
        console.error(`❌ Failed: ${file}`)
        throw err
      }
    }

    if (ran === 0) {
      console.log('✅ All migrations already applied. Nothing to do.')
    } else {
      console.log(`\n✅ Migration complete. ${ran} file(s) applied.`)
    }
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
