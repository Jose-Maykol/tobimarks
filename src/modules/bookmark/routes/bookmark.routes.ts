import { Router } from 'express'

import { authMiddleware } from '@/common/middlewares/auth.middleware'

const router = Router()

router.use(authMiddleware)

export const bookmarkRoutes = router
