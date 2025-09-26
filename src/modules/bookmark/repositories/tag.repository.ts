import { DatabaseError } from 'pg'
import { inject, injectable } from 'tsyringe'

import type { CreateTagDto, Tag } from '../models/tag.model'

import type { IDatabaseContext } from '@/core/database/database-context'
import { UniqueConstraintViolationError } from '@/core/database/database.exceptions'
import { DATABASE_CONTEXT } from '@/core/di/tokens'

export interface ITagRepository {
	create(data: CreateTagDto): Promise<Tag>
	findByUserId(userId: string): Promise<Tag[]>
	findById(id: string): Promise<Tag | null>
	existsByIdAndUserId(id: string, userId: string): Promise<boolean>
	update(id: string, data: Partial<Tag>): Promise<Tag | null>
	delete(id: string): Promise<Pick<Tag, 'id'> | null>
}

@injectable()
export class TagRepository implements ITagRepository {
	constructor(@inject(DATABASE_CONTEXT) private readonly dbContext: IDatabaseContext) {}

	async create(data: CreateTagDto): Promise<Tag> {
		const query = `
			INSERT INTO tags (user_id, name, slug, embedding)
			VALUES ($1, $2, $3, $4)
			RETURNING 
				id, 
				user_id AS "userId", 
				name, 
				slug, 
				created_at AS "createdAt", 
				updated_at AS "updatedAt"
		`
		const values = [data.userId, data.name, data.slug, data.embedding]

		try {
			const result = await this.dbContext.query<Tag>(query, values)
			return result.rows[0]!
		} catch (error) {
			if (error instanceof DatabaseError) {
				if (error.code === '23505') {
					throw new UniqueConstraintViolationError(error.detail)
				}
			}
			throw error
		}
	}

	async findByUserId(userId: string): Promise<Tag[]> {
		const query = `
			SELECT 
				id, 
				user_id AS "userId", 
				name, 
				slug, 
				usage_count AS "usageCount", 
				created_at AS "createdAt", 
				updated_at AS "updatedAt"
			FROM tags
			WHERE user_id = $1
			ORDER BY name ASC
		`
		const values = [userId]

		const result = await this.dbContext.query<Tag>(query, values)
		return result.rows
	}

	async findById(id: string): Promise<Tag | null> {
		const query = `
			SELECT
				id, 
				user_id AS "userId", 
				name,
				slug,
				usage_count AS "usageCount",
				created_at AS "createdAt",
				updated_at AS "updatedAt"
			FROM tags
			WHERE id = $1
		`
		const values = [id]
		const result = await this.dbContext.query<Tag>(query, values)
		return result.rows[0] || null
	}

	async existsByIdAndUserId(id: string, userId: string): Promise<boolean> {
		const query = `
			SELECT 1
			FROM tags
			WHERE id = $1 AND user_id = $2
			LIMIT 1
		`
		const values = [id, userId]
		const result = await this.dbContext.query<{ '1': number }>(query, values)
		return result.rowCount > 0
	}

	async update(id: string, data: Partial<Tag>): Promise<Tag | null> {
		const fields = []
		const values = []
		let index = 1

		if (data.name !== undefined) {
			fields.push(`name = $${index++}`)
			values.push(data.name)
		}
		if (data.slug !== undefined) {
			fields.push(`slug = $${index++}`)
			values.push(data.slug)
		}

		values.push(id)

		const query = `
			UPDATE tags
			SET ${fields.join(', ')}, updated_at = NOW()
			WHERE id = $${index}
			RETURNING 
				id, 
				user_id AS "userId", 
				name, 
				slug, 
				usage_count AS "usageCount", 
				created_at AS "createdAt", 
				updated_at AS "updatedAt"
		`

		const result = await this.dbContext.query<Tag>(query, values)
		return result.rows[0] || null
	}

	async delete(id: string): Promise<Pick<Tag, 'id'> | null> {
		const query = `
			DELETE FROM tags
			WHERE id = $1
			RETURNING id
		`
		const values = [id]

		const result = await this.dbContext.query<Pick<Tag, 'id'>>(query, values)
		return result.rows[0] || null
	}
}
