import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { inject, injectable } from 'tsyringe'

import { BOOKMARK_SERVICE } from '../di/token'
import { BookmarkAlreadyExistsError } from '../exceptions/bookmark.exceptions'
import {
	UrlFetchFailedException,
	UrlForbiddenException,
	UrlNotFoundException,
	UrlTimeoutException
} from '../exceptions/metadata-extractor.exceptions'
import type { BookmarkService } from '../services/bookmark.service'
import type { CreateBookmarkRequestBody } from '../types/bookmark.types'

import { ApiResponseBuilder } from '@/common/utils/api-response'

@injectable()
export class BookmarkController {
	constructor(@inject(BOOKMARK_SERVICE) private readonly bookmarkService: BookmarkService) {}

	/**
	 * Handles the creation of a new bookmark.
	 *
	 * @param req - The HTTP request containing the user and bookmark data.
	 * @param res - The HTTP response to send the created bookmark.
	 * @param next - The next middleware function for error handling.
	 * @returns A JSON response with the created bookmark.
	 */
	async create(
		req: Request<Record<string, never>, Record<string, never>, CreateBookmarkRequestBody>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const body = req.body
			const bookmark = await this.bookmarkService.create(user, body)
			return res.status(StatusCodes.OK).json(
				ApiResponseBuilder.success({
					bookmark: {
						id: bookmark.id,
						url: bookmark.url,
						title: bookmark.title,
						description: bookmark.description
					}
				})
			)
		} catch (error) {
			if (error instanceof UrlForbiddenException) {
				res.status(StatusCodes.FORBIDDEN).json(ApiResponseBuilder.error(error.message, error.code))
			}
			if (error instanceof UrlNotFoundException) {
				res.status(StatusCodes.NOT_FOUND).json(ApiResponseBuilder.error(error.message, error.code))
			}
			if (error instanceof UrlTimeoutException) {
				res
					.status(StatusCodes.REQUEST_TIMEOUT)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			if (error instanceof UrlFetchFailedException) {
				res
					.status(StatusCodes.INTERNAL_SERVER_ERROR)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			if (error instanceof BookmarkAlreadyExistsError) {
				res.status(StatusCodes.CONFLICT).json(ApiResponseBuilder.error(error.message, error.code))
			}
			next(error)
		}
	}

	/**
	 * Retrieves all bookmarks for the authenticated user.
	 *
	 * @param req - The HTTP request containing the authenticated user.
	 * @param res - The HTTP response to send the retrieved bookmarks.
	 * @param next - The next middleware function for error handling.
	 * @returns A JSON response with the list of bookmarks.
	 */
	async get(
		req: Request<Record<string, never>, Record<string, never>, Record<string, never>>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const bookmark = await this.bookmarkService.get(user)
			return res.status(StatusCodes.OK).json(
				ApiResponseBuilder.success({
					bookmarks: bookmark.map((b) => ({
						id: b.id,
						url: b.url,
						title: b.title,
						description: b.description
					}))
				})
			)
		} catch (error) {
			next(error)
		}
	}

	async delete(
		req: Request<{ id: string }, Record<string, never>, Record<string, never>>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const { id } = req.params
			await this.bookmarkService.delete(user, id)
			return res.status(StatusCodes.NO_CONTENT).send()
		} catch (error) {
			next(error)
		}
	}
}
