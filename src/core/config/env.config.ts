import { config as dotenvConfig } from 'dotenv'
import pino from 'pino'
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
	REDIS_HOST: string
	REDIS_PORT: number
	REDIS_PASSWORD: string
	REDIS_DB: number
	REDIS_QUEUE_HOST: string
	REDIS_QUEUE_PORT: number
	REDIS_QUEUE_PASSWORD: string
	REDIS_QUEUE_DB: number
	GOOGLE_CLIENT_ID: string
	GOOGLE_CLIENT_SECRET: string
	JWT_SECRET: string
	JWT_EXPIRES_IN: number
	GEMINI_API_KEY: string
	LOG_LEVEL: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'
}

/**
 * Esquema de validación para las variables de entorno utilizando Valibot.
 * Define los tipos, valores por defecto y transformaciones necesarias.
 */
const envSchema = v.object({
	// Servidor
	NODE_ENV: v.optional(
		v.pipe(
			v.string(),
			v.transform((val) => val.toUpperCase()),
			v.picklist(['DEVELOPMENT', 'PRODUCTION', 'TEST'])
		),
		'DEVELOPMENT'
	),
	LOG_LEVEL: v.optional(
		v.picklist(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']),
		'info'
	),
	PORT: v.optional(
		v.pipe(v.string(), v.transform(Number), v.number(), v.minValue(1000), v.maxValue(65535)),
		'3000'
	),
	// Database
	DB_HOST: v.pipe(v.string(), v.minLength(1, 'DB_HOST is required')),
	DB_PORT: v.optional(v.pipe(v.string(), v.transform(Number), v.number(), v.minValue(1)), '5432'),
	DB_NAME: v.pipe(v.string(), v.minLength(1, 'DB_NAME is required')),
	DB_USER: v.pipe(v.string(), v.minLength(1, 'DB_USER is required')),
	DB_PASSWORD: v.pipe(v.string(), v.minLength(1, 'DB_PASSWORD is required')),
	// Redis
	REDIS_HOST: v.optional(v.pipe(v.string(), v.minLength(1)), 'localhost'),
	REDIS_PORT: v.optional(
		v.pipe(v.string(), v.transform(Number), v.number(), v.minValue(1)),
		'6379'
	),
	REDIS_PASSWORD: v.optional(v.string(), ''),
	REDIS_DB: v.optional(v.pipe(v.string(), v.transform(Number), v.number(), v.minValue(0)), '0'),
	// Redis Queue
	REDIS_QUEUE_HOST: v.optional(v.pipe(v.string(), v.minLength(1)), 'localhost'),
	REDIS_QUEUE_PORT: v.optional(
		v.pipe(v.string(), v.transform(Number), v.number(), v.minValue(1)),
		'6380'
	),
	REDIS_QUEUE_PASSWORD: v.optional(v.string(), ''),
	REDIS_QUEUE_DB: v.optional(
		v.pipe(v.string(), v.transform(Number), v.number(), v.minValue(0)),
		'0'
	),
	// Google
	GOOGLE_CLIENT_ID: v.pipe(v.string(), v.minLength(1, 'GOOGLE_CLIENT_ID is required')),
	GOOGLE_CLIENT_SECRET: v.pipe(v.string(), v.minLength(1, 'GOOGLE_CLIENT_SECRET is required')),
	// JWT
	JWT_SECRET: v.pipe(v.string(), v.minLength(1, 'JWT_SECRET is required')),
	JWT_EXPIRES_IN: v.pipe(
		v.string(),
		v.minLength(1, 'JWT_EXPIRES_IN is required'),
		v.transform(Number),
		v.number(),
		v.minValue(1, 'JWT_EXPIRES_IN must be a value greater than 0')
	),
	// AI
	GEMINI_API_KEY: v.pipe(v.string(), v.minLength(1, 'GEMINI_API_KEY is required'))
})

/**
 * Valida las variables de entorno de `process.env` contra el esquema definido.
 * Si la validación falla, imprime los errores y finaliza el proceso con código 1.
 *
 * @returns EnvVariables - Las variables de entorno validadas y tipadas.
 */
const validateEnv = (): EnvVariables => {
	const envVars = process.env as Record<string, string | undefined>
	try {
		const validatedEnv = v.parse(envSchema, envVars)
		return validatedEnv
	} catch (error: unknown) {
		const bootstrapLogger = pino({
			level: 'fatal',
			transport: {
				target: 'pino-pretty',
				options: { colorize: true, translateTime: 'SYS:HH:MM:ss.l' }
			}
		})

		if (error instanceof Error) {
			bootstrapLogger.fatal(
				{ err: error.message },
				'Environment validation failed. Please check your .env file.'
			)
			process.exit(1)
		}

		bootstrapLogger.fatal('Unknown error occurred during environment validation')
		throw new Error('Unknown error occurred during environment validation')
	}
}

/** Objeto de configuración de entorno validado para toda la aplicación */
export const env = validateEnv()
