import { inject, injectable } from 'tsyringe'

import type { CreateWebsiteDto, Website } from '../models/website.model'

import type { IDatabaseContext } from '@/core/database/database-context'
import { DATABASE_CONTEXT } from '@/core/di/tokens'

export interface IWebsiteRepository {
	findByDomain(domain: string): Promise<Website | null>
	create(params: CreateWebsiteDto): Promise<Website>
}

@injectable()
export class WebsiteRepository implements IWebsiteRepository {
	constructor(@inject(DATABASE_CONTEXT) private readonly dbContext: IDatabaseContext) {}

	async findByDomain(domain: string): Promise<Website | null> {
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
		const result = await this.dbContext.query<Website>(query, [domain])
		return result.rows[0] ?? null
	}

	async create(params: CreateWebsiteDto): Promise<Website> {
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
		const result = await this.dbContext.query<Website>(query, values)
		if (!result.rows[0]) {
			throw new Error('Failed to create website')
		}
		return result.rows[0]
	}
}
