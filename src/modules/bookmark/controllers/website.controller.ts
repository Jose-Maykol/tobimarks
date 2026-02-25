import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { inject, injectable } from 'tsyringe'

import { WEBSITE_SERVICE } from '../di/token'
import type { WebsiteService } from '../services/website.service'

import { ApiResponseBuilder } from '@/common/utils/api-response'

@injectable()
export class WebsiteController {
	constructor(@inject(WEBSITE_SERVICE) private readonly websiteService: WebsiteService) {}

	async getByUserId(req: Request, res: Response, next: NextFunction) {
		try {
			const user = req.user!
			const websites = await this.websiteService.getByUserId(user)

			return res.status(StatusCodes.OK).json(
				ApiResponseBuilder.success(
					{
						websites: websites.map((w) => ({
							id: w.id,
							domain: w.domain,
							name: w.name,
							faviconUrl: w.faviconUrl,
							primaryColor: w.primaryColor,
							bookmarkCount: w.bookmarkCount,
							createdAt: w.createdAt,
							updatedAt: w.updatedAt
						}))
					},
					'Se han cargado los sitios web exitosamente'
				)
			)
		} catch (error) {
			next(error)
		}
	}
}
