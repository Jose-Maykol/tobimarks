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
	 * Extracts metadata from the given URL, including title, description, Open Graph data, and favicon URL.
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

			return {
				title: this.extractTitle($),
				description: this.extractDescription($),
				ogTitle: this.extractOgTitle($),
				ogDescription: this.extractOgDescription($),
				ogImageUrl: this.extractOgImage($),
				faviconUrl: this.extractFaviconUrl($)
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

	private extractOgImage($: cheerio.CheerioAPI): string | null {
		return $('meta[property="og:image"]').attr('content') || null
	}

	private extractFaviconUrl($: cheerio.CheerioAPI): string | null {
		const favicon =
			$('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href')
		return favicon || null
	}
}
