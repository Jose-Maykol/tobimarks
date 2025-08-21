import { inject, injectable } from 'tsyringe'

import type { Bookmark, CreateBookmarkDto } from '../models/bookmark.model'

import type { IDatabaseContext } from '@/core/database/database-context'
import { DATABASE_CONTEXT } from '@/core/di/tokens'

export interface IBookmarkRepository {
	findById(id: string): Promise<Bookmark | null>
	create(params: CreateBookmarkDto): Promise<Bookmark>
}

@injectable()
export class BookmarkRepository implements IBookmarkRepository {
	constructor(@inject(DATABASE_CONTEXT) private readonly dbContext: IDatabaseContext) {}

	async findById(id: string): Promise<Bookmark | null> {
		const query = `
      SELECT 
        id, 
        user_id AS "userId", 
        website_id AS "websiteId", 
        category_id AS "categoryId", 
        url, 
        title, 
        meta_title AS "metaTitle", 
        meta_description AS "metaDescription", 
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
		return result.rows[0] ?? null
	}

	async create(params: CreateBookmarkDto): Promise<Bookmark> {
		const query = `
      INSERT INTO bookmarks (user_id, website_id, category_id, url, title, meta_title, meta_description, og_image_url, is_favorite, is_archived)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING 
        id, 
        user_id AS "userId", 
        website_id AS "websiteId", 
        category_id AS "categoryId", 
        url, 
        title, 
        meta_title AS "metaTitle", 
        meta_description AS "metaDescription", 
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
			params.categoryId ?? null,
			params.url,
			params.title,
			params.metaTitle ?? null,
			params.metaDescription ?? null,
			params.ogImageUrl ?? null,
			params.isFavorite ?? false,
			params.isArchived ?? false
		]
		const result = await this.dbContext.query<Bookmark>(query, values)
		if (!result.rows[0]) {
			throw new Error('Failed to create bookmark')
		}
		return result.rows[0]
	}
}
