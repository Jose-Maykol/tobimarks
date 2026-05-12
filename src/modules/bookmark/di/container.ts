import { container } from 'tsyringe'

import {
	BOOKMARK_CONTROLLER,
	BOOKMARK_REPOSITORY,
	METADATA_EXTRACTOR_SERVICE,
	TAG_CONTROLLER,
	TAG_REPOSITORY,
	TAG_SERVICE,
	WEBSITE_CONTROLLER,
	WEBSITE_SERVICE,
	WEBSITE_REPOSITORY,
	CREATE_BOOKMARK_USE_CASE,
	GET_BOOKMARKS_USE_CASE,
	UPDATE_BOOKMARK_USE_CASE,
	DELETE_BOOKMARK_USE_CASE,
	MARK_BOOKMARK_AS_FAVORITE_USE_CASE,
	UNMARK_BOOKMARK_AS_FAVORITE_USE_CASE,
	REGISTER_BOOKMARK_ACCESS_USE_CASE,
	UPDATE_BOOKMARK_COLLECTION_USE_CASE,
	REMOVE_BOOKMARK_COLLECTION_USE_CASE,
	BOOKMARK_JOB_PROCESSOR
} from './token'
import { BookmarkController } from '../controllers/bookmark.controller'
import { TagController } from '../controllers/tag.controller'
import { WebsiteController } from '../controllers/website.controller'
import { BookmarkJobProcessor } from '../jobs/bookmark-job-processor'
import { BookmarkRepository } from '../repositories/bookmark.repository'
import { TagRepository } from '../repositories/tag.repository'
import { WebsiteRepository } from '../repositories/websites.repository'
import { MetadataExtractorService } from '../services/metadata-extractor.service'
import { TagService } from '../services/tag.service'
import { WebsiteService } from '../services/website.service'
import { CreateBookmarkUseCase } from '../use-cases/create-bookmark.use-case'
import { DeleteBookmarkUseCase } from '../use-cases/delete-bookmark.use-case'
import { GetBookmarksUseCase } from '../use-cases/get-bookmarks.use-case'
import { MarkBookmarkAsFavoriteUseCase } from '../use-cases/mark-bookmark-as-favorite.use-case'
import { RegisterBookmarkAccessUseCase } from '../use-cases/register-bookmark-access.use-case'
import { RemoveBookmarkCollectionUseCase } from '../use-cases/remove-bookmark-collection.use-case'
import { UnmarkBookmarkAsFavoriteUseCase } from '../use-cases/unmark-bookmark-as-favorite.use-case'
import { UpdateBookmarkCollectionUseCase } from '../use-cases/update-bookmark-collection.use-case'
import { UpdateBookmarkUseCase } from '../use-cases/update-bookmark.use-case'

export const registerBookmarkDependencies = () => {
	container.register(BOOKMARK_CONTROLLER, { useClass: BookmarkController })
	container.register(BOOKMARK_REPOSITORY, { useClass: BookmarkRepository })
	container.register(WEBSITE_CONTROLLER, { useClass: WebsiteController })
	container.register(WEBSITE_SERVICE, { useClass: WebsiteService })
	container.register(WEBSITE_REPOSITORY, { useClass: WebsiteRepository })
	container.register(METADATA_EXTRACTOR_SERVICE, { useClass: MetadataExtractorService })
	container.register(TAG_CONTROLLER, { useClass: TagController })
	container.register(TAG_SERVICE, { useClass: TagService })
	container.register(TAG_REPOSITORY, { useClass: TagRepository })

	// Use Cases
	container.register(CREATE_BOOKMARK_USE_CASE, { useClass: CreateBookmarkUseCase })
	container.register(GET_BOOKMARKS_USE_CASE, { useClass: GetBookmarksUseCase })
	container.register(UPDATE_BOOKMARK_USE_CASE, { useClass: UpdateBookmarkUseCase })
	container.register(DELETE_BOOKMARK_USE_CASE, { useClass: DeleteBookmarkUseCase })
	container.register(MARK_BOOKMARK_AS_FAVORITE_USE_CASE, {
		useClass: MarkBookmarkAsFavoriteUseCase
	})
	container.register(UNMARK_BOOKMARK_AS_FAVORITE_USE_CASE, {
		useClass: UnmarkBookmarkAsFavoriteUseCase
	})
	container.register(REGISTER_BOOKMARK_ACCESS_USE_CASE, {
		useClass: RegisterBookmarkAccessUseCase
	})
	container.register(UPDATE_BOOKMARK_COLLECTION_USE_CASE, {
		useClass: UpdateBookmarkCollectionUseCase
	})
	container.register(REMOVE_BOOKMARK_COLLECTION_USE_CASE, {
		useClass: RemoveBookmarkCollectionUseCase
	})

	// Jobs
	container.register(BOOKMARK_JOB_PROCESSOR, { useClass: BookmarkJobProcessor })
}
