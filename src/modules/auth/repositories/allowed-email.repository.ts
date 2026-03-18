import { inject, injectable } from 'tsyringe'

import type { IDatabaseContext } from '@/core/database/database-context'
import { DATABASE_CONTEXT } from '@/core/di/tokens'

export interface IAllowedEmailRepository {
	isEmailAllowed(email: string): Promise<boolean>
}

@injectable()
export class AllowedEmailRepository implements IAllowedEmailRepository {
	constructor(@inject(DATABASE_CONTEXT) private readonly dbContext: IDatabaseContext) {}

	async isEmailAllowed(email: string): Promise<boolean> {
		const query = `
			SELECT EXISTS(
				SELECT 1 FROM allowed_emails WHERE email = $1
			) AS "isAllowed"
		`
		const result = await this.dbContext.query<{ isAllowed: boolean }>(query, [email])
		return result.rows[0]?.isAllowed ?? false
	}
}
