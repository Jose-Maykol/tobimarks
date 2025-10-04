import { DatabaseError } from 'pg'
import { inject, injectable } from 'tsyringe'

import type {
	Bookmark,
	BookmarkListItemDto,
	CreateBookmarkDto,
	UpdateBookmarkDto
} from '../models/bookmark.model'

import type { IDatabaseContext } from '@/core/database/database-context'
import { UniqueConstraintViolationError } from '@/core/database/database.exceptions'
import { DATABASE_CONTEXT } from '@/core/di/tokens'

export interface IBookmarkRepository {
	findById(id: string): Promise<Bookmark | null>
	findByUserId(userId: string): Promise<BookmarkListItemDto[]>
	existsByIdAndUserId(id: string, userId: string): Promise<boolean>
	create(params: CreateBookmarkDto): Promise<Partial<Bookmark>>
	softDelete(id: string): Promise<Pick<Bookmark, 'id'>>
	updateFavoriteStatus(
		id: string,
		isFavorite: boolean
	): Promise<Pick<Bookmark, 'id' | 'isFavorite'>>
	update(id: string, data: UpdateBookmarkDto): Promise<void>
}

@injectable()
export class BookmarkRepository implements IBookmarkRepository {
	constructor(@inject(DATABASE_CONTEXT) private readonly dbContext: IDatabaseContext) {}

	async create(params: CreateBookmarkDto): Promise<Partial<Bookmark>> {
		const query = `
      INSERT INTO bookmarks (
        user_id, 
        website_id, 
        category_id, 
        url, 
        title, 
        description, 
        og_title, 
        og_description, 
        og_image_url, 
        is_favorite, 
        is_archived
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        setweight(to_tsvector('english', coalesce($5, $7, '')), 'A') ||
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
			params.categoryId,
			params.url || null,
			params.title,
			params.description,
			params.ogTitle,
			params.ogDescription,
			params.ogImageUrl,
			params.isFavorite || false,
			params.isArchived || false
		]

		try {
			const result = await this.dbContext.query<Bookmark>(query, values)
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
        category_id AS "categoryId", 
        url, 
        title, 
        og_title AS "ogTitle", 
        og_description AS "ogDescription", 
        og_image_url AS "ogImageUrl", 
        is_favorite AS "isFavorite", 
        is_archived AS "isArchived", 
        created_at AS "createdAt", 
        updated_at AS "updatedAt", 
        last_accessed_at AS "lastAccessedAt", 
        access_count AS "accessCount", 
        search_vector AS "searchVector"
      FROM bookmarks
      WHERE id = $1
    `
		const result = await this.dbContext.query<Bookmark>(query, [id])
		return result.rows[0] || null
	}

	async findByUserId(userId: string): Promise<BookmarkListItemDto[]> {
		const query = `
      SELECT 
        b.id, 
        b.url, 
        COALESCE(b.title, b.og_title) AS title, 
        b.is_favorite AS "isFavorite", 
        b.is_archived AS "isArchived", 
        b.access_count AS "accessCount",
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
      FROM bookmarks b
      INNER JOIN websites w ON b.website_id = w.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `

		const result = await this.dbContext.query<BookmarkListItemDto>(query, [userId])
		return result.rows
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

	async update(id: string, data: UpdateBookmarkDto): Promise<void> {
		const updates: string[] = []
		const values: (string | null)[] = []

		if (data.title !== undefined) {
			updates.push('title = $' + (values.length + 1))
			values.push(data.title)
		}

		if (updates.length > 0) {
			const query = `
			UPDATE bookmarks
			SET ${updates.join(', ')}
			WHERE id = $${values.length + 1}
		`
			values.push(id)

			try {
				await this.dbContext.query('BEGIN')
				await this.dbContext.query(query, values)

				if (data.tags !== undefined) {
					await this.dbContext.query('DELETE FROM bookmark_tags WHERE bookmark_id = $1;', [id])
					if (data.tags.length > 0) {
						await this.dbContext.query(
							`INSERT INTO bookmark_tags (bookmark_id, tag_id)
						SELECT $1, unnest($2::uuid[]);`,
							[id, data.tags]
						)
					}
				}

				await this.dbContext.query('COMMIT')
			} catch (error) {
				await this.dbContext.query('ROLLBACK')
				throw error
			}
		}
	}
}
