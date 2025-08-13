import { inject, injectable } from 'tsyringe'

import type { IDatabaseContext } from '../../core/database/database-context'
import type { User, CreateUserDto } from '../models/user.model'

import { DATABASE_CONTEXT } from '@/core/di/tokens'

export interface IUserRepository {
	findByGoogleId(googleId: string): Promise<User | null>
	create(params: CreateUserDto): Promise<User>
}

@injectable()
export class UserRepository implements IUserRepository {
	constructor(@inject(DATABASE_CONTEXT) private readonly dbContext: IDatabaseContext) {}

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

	async create(params: CreateUserDto): Promise<User> {
		const query = `
			INSERT INTO users (google_id, email, display_name, avatar_url)
			VALUES ($1, $2, $3, $4)
			RETURNING 
				id, 
				google_id AS "googleId", 
				email, 
				display_name AS "displayName", 
				avatar_url AS "avatarUrl",
				created_at AS "createdAt", 
				updated_at AS "updatedAt", 
				last_login_at AS "lastLoginAt", 
				is_active AS "isActive"
		`
		const values = [params.googleId, params.email, params.displayName, params.avatarUrl ?? null]
		const result = await this.dbContext.query<User>(query, values)
		if (!result.rows[0]) {
			throw new Error('Failed to create user')
		}
		return result.rows[0]
	}
}
