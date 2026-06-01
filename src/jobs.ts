import { container } from 'tsyringe'

import { BOOKMARK_JOB_PROCESSOR } from './modules/bookmark/di/token'
import type { BookmarkJobProcessor } from './modules/bookmark/jobs/bookmark-job-processor'

export const initializeJobs = () => {
	const bookmarkJobProcessor = container.resolve<BookmarkJobProcessor>(BOOKMARK_JOB_PROCESSOR)
	bookmarkJobProcessor.initialize()
}
