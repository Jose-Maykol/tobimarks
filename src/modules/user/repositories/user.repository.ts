import { inject, injectable } from 'tsyringe'

import type { User, CreateUserDto, ProfileUserDto, UserSettings } from '../models/user.model'

import type { IDatabaseContext } from '@/core/database/database-context'
import { DATABASE_CONTEXT } from '@/core/di/tokens'

export interface IUserRepository {
	findByGoogleId(googleId: string): Promise<User | null>
	findById(id: string): Promise<ProfileUserDto | null>
	create(params: CreateUserDto): Promise<User>
	updateSettings(userId: string, settings: Partial<UserSettings>): Promise<ProfileUserDto>
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
        is_active AS "isActive",
        settings
      FROM users
      WHERE google_id = $1
    `
		const result = await this.dbContext.query<User>(query, [googleId])
		return result.rows[0] ?? null
	}

	async findById(id: string): Promise<ProfileUserDto | null> {
		const query = `
			SELECT
				id, 
				email, 
				display_name AS "displayName", 
				avatar_url AS "avatarUrl",
				settings
			FROM users
			WHERE id = $1
		`
		const result = await this.dbContext.query<ProfileUserDto>(query, [id])
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
				is_active AS "isActive",
				settings
		`
		const values = [params.googleId, params.email, params.displayName, params.avatarUrl ?? null]
		const result = await this.dbContext.query<User>(query, values)
		//TODO: handle error to domain specific error
		if (!result.rows[0]) {
			throw new Error('Failed to create user')
		}
		return result.rows[0]
	}

	async updateSettings(userId: string, settings: Partial<UserSettings>): Promise<ProfileUserDto> {
		const query = `
			UPDATE users
			SET 
				settings = settings || $2::jsonb,
				updated_at = NOW()
			WHERE id = $1
			RETURNING 
				id, 
				email, 
				display_name AS "displayName", 
				avatar_url AS "avatarUrl",
				settings
		`
		const result = await this.dbContext.query<ProfileUserDto>(query, [
			userId,
			JSON.stringify(settings)
		])
		if (!result.rows[0]) {
			throw new Error('User not found while updating settings')
		}
		return result.rows[0]
	}
}
