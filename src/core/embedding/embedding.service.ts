import { GoogleGenAI } from '@google/genai'
import { injectable } from 'tsyringe'

import { env } from '../config/env.config'

export interface IEmbeddingService {
	generateEmbedding(text: string): Promise<number[]>
	generateEmbeddings(texts: string[]): Promise<number[][]>
}

@injectable()
export class EmbeddingService implements IEmbeddingService {
	private genAI: GoogleGenAI
	private readonly VECTOR_DIMENSION = 1536
	private readonly EMBEDDING_MODEL = 'gemini-embedding-001'
	private readonly TASK_TYPE = 'RETRIEVAL_DOCUMENT'

	constructor() {
		this.genAI = new GoogleGenAI({
			apiKey: env.GEMINI_API_KEY
		})
	}

	/**
	 * Generates an embedding vector for a single text input.
	 *
	 * @param text - The input text to generate the embedding for.
	 * @returns A promise that resolves to a normalized embedding vector.
	 * @throws Error - If the embedding generation fails.
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
			console.error('Error generating embedding:', error)
			throw error
		}
	}

	/**
	 * Generates embedding vectors for multiple text inputs.
	 *
	 * @param texts - An array of input texts to generate embeddings for.
	 * @returns A promise that resolves to an array of normalized embedding vectors.
	 * @throws Error - If the embedding generation fails for any input.
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
			console.error('Error generating embeddings:', error)
			throw error
		}
	}

	/**
	 * Normalizes a vector to have a unit norm.
	 *
	 * @param values - The input vector to normalize.
	 * @returns The normalized vector.
	 */
	private normalizeVector(values: number[]): number[] {
		const norm = Math.sqrt(values.reduce((sum, val) => sum + val * val, 0))
		return norm > 0 ? values.map((val) => val / norm) : values
	}
}
