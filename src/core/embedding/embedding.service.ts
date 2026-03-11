import { GoogleGenAI } from '@google/genai'
import { inject, injectable } from 'tsyringe'

import { env } from '../config/env.config'
import { LOGGER } from '../di/tokens'
import type { ILogger } from '../logger/logger'

/**
 * Interfaz para el servicio de generación de embeddings.
 * Proporciona métodos para convertir texto en vectores numéricos.
 */
export interface IEmbeddingService {
	/**
	 * Genera un vector de embedding para una única entrada de texto.
	 * @param text - El texto de entrada.
	 * @returns Promesa con el vector de embedding normalizado.
	 */
	generateEmbedding(text: string): Promise<number[]>

	/**
	 * Genera vectores de embedding para múltiples entradas de texto.
	 * @param texts - Array de textos de entrada.
	 * @returns Promesa con un array de vectores de embedding normalizados.
	 */
	generateEmbeddings(texts: string[]): Promise<number[][]>
}

/**
 * Servicio que utiliza Google Generative AI para generar embeddings de texto.
 * Los vectores generados son normalizados para su uso en búsquedas vectoriales.
 */
@injectable()
export class EmbeddingService implements IEmbeddingService {
	private genAI: GoogleGenAI
	private readonly VECTOR_DIMENSION = 1536
	private readonly EMBEDDING_MODEL = 'gemini-embedding-001'
	private readonly TASK_TYPE = 'RETRIEVAL_DOCUMENT'

	constructor(@inject(LOGGER) private readonly logger: ILogger) {
		this.genAI = new GoogleGenAI({
			apiKey: env.GEMINI_API_KEY
		})
	}

	/**
	 * Genera un vector de embedding para una única entrada de texto.
	 *
	 * @param text - El texto de entrada para generar el embedding.
	 * @returns Una promesa que se resuelve con un vector de embedding normalizado.
	 * @throws Error - Si la generación del embedding falla o los datos son inválidos.
	 */
	async generateEmbedding(text: string): Promise<number[]> {
		try {
			const response = this.genAI.models.embedContent({
				model: this.EMBEDDING_MODEL,
				contents: [text],
				config: {
					outputDimensionality: this.VECTOR_DIMENSION,
					taskType: this.TASK_TYPE
				}
			})

			const embedding = await (await response).embeddings

			if (!embedding || !Array.isArray(embedding) || !embedding[0]?.values) {
				throw new Error('Failed to generate embedding')
			}

			return this.normalizeVector(embedding[0].values)
		} catch (error) {
			this.logger.error('Error generating embedding', {
				error: error instanceof Error ? error.message : String(error)
			})
			throw error
		}
	}

	/**
	 * Genera vectores de embedding para múltiples entradas de texto.
	 *
	 * @param texts - Un array de textos de entrada.
	 * @returns Una promesa que se resuelve con un array de vectores normalizados.
	 * @throws Error - Si la generación falla para cualquier entrada.
	 */
	async generateEmbeddings(texts: string[]): Promise<number[][]> {
		try {
			const response = this.genAI.models.embedContent({
				model: this.EMBEDDING_MODEL,
				contents: texts,
				config: {
					outputDimensionality: this.VECTOR_DIMENSION,
					taskType: this.TASK_TYPE
				}
			})
			const embeddings = await (await response).embeddings
			if (!embeddings || !Array.isArray(embeddings)) {
				throw new Error('Failed to generate embeddings')
			}
			return embeddings.map((embed) => {
				if (!embed.values) {
					throw new Error('Embedding values are undefined')
				}
				return this.normalizeVector(embed.values)
			})
		} catch (error) {
			this.logger.error('Error generating embeddings', {
				error: error instanceof Error ? error.message : String(error)
			})
			throw error
		}
	}

	/**
	 * Normaliza un vector para que tenga una norma unitaria.
	 *
	 * @param values - El vector de entrada a normalizar.
	 * @returns El vector normalizado.
	 */
	private normalizeVector(values: number[]): number[] {
		const norm = Math.sqrt(values.reduce((sum, val) => sum + val * val, 0))
		return norm > 0 ? values.map((val) => val / norm) : values
	}
}
