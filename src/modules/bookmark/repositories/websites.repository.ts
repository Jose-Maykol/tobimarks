import { inject, injectable } from 'tsyringe'

import type { CreateWebsiteDto, Website } from '../models/website.model'

import type { IDatabaseContext } from '@/core/database/database-context'
import { DATABASE_CONTEXT } from '@/core/di/tokens'
import type { IQueryRunner } from '@/core/types/database.type'

export interface IWebsiteRepository {
	findByDomain(domain: string, queryRunner?: IQueryRunner): Promise<Website | null>
	create(params: CreateWebsiteDto, queryRunner?: IQueryRunner): Promise<Website>
}

@injectable()
export class WebsiteRepository implements IWebsiteRepository {
	constructor(@inject(DATABASE_CONTEXT) private readonly dbContext: IDatabaseContext) {}

	async findByDomain(domain: string, queryRunner?: IQueryRunner): Promise<Website | null> {
		const db = queryRunner ?? this.dbContext
		const query = `
      SELECT 
        id, 
        domain, 
        name, 
        favicon_url AS "faviconUrl", 
        primary_color AS "primaryColor", 
        bookmark_count AS "bookmarkCount", 
        created_at AS "createdAt", 
        updated_at AS "updatedAt"
      FROM websites
      WHERE domain = $1
    `
		const result = await db.query<Website>(query, [domain])
		return result.rows[0] ?? null
	}

	async create(params: CreateWebsiteDto, queryRunner?: IQueryRunner): Promise<Website> {
		const db = queryRunner ?? this.dbContext
		const query = `
      INSERT INTO websites (domain, name, favicon_url)
      VALUES ($1, $2, $3)
      RETURNING 
        id, 
        domain, 
        name, 
        favicon_url AS "faviconUrl",  
        bookmark_count AS "bookmarkCount", 
        created_at AS "createdAt", 
        updated_at AS "updatedAt"
    `
		const values = [params.domain, params.name, params.faviconUrl]
		const result = await db.query<Website>(query, values)
		if (!result.rows[0]) {
			throw new Error('Failed to create website')
		}
		return result.rows[0]
	}
}
