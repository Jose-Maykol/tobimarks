import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { inject, injectable } from 'tsyringe'

import { STATISTICS_SERVICE } from '../di/tokens'
import type { StatisticsService } from '../services/statistics.service'

import { ApiResponseBuilder } from '@/common/utils/api-response'

/**
 * Controlador para gestionar las estadísticas del usuario.
 * Proporciona métodos para obtener resúmenes generales de la actividad.
 */
@injectable()
export class StatisticsController {
	constructor(
		@inject(STATISTICS_SERVICE)
		private readonly statisticsService: StatisticsService
	) {}

	/**
	 * Obtiene un resumen general de las estadísticas del usuario autenticado.
	 * Incluye conteos de marcadores, colecciones, sitios web, etc.
	 *
	 * @param req - El objeto de solicitud HTTP con el usuario autenticado.
	 * @param res - El objeto de respuesta HTTP.
	 */
	async getSummary(req: Request, res: Response) {
		const user = req.user!
		const summary = await this.statisticsService.getGeneralSummary(user)

		return res
			.status(StatusCodes.OK)
			.json(
				ApiResponseBuilder.success({ summary }, 'General statistics summary retrieved successfully')
			)
	}
}
