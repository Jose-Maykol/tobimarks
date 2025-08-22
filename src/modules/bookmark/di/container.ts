import { container } from 'tsyringe'

import { BOOKMARK_REPOSITORY, BOOKMARK_SERVICE, WEBSITE_REPOSITORY } from './token'
import { BookmarkRepository } from '../repositories/bookmark.repository'
import { WebsiteRepository } from '../repositories/websites.repository'
import { BookmarkService } from '../services/bookmark.service'

export const registerBookmarkDependencies = () => {
	//container.register(BOOKMARK_CONTROLLER, { useClass: BookmarkController })
	container.register(BOOKMARK_SERVICE, { useClass: BookmarkService })
	container.register(BOOKMARK_REPOSITORY, { useClass: BookmarkRepository })
	/*   container.register(WEBSITE_CONTROLLER, { useClass: WebsiteController })
  container.register(WEBSITE_SERVICE, { useClass: WebsiteService }) */
	container.register(WEBSITE_REPOSITORY, { useClass: WebsiteRepository })
}
