import { inject, injectable } from 'tsyringe'

import { WEBSITE_REPOSITORY } from '../di/token'
import type { Website } from '../models/website.model'
import type { IWebsiteRepository } from '../repositories/websites.repository'

import { LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

/**
 * Servicio encargado de la gestión de sitios web (dominios) asociados a los marcadores.
 */
@injectable()
export class WebsiteService {
	private readonly logger: ILogger

	constructor(
		@inject(WEBSITE_REPOSITORY) private readonly websiteRepository: IWebsiteRepository,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'WebsiteService' })
	}

	/**
	 * Obtiene todos los sitios web asociados a los marcadores de un usuario específico.
	 *
	 * @param user - Los datos del usuario autenticado (payload del token).
	 * @returns Una promesa que se resuelve con la lista de sitios web.
	 */
	async getByUserId(user: AccessTokenPayload): Promise<Website[]> {
		this.logger.info('Fetching websites for user', { userId: user.sub })
		const websites = await this.websiteRepository.findByUserId(user.sub)
		this.logger.info('Websites fetched successfully', { userId: user.sub, count: websites.length })
		return websites
	}
}
