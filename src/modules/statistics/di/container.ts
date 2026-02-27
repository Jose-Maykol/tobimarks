import { container } from 'tsyringe'

import { STATISTICS_CONTROLLER, STATISTICS_REPOSITORY, STATISTICS_SERVICE } from './tokens'
import { StatisticsController } from '../controllers/statistics.controller'
import { StatisticsRepository } from '../repositories/statistics.repository'
import { StatisticsService } from '../services/statistics.service'

export const registerStatisticsDependencies = () => {
	container.registerSingleton(STATISTICS_REPOSITORY, StatisticsRepository)
	container.registerSingleton(STATISTICS_SERVICE, StatisticsService)
	container.registerSingleton(STATISTICS_CONTROLLER, StatisticsController)
}
