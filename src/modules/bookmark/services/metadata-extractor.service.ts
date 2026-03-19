import axios from 'axios'
import * as cheerio from 'cheerio'
import { inject, injectable } from 'tsyringe'

import {
	UrlFetchFailedException,
	UrlForbiddenException,
	UrlNotFoundException,
	UrlTimeoutException
} from '../exceptions/metadata-extractor.exceptions'
import type { MetadataExtractorResponse } from '../types/metadata.types'

import { LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'

@injectable()
export class MetadataExtractorService {
	private readonly logger: ILogger

	constructor(@inject(LOGGER) logger: ILogger) {
		this.logger = logger.child({ context: 'MetadataExtractorService' })
	}

	/**
	 * Extrae metadatos de la URL dada, incluyendo título, descripción, datos de Open Graph, URL del favicon y URL canónica.
	 *
	 * @param url - La URL de la cual obtener y extraer los metadatos.
	 * @returns Una promesa que se resuelve en un objeto que contiene los metadatos extraídos.
	 * @throws UrlFetchFailedException - Si la obtención de la URL falla por una razón desconocida.
	 * @throws UrlForbiddenException - Si la URL devuelve un estado 403 Forbidden.
	 * @throws UrlNotFoundException - Si la URL devuelve un estado 404 Not Found.
	 * @throws UrlTimeoutException - Si la solicitud a la URL agota el tiempo de espera.
	 */
	async extractFromUrl(url: string): Promise<MetadataExtractorResponse> {
		this.logger.info('Extracting metadata from URL', { url })
		try {
			const { data: html } = await axios.get(url, {
				timeout: 3000,
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...',
					'Accept-Language': 'es-ES,es;q=0.9',
					Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,webp,*/*;q=0.8'
				}
			})

			const $ = cheerio.load(html)
			const baseUrl = new URL(url).origin

			const metadata: MetadataExtractorResponse = {
				title: this.extractTitle($),
				description: this.extractDescription($),
				ogTitle: this.extractOgTitle($),
				ogDescription: this.extractOgDescription($),
				ogImageUrl: this.extractOgImage($, baseUrl),
				faviconUrl: this.extractFaviconUrl($, baseUrl),
				canonicalUrl: this.extractCanonicalUrl($, baseUrl)
			}

			this.logger.info('Metadata extracted successfully', {
				url,
				title: metadata.title,
				hasDescription: !!metadata.description,
				hasOgImage: !!metadata.ogImageUrl
			})
			this.logger.debug('Full metadata extracted', { url, metadata })

			return metadata
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response) {
					if (error.response.status === 403) {
						this.logger.warn('URL forbidden', { url })
						throw new UrlForbiddenException()
					}
					if (error.response.status === 404) {
						this.logger.warn('URL not found', { url })
						throw new UrlNotFoundException()
					}
					this.logger.error('URL fetch failed with status', { url, status: error.response.status })
					throw new UrlFetchFailedException()
				} else if (error.code === 'ECONNABORTED') {
					this.logger.warn('URL timeout', { url })
					throw new UrlTimeoutException()
				} else {
					this.logger.error('URL fetch failed', { url, error: error.message })
					throw new UrlFetchFailedException()
				}
			}
			this.logger.error('Unknown error extracting metadata', { url, error })
			throw error
		}
	}

	/**
	 * Extrae el título de la página desde la etiqueta <title>.
	 *
	 * @param $ - La instancia de Cheerio cargada con el HTML.
	 * @returns El título de la página o null si no se encuentra.
	 */
	private extractTitle($: cheerio.CheerioAPI): string | null {
		return $('title').text().trim() || null
	}

	/**
	 * Extrae la descripción de la página desde la metaetiqueta 'description'.
	 *
	 * @param $ - La instancia de Cheerio cargada con el HTML.
	 * @returns La descripción de la página o null si no se encuentra.
	 */
	private extractDescription($: cheerio.CheerioAPI): string | null {
		return $('meta[name="description"]').attr('content') || null
	}

	/**
	 * Extrae el título de Open Graph (og:title) desde las metaetiquetas.
	 *
	 * @param $ - La instancia de Cheerio cargada con el HTML.
	 * @returns El título de og:title o null si no se encuentra.
	 */
	private extractOgTitle($: cheerio.CheerioAPI): string | null {
		return $('meta[property="og:title"]').attr('content') || null
	}

	/**
	 * Extrae la descripción de Open Graph (og:description) desde las metaetiquetas.
	 *
	 * @param $ - La instancia de Cheerio cargada con el HTML.
	 * @returns La descripción de og:description o null si no se encuentra.
	 */
	private extractOgDescription($: cheerio.CheerioAPI): string | null {
		return $('meta[property="og:description"]').attr('content') || null
	}

	/**
	 * Extrae la URL de la imagen de Open Graph (og:image) desde las metaetiquetas.
	 * Asegura que la URL devuelta sea absoluta.
	 *
	 * @param $ - La instancia de Cheerio cargada con el HTML.
	 * @param baseUrl - La URL base para resolver rutas relativas.
	 * @returns La URL absoluta de la imagen o null si no se encuentra.
	 */
	private extractOgImage($: cheerio.CheerioAPI, baseUrl: string): string | null {
		const ogImage = $('meta[property="og:image"]').attr('content')
		if (!ogImage) return null
		if (ogImage.startsWith('http://') || ogImage.startsWith('https://')) return ogImage
		return new URL(ogImage, baseUrl).href
	}

	/**
	 * Extrae la URL del favicon del sitio web.
	 * Busca en las etiquetas link con rel 'icon' o 'shortcut icon'.
	 * Asegura que la URL devuelta sea absoluta.
	 *
	 * @param $ - La instancia de Cheerio cargada con el HTML.
	 * @param baseUrl - La URL base para resolver rutas relativas.
	 * @returns La URL absoluta del favicon o null si no se encuentra.
	 */
	private extractFaviconUrl($: cheerio.CheerioAPI, baseUrl: string): string | null {
		const favicon =
			$('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href')

		if (!favicon) return null

		if (favicon.startsWith('http://') || favicon.startsWith('https://')) return favicon

		const absoluteFaviconUrl = new URL(favicon, `${baseUrl}/`).href
		return absoluteFaviconUrl
	}

	/**
	 * Extrae la URL canónica de la página desde la etiqueta link con rel 'canonical'.
	 * Asegura que la URL devuelta sea absoluta.
	 *
	 * @param $ - La instancia de Cheerio cargada con el HTML.
	 * @param baseUrl - La URL base para resolver rutas relativas.
	 * @returns La URL absoluta canónica o null si no se encuentra.
	 */
	private extractCanonicalUrl($: cheerio.CheerioAPI, baseUrl: string): string | null {
		const canonical = $('link[rel="canonical"]').attr('href')
		if (!canonical) return null
		if (canonical.startsWith('http://') || canonical.startsWith('https://')) return canonical
		return new URL(canonical, baseUrl).href
	}
}
