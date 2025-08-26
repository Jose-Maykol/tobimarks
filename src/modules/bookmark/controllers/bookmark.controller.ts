import type { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { BOOKMARK_SERVICE } from '../di/token'
import type { BookmarkService } from '../services/bookmark.service'
import type { CreateBookmarkRequestBody } from '../types/bookmark.types'

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
			const user = req.user
			const body = req.body
			const bookmark = await this.bookmarkService.create(user, body)
			return res.status(201).json(bookmark)
		} catch (error) {
			next(error)
		}
	}
}
