import { DatabaseError } from 'pg'
import { inject, injectable } from 'tsyringe'

import type {
	Collection,
	CreateCollectionDto,
	UpdateCollectionDto
} from '../models/collection.model'

import type { PaginatedResult, PaginationOptions } from '@/common/types/pagination.type'
import type { IDatabaseContext } from '@/core/database/database-context'
import { UniqueConstraintViolationError } from '@/core/database/database.exceptions'
import { DATABASE_CONTEXT } from '@/core/di/tokens'
import type { IQueryRunner } from '@/core/types/database.type'

export interface ICollectionRepository {
	create(params: CreateCollectionDto): Promise<Collection>
	findByUserId(userId: string, options: PaginationOptions): Promise<PaginatedResult<Collection>>
	findByIdAndUserId(id: string, userId: string): Promise<Collection | null>
	update(id: string, data: UpdateCollectionDto): Promise<Collection>
	updateBookmarkCount(id: string, increment: number, queryRunner?: IQueryRunner): Promise<void>
}

@injectable()
export class CollectionRepository implements ICollectionRepository {
	constructor(@inject(DATABASE_CONTEXT) private readonly dbContext: IDatabaseContext) {}

	async create(params: CreateCollectionDto): Promise<Collection> {
		const query = `
			INSERT INTO collections (user_id, name, description, color, icon, bookmarks_count)
			VALUES ($1, $2, $3, $4, $5, 0)
			RETURNING id, user_id AS "userId", name, description, color, icon, bookmarks_count AS "bookmarksCount", created_at AS "createdAt", updated_at AS "updatedAt"
		`
		const values = [
			params.userId,
			params.name,
			params.description || null,
			params.color || null,
			params.icon || 'folder'
		]

		try {
			const result = await this.dbContext.query<Collection>(query, values)
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

	async findByUserId(
		userId: string,
		options: PaginationOptions
	): Promise<PaginatedResult<Collection>> {
		const selectClause = `
			SELECT 
				id, user_id AS "userId", name, description, color, icon, bookmarks_count AS "bookmarksCount", created_at AS "createdAt", updated_at AS "updatedAt"
			FROM collections
			WHERE user_id = $1
		`
		const countQuery = 'SELECT COUNT(*) AS total FROM collections WHERE user_id = $1'

		const offset = (options.page - 1) * options.limit
		const dataQuery = `${selectClause} ORDER BY created_at DESC LIMIT $2 OFFSET $3`

		const [dataResult, countResult] = await Promise.all([
			this.dbContext.query<Collection>(dataQuery, [userId, options.limit, offset]),
			this.dbContext.query<{ total: string }>(countQuery, [userId])
		])

		const total = parseInt(countResult?.rows?.[0]?.total || '0', 10)

		return {
			data: dataResult.rows,
			meta: {
				page: options.page,
				perPage: options.limit,
				total,
				totalPages: Math.ceil(total / options.limit)
			}
		}
	}

	async findByIdAndUserId(id: string, userId: string): Promise<Collection | null> {
		const query = `
			SELECT id, user_id AS "userId", name, description, color, icon, bookmarks_count AS "bookmarksCount", created_at AS "createdAt", updated_at AS "updatedAt"
			FROM collections
			WHERE id = $1 AND user_id = $2
		`
		const result = await this.dbContext.query<Collection>(query, [id, userId])
		return result.rows[0] || null
	}

	async update(id: string, data: UpdateCollectionDto): Promise<Collection> {
		const updates: string[] = []
		const values: (string | null)[] = []

		if (data.name !== undefined) {
			updates.push('name = $' + (values.length + 1))
			values.push(data.name)
		}

		if (data.description !== undefined) {
			updates.push('description = $' + (values.length + 1))
			values.push(data.description)
		}

		if (data.color !== undefined) {
			updates.push('color = $' + (values.length + 1))
			values.push(data.color)
		}

		if (data.icon !== undefined) {
			updates.push('icon = $' + (values.length + 1))
			values.push(data.icon)
		}

		updates.push('updated_at = NOW()')

		const query = `
			UPDATE collections
			SET ${updates.join(', ')}
			WHERE id = $${values.length + 1}
			RETURNING id, user_id AS "userId", name, description, color, icon, bookmarks_count AS "bookmarksCount", created_at AS "createdAt", updated_at AS "updatedAt"
		`
		values.push(id)

		const result = await this.dbContext.query<Collection>(query, values)
		return result.rows[0]!
	}

	async updateBookmarkCount(
		id: string,
		increment: number,
		queryRunner?: IQueryRunner
	): Promise<void> {
		const db = queryRunner ?? this.dbContext
		const query = `
			UPDATE collections
			SET bookmarks_count = bookmarks_count + $1
			WHERE id = $2
		`
		await db.query(query, [increment, id])
	}
}
