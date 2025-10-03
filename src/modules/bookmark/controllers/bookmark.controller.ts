import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { inject, injectable } from 'tsyringe'

import { BOOKMARK_SERVICE } from '../di/token'
import {
	BookmarkAlreadyExistsError,
	BookmarkNotFoundError
} from '../exceptions/bookmark.exceptions'
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
			return res.status(StatusCodes.CREATED).json(
				ApiResponseBuilder.success(
					{
						bookmark: {
							id: bookmark.id,
							url: bookmark.url,
							title: bookmark.title,
							description: bookmark.description
						}
					},
					'Bookmark created successfully'
				)
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
						isFavorite: b.isFavorite,
						isArchived: b.isArchived,
						accessCount: b.accessCount,
						domain: b.domain,
						faviconUrl: b.faviconUrl,
						tags: b.tags
					}))
				})
			)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * Deletes a bookmark for the authenticated user by its ID.
	 *
	 * @param req - The HTTP request containing the authenticated user and bookmark ID.
	 * @param res - The HTTP response to confirm the deletion.
	 * @param next - The next middleware function for error handling.
	 * @returns A JSON response confirming the bookmark deletion.
	 */
	async delete(
		req: Request<{ id: string }, Record<string, never>, Record<string, never>>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const { id } = req.params
			await this.bookmarkService.delete(user, id)
			return res.status(StatusCodes.OK).json(
				ApiResponseBuilder.success(
					{
						bookmark: {
							id: id
						}
					},
					'Bookmark deleted successfully'
				)
			)
		} catch (error) {
			if (error instanceof BookmarkNotFoundError) {
				return res
					.status(StatusCodes.NOT_FOUND)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			next(error)
		}
	}

	/**
	 * Marks a bookmark as a favorite for the authenticated user.
	 *
	 * @param req - The HTTP request containing the authenticated user and bookmark ID.
	 * @param res - The HTTP response to confirm the favorite status update.
	 * @param next - The next middleware function for error handling.
	 * @returns A JSON response confirming the bookmark was marked as favorite.
	 */
	async markAsFavorite(
		req: Request<{ id: string }, Record<string, never>, Record<string, never>>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const { id } = req.params
			const result = await this.bookmarkService.markAsFavorite(user, id)
			return res.status(StatusCodes.OK).json(
				ApiResponseBuilder.success(
					{
						bookmark: {
							id: result.id,
							isFavorite: result.isFavorite
						}
					},
					'Bookmark marked as favorite successfully'
				)
			)
		} catch (error) {
			if (error instanceof BookmarkNotFoundError) {
				return res
					.status(StatusCodes.NOT_FOUND)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			next(error)
		}
	}

	/**
	 * Removes the favorite status from a bookmark for the authenticated user.
	 *
	 * @param req - The HTTP request containing the authenticated user and bookmark ID.
	 * @param res - The HTTP response to confirm the favorite status removal.
	 * @param next - The next middleware function for error handling.
	 * @returns A JSON response confirming the bookmark was unmarked as favorite.
	 */
	async unmarkAsFavorite(
		req: Request<{ id: string }, Record<string, never>, Record<string, never>>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const { id } = req.params
			const result = await this.bookmarkService.unmarkAsFavorite(user, id)
			return res.status(StatusCodes.OK).json(
				ApiResponseBuilder.success(
					{
						bookmark: {
							id: result.id,
							isFavorite: result.isFavorite
						}
					},
					'Bookmark unmarked as favorite successfully'
				)
			)
		} catch (error) {
			if (error instanceof BookmarkNotFoundError) {
				return res
					.status(StatusCodes.NOT_FOUND)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			next(error)
		}
	}

	async updateTitle(
		req: Request<{ id: string }, Record<string, never>, { title: string }>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const { id } = req.params
			const { title } = req.body
			const result = await this.bookmarkService.updateTitle(user, id, title)
			return res.status(StatusCodes.OK).json(
				ApiResponseBuilder.success(
					{
						bookmark: {
							id: result.id,
							title: result.title
						}
					},
					'Bookmark title updated successfully'
				)
			)
		} catch (error) {
			if (error instanceof BookmarkNotFoundError) {
				return res
					.status(StatusCodes.NOT_FOUND)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			next(error)
		}
	}
}
