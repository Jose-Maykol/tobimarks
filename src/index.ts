import 'dotenv/config'
import 'reflect-metadata'

import { configureContainer } from './container'
import { env } from './core/config/env.config'

async function startServer() {
	configureContainer()
	const { app } = await import('./app')
	app.listen(env.PORT, () => {
		console.log(`🚀 Server running on http://localhost:${env.PORT}`)
	})
}

startServer().catch(console.error)
