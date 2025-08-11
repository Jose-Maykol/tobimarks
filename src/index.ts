import 'dotenv/config'

import { app } from './app'
import { env } from './core/config/env'

app.listen(env.PORT, () => {
	console.log(`Server is running in http://localhost:${env.PORT}`)
})
