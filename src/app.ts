import express, { type Request, type Response } from 'express'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './swagger'

const app = express()

app.use(express.json())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.get('/', (req: Request, res: Response) => {
  res.send('Tobimarks API')
})

export { app }