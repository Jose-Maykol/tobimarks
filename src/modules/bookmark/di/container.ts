import { container } from 'tsyringe'

import {
	BOOKMARK_CONTROLLER,
	BOOKMARK_REPOSITORY,
	BOOKMARK_SERVICE,
	METADATA_EXTRACTOR_SERVICE,
	WEBSITE_REPOSITORY
} from './token'
import { BookmarkController } from '../controllers/bookmark.controller'
import { BookmarkRepository } from '../repositories/bookmark.repository'
import { WebsiteRepository } from '../repositories/websites.repository'
import { BookmarkService } from '../services/bookmark.service'
import { MetadataExtractorService } from '../services/metadata-extractor.service'

export const registerBookmarkDependencies = () => {
	container.register(BOOKMARK_CONTROLLER, { useClass: BookmarkController })
	container.register(BOOKMARK_SERVICE, { useClass: BookmarkService })
	container.register(BOOKMARK_REPOSITORY, { useClass: BookmarkRepository })
	/*   container.register(WEBSITE_CONTROLLER, { useClass: WebsiteController })
  container.register(WEBSITE_SERVICE, { useClass: WebsiteService }) */
	container.register(WEBSITE_REPOSITORY, { useClass: WebsiteRepository })
	container.register(METADATA_EXTRACTOR_SERVICE, { useClass: MetadataExtractorService })
}
