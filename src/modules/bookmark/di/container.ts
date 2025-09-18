import { container } from 'tsyringe'

import {
	BOOKMARK_CONTROLLER,
	BOOKMARK_REPOSITORY,
	BOOKMARK_SERVICE,
	METADATA_EXTRACTOR_SERVICE,
	TAG_CONTROLLER,
	TAG_REPOSITORY,
	TAG_SERVICE,
	WEBSITE_REPOSITORY
} from './token'
import { BookmarkController } from '../controllers/bookmark.controller'
import { TagController } from '../controllers/tag.controller'
import { BookmarkRepository } from '../repositories/bookmark.repository'
import { TagRepository } from '../repositories/tag.repository'
import { WebsiteRepository } from '../repositories/websites.repository'
import { BookmarkService } from '../services/bookmark.service'
import { MetadataExtractorService } from '../services/metadata-extractor.service'
import { TagService } from '../services/tag.service'

export const registerBookmarkDependencies = () => {
	container.register(BOOKMARK_CONTROLLER, { useClass: BookmarkController })
	container.register(BOOKMARK_SERVICE, { useClass: BookmarkService })
	container.register(BOOKMARK_REPOSITORY, { useClass: BookmarkRepository })
	/*   container.register(WEBSITE_CONTROLLER, { useClass: WebsiteController })
  container.register(WEBSITE_SERVICE, { useClass: WebsiteService }) */
	container.register(WEBSITE_REPOSITORY, { useClass: WebsiteRepository })
	container.register(METADATA_EXTRACTOR_SERVICE, { useClass: MetadataExtractorService })
	container.register(TAG_CONTROLLER, { useClass: TagController })
	container.register(TAG_SERVICE, { useClass: TagService })
	container.register(TAG_REPOSITORY, { useClass: TagRepository })
}
