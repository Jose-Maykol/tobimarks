import { inject, injectable } from 'tsyringe'

import type { IDatabaseContext } from '../../core/database/database-context'
import type { User } from '../models/user.model'

export interface IUserRepository {
	findByGoogleId(googleId: string): Promise<User | null>
}

@injectable()
export class UserRepositoryImpl implements IUserRepository {
	constructor(@inject('DatabaseContext') private readonly dbContext: IDatabaseContext) {}

	async findByGoogleId(googleId: string): Promise<User | null> {
		const query = `
      SELECT 
        id, 
        google_id AS "googleId", 
        email, 
        display_name AS "displayName", 
        avatar_url AS "avatarUrl",
        created_at AS "createdAt", 
        updated_at AS "updatedAt", 
        last_login_at AS "lastLoginAt", 
        is_active AS "isActive"
      FROM users
      WHERE google_id = $1
    `
		const result = await this.dbContext.query<User>(query, [googleId])
		return result.rows[0] ?? null
	}
}
