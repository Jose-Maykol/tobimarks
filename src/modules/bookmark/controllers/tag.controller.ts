import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { inject, injectable } from 'tsyringe'

import { TAG_SERVICE } from '../di/token'
import type { TagService } from '../services/tag.service'
import type { CreateTagRequestBody } from '../types/tags.types'

import { ApiResponseBuilder } from '@/common/utils/api-response'

@injectable()
export class TagController {
	constructor(@inject(TAG_SERVICE) private readonly tagService: TagService) {}

	/**
	 * Retrieves all tags associated with the authenticated user.
	 *
	 * @param req - The HTTP request object.
	 * @param res - The HTTP response object.
	 * @param next - The next middleware function.
	 * @returns A JSON response containing the user's tags.
	 */
	async getByUserId(
		req: Request<Record<string, never>, Record<string, never>, Record<string, never>>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const userId = user.id
			const tags = await this.tagService.getByUserId(userId)
			return res.status(StatusCodes.OK).json(ApiResponseBuilder.success({ tags }))
		} catch (error) {
			next(error)
		}
	}

	/**
	 * Creates a new tag for the authenticated user.
	 *
	 * @param req - The HTTP request object containing the tag data in the body.
	 * @param res - The HTTP response object.
	 * @param next - The next middleware function.
	 * @returns A JSON response containing the created tag.
	 */
	async create(
		req: Request<Record<string, never>, Record<string, never>, CreateTagRequestBody>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const data = req.body
			const createdTag = await this.tagService.create(user, data)
			return res.status(StatusCodes.CREATED).json(ApiResponseBuilder.success({ tag: createdTag }))
		} catch (error) {
			next(error)
		}
	}
}
