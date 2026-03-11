import 'dotenv/config'
import { execSync } from 'child_process'
import pg from 'pg'

/**
 * Script de reinicio de la base de datos.
 *
 * Este script realiza las siguientes acciones:
 * 1. Elimina el esquema `public` de forma consecutiva (CASCADE), borrando todas las tablas y datos.
 * 2. Recrea el esquema `public` vacío.
 * 3. Ejecuta automáticamente el script de migraciones (`migrate.ts`) para restaurar la estructura.
 */
async function reset() {
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
		console.log('Dropping public schema...')
		await client.query('DROP SCHEMA public CASCADE')
		await client.query('CREATE SCHEMA public')
		console.log('Schema reset successfully.')
	} finally {
		client.release()
		await pool.end()
	}

	// Obtener argumentos de archivos si se proporcionaron
	const filesArg = process.argv.find((a) => a.startsWith('--files=')) ?? ''
	const migrateCmd = `npx tsx scripts/migrate.ts${filesArg ? ` ${filesArg}` : ''}`

	console.log(`\nRe-applying migrations: ${migrateCmd}\n`)
	execSync(migrateCmd, { stdio: 'inherit' })
}

reset().catch((err) => {
	console.error('Database reset failed:', err)
	process.exit(1)
})
