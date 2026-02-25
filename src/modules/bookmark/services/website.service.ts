import { inject, injectable } from 'tsyringe'

import { WEBSITE_REPOSITORY } from '../di/token'
import type { Website } from '../models/website.model'
import type { IWebsiteRepository } from '../repositories/websites.repository'

import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

@injectable()
export class WebsiteService {
	constructor(@inject(WEBSITE_REPOSITORY) private readonly websiteRepository: IWebsiteRepository) {}

	async getByUserId(user: AccessTokenPayload): Promise<Website[]> {
		return await this.websiteRepository.findByUserId(user.sub)
	}
}
