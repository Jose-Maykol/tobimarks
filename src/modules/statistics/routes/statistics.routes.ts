import { Router } from 'express'
import { container } from 'tsyringe'

import { StatisticsController } from '../controllers/statistics.controller'
import { STATISTICS_CONTROLLER } from '../di/tokens'

import { authMiddleware } from '@/common/middlewares/auth.middleware'

const router = Router()
const controller = container.resolve<StatisticsController>(STATISTICS_CONTROLLER)

router.use(authMiddleware)

router.get('/summary', (req, res) => controller.getSummary(req, res))

export { router as statisticsRoutes }
