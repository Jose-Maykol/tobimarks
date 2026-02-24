import pino from 'pino'
import { injectable } from 'tsyringe'

import { createLoggerConfig } from './logger.config'

export interface ILogger {
	info(msg: string, data?: Record<string, unknown>): void
	warn(msg: string, data?: Record<string, unknown>): void
	error(msg: string, data?: Record<string, unknown>): void
	debug(msg: string, data?: Record<string, unknown>): void
	fatal(msg: string, data?: Record<string, unknown>): void
	child(bindings: Record<string, unknown>): ILogger
}

@injectable()
export class Logger implements ILogger {
	private readonly logger: pino.Logger

	constructor() {
		this.logger = pino(createLoggerConfig())
	}

	info(msg: string, data?: Record<string, unknown>): void {
		if (data) {
			this.logger.info(data, msg)
		} else {
			this.logger.info(msg)
		}
	}

	warn(msg: string, data?: Record<string, unknown>): void {
		if (data) {
			this.logger.warn(data, msg)
		} else {
			this.logger.warn(msg)
		}
	}

	error(msg: string, data?: Record<string, unknown>): void {
		if (data) {
			this.logger.error(data, msg)
		} else {
			this.logger.error(msg)
		}
	}

	debug(msg: string, data?: Record<string, unknown>): void {
		if (data) {
			this.logger.debug(data, msg)
		} else {
			this.logger.debug(msg)
		}
	}

	fatal(msg: string, data?: Record<string, unknown>): void {
		if (data) {
			this.logger.fatal(data, msg)
		} else {
			this.logger.fatal(msg)
		}
	}

	child(bindings: Record<string, unknown>): ILogger {
		const childInstance = Object.create(Logger.prototype) as Logger
		;(childInstance as unknown as { logger: pino.Logger }).logger = this.logger.child(bindings)
		return childInstance
	}
}
