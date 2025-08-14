import { apiReference } from '@scalar/express-api-reference'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type Request, type Response } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import morgan from 'morgan'

import { authRouter } from './modules/auth/routes/auth.routes'
import { scalarConfig } from './scalar'

const app = express()
const apiRouter = express.Router()

const RATE_LIMIT_WINDOW_MS: number = 15 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS: number = 100
const RATE_LIMIT_MESSAGE: string = 'Too many requests, please try again later.'

app.use(
	cors({
		origin: 'http://localhost:8080',
		credentials: true
	})
)

const limiter = rateLimit({
	windowMs: RATE_LIMIT_WINDOW_MS,
	max: RATE_LIMIT_MAX_REQUESTS,
	standardHeaders: true,
	legacyHeaders: false,
	message: RATE_LIMIT_MESSAGE
})

app.use(limiter)

app.use(helmet())
app.use(cookieParser())
app.use(morgan('dev'))
app.use(express.json())

app.use('/api-docs', apiReference(scalarConfig))

app.get('/', (req: Request, res: Response) => {
	res.send('Tobimarks API')
})

apiRouter.use('/auth', authRouter)

app.use('/api', apiRouter)

export { app }
