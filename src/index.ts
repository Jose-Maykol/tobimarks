import 'dotenv/config'
import 'reflect-metadata'

import { app } from './app'
import { configureContainer } from './container'
import { env } from './core/config/env.config'

configureContainer()

app.listen(env.PORT, () => {
	console.log(`Server is running in http://localhost:${env.PORT}`)
})
