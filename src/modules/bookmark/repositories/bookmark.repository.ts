import { DatabaseError } from 'pg'
import { inject, injectable } from 'tsyringe'

import type { Bookmark, CreateBookmarkDto } from '../models/bookmark.model'

import type { IDatabaseContext } from '@/core/database/database-context'
import { UniqueConstraintViolationError } from '@/core/database/database.exceptions'
import { DATABASE_CONTEXT } from '@/core/di/tokens'

export interface IBookmarkRepository {
	findById(id: string): Promise<Bookmark | null>
	findByUserId(userId: string): Promise<Bookmark[]>
	create(params: CreateBookmarkDto): Promise<Bookmark>
	softDelete(id: string): Promise<Pick<Bookmark, 'id'>>
	updateFavoriteStatus(
		id: string,
		isFavorite: boolean
	): Promise<Pick<Bookmark, 'id' | 'isFavorite'>>
}

@injectable()
export class BookmarkRepository implements IBookmarkRepository {
	constructor(@inject(DATABASE_CONTEXT) private readonly dbContext: IDatabaseContext) {}

	async create(params: CreateBookmarkDto): Promise<Bookmark> {
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING 
        id, 
        user_id AS "userId", 
        website_id AS "websiteId", 
        category_id AS "categoryId", 
        url, 
        title, 
        description, 
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
    `
		const values = [
			params.userId,
			params.websiteId,
			params.categoryId || null,
			params.url || null,
			params.title || null,
			params.description || null,
			params.ogTitle || null,
			params.ogDescription || null,
			params.ogImageUrl || null,
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

	async findByUserId(userId: string): Promise<Bookmark[]> {
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
      WHERE user_id = $1
      ORDER BY created_at DESC
    `

		const result = await this.dbContext.query<Bookmark>(query, [userId])
		return result.rows
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
}
