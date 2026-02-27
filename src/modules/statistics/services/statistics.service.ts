import { inject, injectable } from 'tsyringe'

import { STATISTICS_REPOSITORY } from '../di/tokens'
import type { IStatisticsRepository } from '../repositories/statistics.repository'
import type { GeneralSummary } from '../types/statistics.types'

import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

@injectable()
export class StatisticsService {
	constructor(
		@inject(STATISTICS_REPOSITORY)
		private readonly statisticsRepository: IStatisticsRepository
	) {}

	async getGeneralSummary(user: AccessTokenPayload): Promise<GeneralSummary> {
		return await this.statisticsRepository.getGeneralSummary(user.sub)
	}
}
