import { inject, injectable } from 'tsyringe'

import type { GeneralSummary } from '../types/statistics.types'

import type { DatabaseContext } from '@/core/database/database-context'
import { DATABASE_CONTEXT } from '@/core/di/tokens'

export interface IStatisticsRepository {
	getGeneralSummary(userId: string): Promise<GeneralSummary>
}

@injectable()
export class StatisticsRepository implements IStatisticsRepository {
	constructor(
		@inject(DATABASE_CONTEXT)
		private readonly dbContext: DatabaseContext
	) {}

	async getGeneralSummary(userId: string): Promise<GeneralSummary> {
		const query = `
			SELECT 
				(SELECT COUNT(*) FROM bookmarks WHERE user_id = $1) as "totalBookmarks",
				(SELECT COUNT(*) FROM collections WHERE user_id = $1) as "totalCollections",
				(SELECT COUNT(*) FROM tags WHERE user_id = $1) as "totalTags"
		`
		const result = await this.dbContext.query<{
			totalBookmarks: string
			totalCollections: string
			totalTags: string
		}>(query, [userId])
		const data = result.rows[0]!

		return {
			totalBookmarks: parseInt(data.totalBookmarks, 10),
			totalCollections: parseInt(data.totalCollections, 10),
			totalTags: parseInt(data.totalTags, 10)
		}
	}
}
