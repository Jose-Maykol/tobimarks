export const BOOKMARK_CONTROLLER = Symbol.for('BookmarkController')
export const BOOKMARK_REPOSITORY = Symbol.for('IBookmarkRepository')
export const WEBSITE_CONTROLLER = Symbol.for('WebsiteController')
export const WEBSITE_SERVICE = Symbol.for('WebsiteService')
export const WEBSITE_REPOSITORY = Symbol.for('IWebsiteRepository')
export const METADATA_EXTRACTOR_SERVICE = Symbol.for('MetadataExtractorService')

// Use Cases
export const CREATE_BOOKMARK_USE_CASE = Symbol.for('CreateBookmarkUseCase')
export const GET_BOOKMARKS_USE_CASE = Symbol.for('GetBookmarksUseCase')
export const UPDATE_BOOKMARK_USE_CASE = Symbol.for('UpdateBookmarkUseCase')
export const DELETE_BOOKMARK_USE_CASE = Symbol.for('DeleteBookmarkUseCase')
export const MARK_BOOKMARK_AS_FAVORITE_USE_CASE = Symbol.for('MarkBookmarkAsFavoriteUseCase')
export const UNMARK_BOOKMARK_AS_FAVORITE_USE_CASE = Symbol.for('UnmarkBookmarkAsFavoriteUseCase')
export const REGISTER_BOOKMARK_ACCESS_USE_CASE = Symbol.for('RegisterBookmarkAccessUseCase')
export const UPDATE_BOOKMARK_COLLECTION_USE_CASE = Symbol.for('UpdateBookmarkCollectionUseCase')
export const REMOVE_BOOKMARK_COLLECTION_USE_CASE = Symbol.for('RemoveBookmarkCollectionUseCase')

// Jobs
export const BOOKMARK_JOB_PROCESSOR = Symbol.for('BookmarkJobProcessor')
