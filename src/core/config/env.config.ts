import { config as dotenvConfig } from 'dotenv'
import * as v from 'valibot'

dotenvConfig()

export type Environment = 'DEVELOPMENT' | 'PRODUCTION' | 'TEST'

export interface EnvVariables {
	NODE_ENV: Environment
	PORT: number
	DB_HOST: string
	DB_PORT: number
	DB_NAME: string
	DB_USER: string
	DB_PASSWORD: string
	GOOGLE_CLIENT_ID: string
	GOOGLE_CLIENT_SECRET: string
	JWT_SECRET: string
	JWT_EXPIRES_IN: number
	GEMINI_API_KEY: string
}

const envSchema = v.object({
	//Server
	NODE_ENV: v.optional(v.picklist(['DEVELOPMENT', 'PRODUCTION', 'TEST']), 'DEVELOPMENT'),
	PORT: v.optional(
		v.pipe(v.string(), v.transform(Number), v.number(), v.minValue(1000), v.maxValue(65535)),
		'3000'
	),
	// Database
	DB_HOST: v.pipe(v.string(), v.minLength(1, 'DB_HOST es requerido')),
	DB_PORT: v.optional(v.pipe(v.string(), v.transform(Number), v.number(), v.minValue(1)), '5432'),
	DB_NAME: v.pipe(v.string(), v.minLength(1, 'DB_NAME es requerido')),
	DB_USER: v.pipe(v.string(), v.minLength(1, 'DB_USER es requerido')),
	DB_PASSWORD: v.pipe(v.string(), v.minLength(1, 'DB_PASSWORD es requerido')),
	// Google
	GOOGLE_CLIENT_ID: v.pipe(v.string(), v.minLength(1, 'GOOGLE_CLIENT_ID es requerido')),
	GOOGLE_CLIENT_SECRET: v.pipe(v.string(), v.minLength(1, 'GOOGLE_CLIENT_SECRET es requerido')),
	// JWT
	JWT_SECRET: v.pipe(v.string(), v.minLength(1, 'JWT_SECRET es requerido')),
	JWT_EXPIRES_IN: v.pipe(
		v.string(),
		v.minLength(1, 'JWT_EXPIRES_IN es requerido'),
		v.transform(Number),
		v.number(),
		v.minValue(1, 'JWT_EXPIRES_IN debe ser un valor numérico mayor a 0')
	),
	// AI
	GEMINI_API_KEY: v.pipe(v.string(), v.minLength(1, 'GEMINI_API_KEY es requerido'))
})

const validateEnv = (): EnvVariables => {
	const env = process.env as Record<string, string | undefined>
	try {
		const validatedEnv = v.parse(envSchema, env)
		return validatedEnv
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error('\n🚨 Environment validation failed! 🚨')
			console.error('The following issue was found with your environment variables:')
			console.error(`- ${error.message}`)
			console.error('\nPlease check your .env file or environment configuration and try again.\n')
			process.exit(1)
		}
		throw new Error('Unknown error occurred during environment validation')
	}
}

export const env = validateEnv()
