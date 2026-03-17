import { DatabaseError } from 'pg'
import { inject, injectable } from 'tsyringe'

import type {
	Bookmark,
	BookmarkListItemDto,
	CreateBookmarkDto,
	UpdateBookmarkDto,
	BookmarkFilters
} from '../models/bookmark.model'

import type { PaginatedResult, PaginationOptions } from '@/common/types/pagination.type'
import type { IDatabaseContext } from '@/core/database/database-context'
import { UniqueConstraintViolationError } from '@/core/database/database.exceptions'
import { DATABASE_CONTEXT } from '@/core/di/tokens'
import type { IQueryRunner } from '@/core/types/database.type'

export interface IBookmarkRepository {
	findById(id: string): Promise<Bookmark | null>
	findByUserId(
		userId: string,
		options: PaginationOptions,
		filters?: BookmarkFilters
	): Promise<PaginatedResult<BookmarkListItemDto>>
	existsByIdAndUserId(id: string, userId: string): Promise<boolean>
	create(params: CreateBookmarkDto, queryRunner?: IQueryRunner): Promise<Partial<Bookmark>>
	softDelete(id: string): Promise<Pick<Bookmark, 'id'>>
	updateFavoriteStatus(
		id: string,
		isFavorite: boolean
	): Promise<Pick<Bookmark, 'id' | 'isFavorite'>>
	update(id: string, data: UpdateBookmarkDto, queryRunner?: IQueryRunner): Promise<void>
	registerAccess(id: string): Promise<void>
}

@injectable()
export class BookmarkRepository implements IBookmarkRepository {
	constructor(@inject(DATABASE_CONTEXT) private readonly dbContext: IDatabaseContext) {}

	async create(params: CreateBookmarkDto, queryRunner?: IQueryRunner): Promise<Partial<Bookmark>> {
		const db = queryRunner ?? this.dbContext
		const query = `
      INSERT INTO bookmarks (
        user_id, 
        website_id, 
        url, 
        title, 
        description, 
        og_title, 
        og_description, 
        og_image_url, 
        collection_id,
        is_favorite, 
        is_archived
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
      RETURNING 
        id, 
        url, 
        title, 
        description
    `
		const values = [
			params.userId,
			params.websiteId,
			params.url || null,
			params.title,
			params.description,
			params.ogTitle,
			params.ogDescription,
			params.ogImageUrl,
			params.collectionId || null,
			params.isFavorite || false,
			params.isArchived || false
		]

		try {
			const result = await db.query<Bookmark>(query, values)
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

	async findById(id: string): Promise<Bookmark | null> {
		const query = `
      SELECT 
        id, 
        user_id AS "userId", 
        website_id AS "websiteId", 
        url, 
        title, 
        og_title AS "ogTitle", 
        og_description AS "ogDescription", 
        og_image_url AS "ogImageUrl", 
        collection_id AS "collectionId",
        is_favorite AS "isFavorite", 
        is_archived AS "isArchived", 
        created_at AS "createdAt", 
        updated_at AS "updatedAt", 
        last_accessed_at AS "lastAccessedAt", 
        access_count AS "accessCount", 
        search_vector AS "searchVector"
      FROM bookmarks
      WHERE id = $1
			AND deleted_at IS NULL
    `
		const result = await this.dbContext.query<Bookmark>(query, [id])
		return result.rows[0] || null
	}

	async findByUserId(
		userId: string,
		options: PaginationOptions,
		filters?: BookmarkFilters
	): Promise<PaginatedResult<BookmarkListItemDto>> {
		let selectClause = `
      SELECT 
        b.id, 
        b.url, 
        COALESCE(b.title, b.og_title) AS title, 
        b.is_favorite AS "isFavorite", 
        b.is_archived AS "isArchived", 
        b.access_count AS "accessCount",
				b.last_accessed_at AS "lastAccessedAt",
        w.domain, 
        w.favicon_url AS "faviconUrl",
        COALESCE(
          (
            SELECT json_agg(
                json_build_object(
                    'id', t.id,
                    'name', t.name,
                    'slug', t.slug,
                    'color', t.color
                )
            )
            FROM bookmark_tags bt
            INNER JOIN tags t ON t.id = bt.tag_id
            WHERE bt.bookmark_id = b.id
          ), '[]'
        ) AS tags
    `
		const countClause = 'SELECT COUNT(*) AS total'

		const fromClause = `
      FROM bookmarks b
      INNER JOIN websites w ON b.website_id = w.id
    `

		let whereClause = `
      WHERE b.user_id = $1
			AND b.deleted_at IS NULL
    `

		//eslint-disable-next-line @typescript-eslint/no-explicit-any
		const values: any[] = [userId]

		const applyPeriodFilter =
			filters?.accessedWithin === 'week' || filters?.accessedWithin === 'month'

		let joinTrendingClause = ''
		let groupByClause = ''

		if (applyPeriodFilter) {
			const interval = filters.accessedWithin === 'week' ? '7 days' : '1 month'
			joinTrendingClause = `
        INNER JOIN bookmark_access_logs bal 
        ON bal.bookmark_id = b.id AND bal.accessed_at >= NOW() - INTERVAL '${interval}'
      `

			groupByClause = `
        GROUP BY b.id, w.id
      `

			selectClause = selectClause.replace(
				'b.access_count AS "accessCount",',
				'COUNT(bal.id) AS "accessCount",'
			)
		}

		if (filters?.isFavorite !== undefined) {
			values.push(filters.isFavorite)
			whereClause += ` AND b.is_favorite = $${values.length}`
		}

		if (filters?.collectionId !== undefined) {
			if (filters.collectionId === null) {
				whereClause += ' AND b.collection_id IS NULL'
			} else {
				values.push(filters.collectionId)
				whereClause += ` AND b.collection_id = $${values.length}`
			}
		}

		if (filters?.tags && filters.tags.length > 0) {
			values.push(filters.tags)
			whereClause += ` AND EXISTS (
				SELECT 1 FROM bookmark_tags bt 
				WHERE bt.bookmark_id = b.id AND bt.tag_id = ANY($${values.length}::uuid[])
			)`
		}

		const sortColumns: Record<string, string> = {
			createdAt: 'b.created_at',
			lastAccessedAt: 'b.last_accessed_at',
			accessCount: applyPeriodFilter ? 'COUNT(bal.id)' : 'b.access_count'
		}

		const sortBy =
			filters?.sortBy && sortColumns[filters.sortBy] ? sortColumns[filters.sortBy] : 'b.created_at'
		const sortOrder = filters?.sortDirection === 'asc' ? 'ASC' : 'DESC'
		const nullsPosition = sortOrder === 'DESC' ? 'NULLS LAST' : 'NULLS FIRST'

		const orderClause = ` ORDER BY ${sortBy} ${sortOrder} ${nullsPosition}`

		const offset = (options.page - 1) * options.limit
		const limitClause = ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`
		const valuesWithPagination = [...values, options.limit, offset]

		const dataQuery =
			selectClause +
			fromClause +
			joinTrendingClause +
			whereClause +
			groupByClause +
			orderClause +
			limitClause
		const countQuery = countClause + fromClause + whereClause

		const [dataResult, countResult] = await Promise.all([
			this.dbContext.query<BookmarkListItemDto>(dataQuery, valuesWithPagination),
			this.dbContext.query<{ total: string }>(countQuery, values)
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

	async existsByIdAndUserId(id: string, userId: string): Promise<boolean> {
		const query = `
      SELECT 1
      FROM bookmarks
      WHERE id = $1 AND user_id = $2
      LIMIT 1
    `
		const result = await this.dbContext.query(query, [id, userId])
		return result.rowCount > 0
	}

	async softDelete(id: string): Promise<Pick<Bookmark, 'id'>> {
		const query = `
      UPDATE bookmarks
      SET deleted_at = NOW()
      WHERE id = $1
      RETURNING id
    `
		const result = await this.dbContext.query<Pick<Bookmark, 'id'>>(query, [id])
		return result.rows[0]!
	}

	async updateFavoriteStatus(
		id: string,
		isFavorite: boolean
	): Promise<Pick<Bookmark, 'id' | 'isFavorite'>> {
		const query = `
      UPDATE bookmarks
      SET is_favorite = $1
      WHERE id = $2
      RETURNING id, is_favorite AS "isFavorite"
    `
		const result = await this.dbContext.query<Pick<Bookmark, 'id' | 'isFavorite'>>(query, [
			isFavorite,
			id
		])
		return result.rows[0]!
	}

	async update(id: string, data: UpdateBookmarkDto, queryRunner?: IQueryRunner): Promise<void> {
		const db = queryRunner ?? this.dbContext
		const updates: string[] = []
		const values: (string | null)[] = []

		if (data.title !== undefined) {
			updates.push('title = $' + (values.length + 1))
			values.push(data.title)
		}

		if (data.collectionId !== undefined) {
			updates.push('collection_id = $' + (values.length + 1))
			values.push(data.collectionId)
		}

		if (updates.length > 0) {
			const query = `
			UPDATE bookmarks
			SET ${updates.join(', ')}
			WHERE id = $${values.length + 1}
		`
			values.push(id)
			await db.query(query, values)
		}

		if (data.tags !== undefined) {
			await db.query('DELETE FROM bookmark_tags WHERE bookmark_id = $1;', [id])
			if (data.tags.length > 0) {
				await db.query(
					`INSERT INTO bookmark_tags (bookmark_id, tag_id)
					SELECT $1, unnest($2::uuid[]);`,
					[id, data.tags]
				)
			}
		}
	}

	async registerAccess(id: string): Promise<void> {
		const query = `
			WITH updated_bookmark AS (
				UPDATE bookmarks
				SET 
					last_accessed_at = NOW(),
					access_count = access_count + 1
				WHERE id = $1
				RETURNING id
			)
			INSERT INTO bookmark_access_logs (bookmark_id)
			SELECT id FROM updated_bookmark;
		`
		await this.dbContext.query(query, [id])
	}
}
