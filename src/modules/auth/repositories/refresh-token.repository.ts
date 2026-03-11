import { inject, injectable } from 'tsyringe'

import type {
	CreateRefreshTokenDto,
	RefreshToken,
	UpdateRefreshTokenDto
} from '../models/refresh-token.model'

import type { IDatabaseContext } from '@/core/database/database-context'
import { DATABASE_CONTEXT } from '@/core/di/tokens'
import type { IQueryRunner } from '@/core/types/database.type'

export interface IRefreshTokenRepository {
	upsert(data: CreateRefreshTokenDto, runner?: IQueryRunner): Promise<RefreshToken>
	findByHash(tokenHash: string, runner?: IQueryRunner): Promise<RefreshToken | null>
	update(id: string, data: UpdateRefreshTokenDto, runner?: IQueryRunner): Promise<RefreshToken>
	revokeAllForUser(userId: string, runner?: IQueryRunner): Promise<void>
}

@injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
	constructor(@inject(DATABASE_CONTEXT) private readonly dbContext: IDatabaseContext) {}

	async upsert(data: CreateRefreshTokenDto, runner?: IQueryRunner): Promise<RefreshToken> {
		const queryRunner = runner ?? this.dbContext

		const query = `
			INSERT INTO refresh_tokens (
				user_id, token_hash, device_id, device_name, user_agent, ip_address, expires_at
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7
			)
			ON CONFLICT (user_id, device_id)
			DO UPDATE SET
				token_hash = EXCLUDED.token_hash,
				device_name = COALESCE(EXCLUDED.device_name, refresh_tokens.device_name),
				user_agent = COALESCE(EXCLUDED.user_agent, refresh_tokens.user_agent),
				ip_address = COALESCE(EXCLUDED.ip_address, refresh_tokens.ip_address),
				expires_at = EXCLUDED.expires_at,
				is_active = true,
				last_used_at = NOW()
			RETURNING 
				id,
				user_id as "userId",
				token_hash as "tokenHash",
				device_id as "deviceId",
				device_name as "deviceName",
				user_agent as "userAgent",
				ip_address as "ipAddress",
				expires_at as "expiresAt",
				created_at as "createdAt",
				last_used_at as "lastUsedAt",
				is_active as "isActive"
		`
		const params = [
			data.userId,
			data.tokenHash,
			data.deviceId,
			data.deviceName,
			data.userAgent,
			data.ipAddress,
			data.expiresAt
		]

		const result = await queryRunner.query<RefreshToken>(query, params)
		return result.rows[0]!
	}

	async findByHash(tokenHash: string, runner?: IQueryRunner): Promise<RefreshToken | null> {
		const queryRunner = runner ?? this.dbContext
		const query = `
			SELECT 
				id,
				user_id as "userId",
				token_hash as "tokenHash",
				device_id as "deviceId",
				device_name as "deviceName",
				user_agent as "userAgent",
				ip_address as "ipAddress",
				expires_at as "expiresAt",
				created_at as "createdAt",
				last_used_at as "lastUsedAt",
				is_active as "isActive"
			FROM refresh_tokens
			WHERE token_hash = $1
		`
		const result = await queryRunner.query<RefreshToken>(query, [tokenHash])
		return result.rows[0] || null
	}

	async update(
		id: string,
		data: UpdateRefreshTokenDto,
		runner?: IQueryRunner
	): Promise<RefreshToken> {
		const queryRunner = runner ?? this.dbContext

		const setClauses: string[] = []
		const params: unknown[] = [id]
		let paramIndex = 2

		if (data.tokenHash !== undefined) {
			setClauses.push(`token_hash = $${paramIndex++}`)
			params.push(data.tokenHash)
		}
		if (data.expiresAt !== undefined) {
			setClauses.push(`expires_at = $${paramIndex++}`)
			params.push(data.expiresAt)
		}
		if (data.lastUsedAt !== undefined) {
			setClauses.push(`last_used_at = $${paramIndex++}`)
			params.push(data.lastUsedAt)
		}
		if (data.isActive !== undefined) {
			setClauses.push(`is_active = $${paramIndex++}`)
			params.push(data.isActive)
		}

		if (setClauses.length === 0) {
			throw new Error('No valid fields provided for update')
		}

		const query = `
			UPDATE refresh_tokens
			SET ${setClauses.join(', ')}
			WHERE id = $1
			RETURNING 
				id,
				user_id as "userId",
				token_hash as "tokenHash",
				device_id as "deviceId",
				device_name as "deviceName",
				user_agent as "userAgent",
				ip_address as "ipAddress",
				expires_at as "expiresAt",
				created_at as "createdAt",
				last_used_at as "lastUsedAt",
				is_active as "isActive"
		`

		const result = await queryRunner.query<RefreshToken>(query, params)
		return result.rows[0]!
	}

	async revokeAllForUser(userId: string, runner?: IQueryRunner): Promise<void> {
		const queryRunner = runner ?? this.dbContext
		const query = `
			UPDATE refresh_tokens
			SET is_active = false
			WHERE user_id = $1 AND is_active = true
		`
		await queryRunner.query(query, [userId])
	}
}
