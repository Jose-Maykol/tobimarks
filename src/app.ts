import express, { type Request, type Response } from 'express'
import { apiReference } from '@scalar/express-api-reference'
import { scalarConfig } from './scalar'

const app = express()

app.use(express.json())

app.use('/api-docs', apiReference(scalarConfig))

app.get('/', (req: Request, res: Response) => {
  res.send('Tobimarks API')
})

export { app }