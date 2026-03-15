import { Queue, Worker, type Job, type WorkerOptions, type QueueOptions } from 'bullmq'
import { inject, injectable, singleton } from 'tsyringe'

import { env } from '../config/env.config'
import { LOGGER } from '../di/tokens'
import type { ILogger } from '../logger/logger'

/**
 * Opciones de conexión a Redis para BullMQ.
 * Definidas internamente para evitar conflictos de tipos entre ioredis directo y el de BullMQ.
 */
const queueConnectionOptions = {
	host: env.REDIS_QUEUE_HOST,
	port: env.REDIS_QUEUE_PORT,
	password: env.REDIS_QUEUE_PASSWORD || undefined,
	db: env.REDIS_QUEUE_DB,
	maxRetriesPerRequest: null
}

/**
 * Tipo para la función procesadora de un job.
 * Cada cola registra su propia función que define qué hacer con cada job.
 */
export type JobProcessor<T = unknown, R = unknown> = (job: Job<T, R>) => Promise<R>

/**
 * Opciones para agregar un job a una cola.
 */
export interface AddJobOptions {
	/** Tiempo en milisegundos antes de que el job sea procesado. */
	delay?: number
	/** Número máximo de reintentos si el job falla. */
	attempts?: number
	/** Configuración de backoff para reintentos. */
	backoff?: {
		type: 'fixed' | 'exponential'
		delay: number
	}
	/** Si true, elimina el job una vez completado. */
	removeOnComplete?: boolean | number
	/** Si true, elimina el job si falla (después de todos los reintentos). */
	removeOnFail?: boolean | number
	/** ID único del job para evitar duplicados. */
	jobId?: string
	/** Prioridad del job (menor = mayor prioridad). */
	priority?: number
}

/**
 * Interfaz para el servicio de colas de trabajo.
 * Proporciona métodos para crear colas, registrar workers y despachar jobs.
 */
export interface IQueueService {
	/**
	 * Crea una nueva cola y registra un worker para procesarla.
	 * @param name - Nombre único de la cola.
	 * @param processor - Función que procesa cada job de la cola.
	 * @param workerOptions - Opciones adicionales para el worker (ej: concurrencia).
	 */
	registerQueue<T = unknown, R = unknown>(
		name: string,
		processor: JobProcessor<T, R>,
		workerOptions?: Partial<WorkerOptions>
	): void

	/**
	 * Agrega un job a una cola existente.
	 * @param queueName - Nombre de la cola destino.
	 * @param jobName - Nombre descriptivo del job.
	 * @param data - Datos/payload del job.
	 * @param options - Opciones del job (reintentos, delay, etc).
	 */
	addJob<T>(queueName: string, jobName: string, data: T, options?: AddJobOptions): Promise<void>

	/**
	 * Cierra todas las colas y workers de forma ordenada.
	 */
	shutdown(): Promise<void>
}

/**
 * Implementación del servicio de colas utilizando BullMQ.
 * Administra las colas, workers y la conexión a Redis dedicada para jobs.
 */
@singleton()
@injectable()
export class QueueService implements IQueueService {
	private readonly queues = new Map<string, Queue>()
	private readonly workers = new Map<string, Worker>()

	constructor(@inject(LOGGER) private readonly logger: ILogger) {}

	/**
	 * Crea una cola y su worker asociado.
	 * El worker comienza a escuchar jobs inmediatamente.
	 *
	 * @param name - Nombre de la cola.
	 * @param processor - Función procesadora de cada job.
	 * @param workerOptions - Opciones del worker (concurrencia, limiter, etc).
	 */
	registerQueue<T = unknown, R = unknown>(
		name: string,
		processor: JobProcessor<T, R>,
		workerOptions?: Partial<WorkerOptions>
	): void {
		if (this.queues.has(name)) {
			this.logger.warn(`Queue "${name}" is already registered, skipping.`)
			return
		}

		const queueOptions: QueueOptions = {
			connection: queueConnectionOptions,
			defaultJobOptions: {
				removeOnComplete: 100,
				removeOnFail: 500,
				attempts: 3,
				backoff: {
					type: 'exponential',
					delay: 1000
				}
			}
		}

		const queue = new Queue(name, queueOptions)
		this.queues.set(name, queue)

		const worker = new Worker<T, R>(name, processor, {
			connection: queueConnectionOptions,
			concurrency: 5,
			...workerOptions
		})

		worker.on('completed', (job: Job<T, R>) => {
			this.logger.debug(`Job completed in queue "${name}"`, {
				jobId: job.id,
				jobName: job.name
			})
		})

		worker.on('failed', (job: Job<T, R> | undefined, err: Error) => {
			this.logger.error(`Job failed in queue "${name}"`, {
				jobId: job?.id,
				jobName: job?.name,
				error: err.message,
				attemptsMade: job?.attemptsMade
			})
		})

		worker.on('error', (err: Error) => {
			this.logger.error(`Error in worker for queue "${name}"`, {
				error: err.message
			})
		})

		this.workers.set(name, worker)
		this.logger.info(`Queue "${name}" registered with active worker`)
	}

	/**
	 * Agrega un job a una cola existente.
	 * Lanza un error si la cola no ha sido registrada previamente.
	 *
	 * @param queueName - Nombre de la cola.
	 * @param jobName - Nombre del job.
	 * @param data - Payload del job.
	 * @param options - Opciones del job.
	 */
	async addJob<T>(
		queueName: string,
		jobName: string,
		data: T,
		options?: AddJobOptions
	): Promise<void> {
		const queue = this.queues.get(queueName)

		if (!queue) {
			this.logger.error(`Queue "${queueName}" not found. Register the queue before adding jobs.`)
			throw new Error(`Queue "${queueName}" no está registrada`)
		}

		const jobOptions: Record<string, unknown> = {}
		if (options?.delay !== undefined) jobOptions.delay = options.delay
		if (options?.attempts !== undefined) jobOptions.attempts = options.attempts
		if (options?.backoff !== undefined) jobOptions.backoff = options.backoff
		if (options?.removeOnComplete !== undefined)
			jobOptions.removeOnComplete = options.removeOnComplete
		if (options?.removeOnFail !== undefined) jobOptions.removeOnFail = options.removeOnFail
		if (options?.jobId !== undefined) jobOptions.jobId = options.jobId
		if (options?.priority !== undefined) jobOptions.priority = options.priority

		await queue.add(jobName, data, jobOptions)

		this.logger.debug(`Job "${jobName}" added to queue "${queueName}"`, {
			jobName,
			queueName,
			hasDelay: !!options?.delay
		})
	}

	/**
	 * Cierra todas las colas y workers de forma ordenada.
	 * Espera a que los jobs en progreso finalicen antes de cerrar.
	 */
	async shutdown(): Promise<void> {
		this.logger.info('Closing queue service...')

		const workerClosePromises = Array.from(this.workers.entries()).map(async ([name, worker]) => {
			this.logger.debug(`Closing worker "${name}"...`)
			await worker.close()
		})

		const queueClosePromises = Array.from(this.queues.entries()).map(async ([name, queue]) => {
			this.logger.debug(`Closing queue "${name}"...`)
			await queue.close()
		})

		await Promise.all([...workerClosePromises, ...queueClosePromises])

		this.logger.info('Queue service closed successfully')
	}
}
