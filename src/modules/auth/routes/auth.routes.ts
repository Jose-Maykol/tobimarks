import { Router } from 'express'
import { container } from 'tsyringe'

import { AuthController } from '../controllers/auth.controller'
import { AUTH_CONTROLLER } from '../di/tokens'
import { GoogleAuthSchema, RefreshTokenSchema } from '../squemas/auth.schema'

import { validateRequest } from '@/common/middlewares/validation.middleware'

const router = Router()
const authController = container.resolve<AuthController>(AUTH_CONTROLLER)

/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

/**
 * @openapi
 * /auth/google:
 *   post:
 *     summary: Authenticate with Google
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Identity token from Google
 *               deviceId:
 *                 type: string
 *               deviceName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
	'/google',
	validateRequest({ body: GoogleAuthSchema }),
	authController.googleAuth.bind(authController)
)

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *               deviceId:
 *                 type: string
 *               deviceName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens refreshed
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
	'/refresh',
	validateRequest({ body: RefreshTokenSchema }),
	authController.refreshToken.bind(authController)
)

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Log out user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post(
	'/logout',
	validateRequest({ body: RefreshTokenSchema }),
	authController.logout.bind(authController)
)

export const authRouter = router
