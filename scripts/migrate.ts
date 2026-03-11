import 'dotenv/config'
import { readdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import pg from 'pg'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = join(__dirname, '..', 'migrations')

/**
 * Obtiene el filtro de archivos desde los argumentos de la línea de comandos.
 * Permite ejecutar migraciones específicas usando el flag --files=001,002.
 *
 * @returns Array de nombres/prefijos de archivos o null si no hay filtro.
 */
function getFilesFilter(): string[] | null {
	const arg = process.argv.find((a) => a.startsWith('--files='))
	if (!arg) return null
	return arg
		.replace('--files=', '')
		.split(',')
		.map((s) => s.trim())
}

/**
 * Script de migración de base de datos.
 * - Crea la tabla `schema_migrations` si no existe.
 * - Lee archivos .sql de la carpeta /migrations.
 * - Ejecuta las migraciones pendientes en orden alfabético.
 * - Registra cada migración aplicada para evitar ejecuciones duplicadas.
 */
async function migrate() {
	const { Pool } = pg

	const pool = new Pool({
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT ?? 5432),
		database: process.env.DB_NAME,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD
	})

	const client = await pool.connect()

	try {
		// Crear tabla de control de versiones si no existe
		await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

		const filter = getFilesFilter()

		// Leer y ordenar archivos de migración
		const allFiles = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort()

		const files = filter
			? allFiles.filter((f) => filter.some((prefix) => f.startsWith(prefix)))
			: allFiles

		if (files.length === 0) {
			console.log('No migration files matched the specified filter.')
			return
		}

		// Obtener migraciones ya aplicadas
		const { rows: applied } = await client.query<{ filename: string }>(
			'SELECT filename FROM schema_migrations'
		)
		const appliedSet = new Set(applied.map((r) => r.filename))

		let ran = 0
		for (const file of files) {
			if (appliedSet.has(file)) {
				console.log(`Skipping applied migration: ${file}`)
				continue
			}

			const filePath = join(MIGRATIONS_DIR, file)
			const sql = await readFile(filePath, 'utf-8')

			console.log(`Executing migration: ${file}`)
			await client.query('BEGIN')
			try {
				await client.query(sql)
				await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file])
				await client.query('COMMIT')
				console.log(`Successfully applied: ${file}`)
				ran++
			} catch (err) {
				await client.query('ROLLBACK')
				console.error(`Migration failed: ${file}`)
				throw err
			}
		}

		if (ran === 0) {
			console.log('All migrations are up to date.')
		} else {
			console.log(`\nMigration process finished. ${ran} file(s) applied.`)
		}
	} finally {
		client.release()
		await pool.end()
	}
}

migrate().catch((err) => {
	console.error('Migration execution failed:', err)
	process.exit(1)
})
