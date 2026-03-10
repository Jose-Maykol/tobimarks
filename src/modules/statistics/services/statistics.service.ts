import { inject, injectable } from 'tsyringe'

import { STATISTICS_REPOSITORY } from '../di/tokens'
import type { IStatisticsRepository } from '../repositories/statistics.repository'
import type { GeneralSummary } from '../types/statistics.types'

import { LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

@injectable()
export class StatisticsService {
	private readonly logger: ILogger

	constructor(
		@inject(STATISTICS_REPOSITORY)
		private readonly statisticsRepository: IStatisticsRepository,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'StatisticsService' })
	}

	async getGeneralSummary(user: AccessTokenPayload): Promise<GeneralSummary> {
		this.logger.info('Fetching general summary', { userId: user.sub })
		const summary = await this.statisticsRepository.getGeneralSummary(user.sub)
		this.logger.info('General summary fetched successfully', { userId: user.sub })
		return summary
	}
}
