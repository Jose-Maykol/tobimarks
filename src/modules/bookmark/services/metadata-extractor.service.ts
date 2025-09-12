import axios from 'axios'
import * as cheerio from 'cheerio'
import { injectable } from 'tsyringe'

import {
	UrlFetchFailedException,
	UrlForbiddenException,
	UrlNotFoundException,
	UrlTimeoutException
} from '../exceptions/metadata-extractor.exceptions'
import type { MetadataExtractorResponse } from '../types/metadata.types'

@injectable()
export class MetadataExtractorService {
	/**
	 * Extracts metadata from the given URL, including title, description, Open Graph data, favicon URL, and canonical URL.
	 *
	 * @param url - The URL to fetch and extract metadata from.
	 * @returns A promise that resolves to an object containing the extracted metadata.
	 * @throws UrlFetchFailedException - If the URL fetch fails for an unknown reason.
	 * @throws UrlForbiddenException - If the URL returns a 403 Forbidden status.
	 * @throws UrlNotFoundException - If the URL returns a 404 Not Found status.
	 * @throws UrlTimeoutException - If the request to the URL times out.
	 */
	async extractFromUrl(url: string): Promise<MetadataExtractorResponse> {
		try {
			const { data: html } = await axios.get(url, {
				timeout: 3000,
				headers: {
					'User-Agent': 'Mozilla/5.0 (compatible; BookmarkBot/1.0)'
				}
			})

			const $ = cheerio.load(html)
			const baseUrl = new URL(url).origin

			return {
				title: this.extractTitle($),
				description: this.extractDescription($),
				ogTitle: this.extractOgTitle($),
				ogDescription: this.extractOgDescription($),
				ogImageUrl: this.extractOgImage($, baseUrl),
				faviconUrl: this.extractFaviconUrl($, baseUrl),
				canonicalUrl: this.extractCanonicalUrl($, baseUrl)
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response) {
					if (error.response) {
						if (error.response.status === 403) {
							throw new UrlForbiddenException()
						}
						if (error.response.status === 404) {
							throw new UrlNotFoundException()
						}
						throw new UrlFetchFailedException()
					}
				} else if (error.code === 'ECONNABORTED') {
					throw new UrlTimeoutException()
				} else {
					throw new UrlFetchFailedException()
				}
			}
			throw error
		}
	}

	private extractTitle($: cheerio.CheerioAPI): string | null {
		return $('title').text().trim() || null
	}

	private extractDescription($: cheerio.CheerioAPI): string | null {
		return $('meta[name="description"]').attr('content') || null
	}

	private extractOgTitle($: cheerio.CheerioAPI): string | null {
		return $('meta[property="og:title"]').attr('content') || null
	}

	private extractOgDescription($: cheerio.CheerioAPI): string | null {
		return $('meta[property="og:description"]').attr('content') || null
	}

	private extractOgImage($: cheerio.CheerioAPI, baseUrl: string): string | null {
		const ogImage = $('meta[property="og:image"]').attr('content')
		if (!ogImage) return null
		if (ogImage.startsWith('http://') || ogImage.startsWith('https://')) return ogImage
		return new URL(ogImage, baseUrl).href
	}

	private extractFaviconUrl($: cheerio.CheerioAPI, baseUrl: string): string | null {
		const favicon =
			$('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href')

		if (!favicon) return null

		if (favicon.startsWith('http://') || favicon.startsWith('https://')) return favicon

		const absoluteFaviconUrl = new URL(favicon, `${baseUrl}/`).href
		return absoluteFaviconUrl
	}

	private extractCanonicalUrl($: cheerio.CheerioAPI, baseUrl: string): string | null {
		const canonical = $('link[rel="canonical"]').attr('href')
		if (!canonical) return null
		if (canonical.startsWith('http://') || canonical.startsWith('https://')) return canonical
		return new URL(canonical, baseUrl).href
	}
}
