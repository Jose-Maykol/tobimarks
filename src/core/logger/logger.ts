import pino from 'pino'
import { injectable } from 'tsyringe'

import { createLoggerConfig } from './logger.config'

/**
 * Interfaz para el servicio de registro de logs (Logging).
 * Proporciona métodos para registrar mensajes con diferentes niveles de severidad.
 */
export interface ILogger {
	/** Registra un mensaje de información */
	info(msg: string, data?: Record<string, unknown>): void
	/** Registra un mensaje de advertencia */
	warn(msg: string, data?: Record<string, unknown>): void
	/** Registra un mensaje de error */
	error(msg: string, data?: Record<string, unknown>): void
	/** Registra un mensaje de depuración */
	debug(msg: string, data?: Record<string, unknown>): void
	/** Registra un mensaje de error crítico/fatal */
	fatal(msg: string, data?: Record<string, unknown>): void
	/** Crea un logger hijo con metadatos predefinidos (bindings) */
	child(bindings: Record<string, unknown>): ILogger
}

/**
 * Implementación del servicio de registro de logs utilizando la librería Pino.
 * Está configurado como un componente inyectable para ser usado en toda la aplicación.
 */
@injectable()
export class Logger implements ILogger {
	private readonly logger: pino.Logger

	constructor() {
		this.logger = pino(createLoggerConfig())
	}

	/**
	 * Registra un mensaje con nivel INFO.
	 * @param msg - El mensaje a registrar.
	 * @param data - Metadatos adicionales opcionales.
	 */
	info(msg: string, data?: Record<string, unknown>): void {
		if (data) {
			this.logger.info(data, msg)
		} else {
			this.logger.info(msg)
		}
	}

	/**
	 * Registra un mensaje con nivel WARN.
	 * @param msg - El mensaje a registrar.
	 * @param data - Metadatos adicionales opcionales.
	 */
	warn(msg: string, data?: Record<string, unknown>): void {
		if (data) {
			this.logger.warn(data, msg)
		} else {
			this.logger.warn(msg)
		}
	}

	/**
	 * Registra un mensaje con nivel ERROR.
	 * @param msg - El mensaje a registrar.
	 * @param data - Metadatos adicionales opcionales.
	 */
	error(msg: string, data?: Record<string, unknown>): void {
		if (data) {
			this.logger.error(data, msg)
		} else {
			this.logger.error(msg)
		}
	}

	/**
	 * Registra un mensaje con nivel DEBUG.
	 * @param msg - El mensaje a registrar.
	 * @param data - Metadatos adicionales opcionales.
	 */
	debug(msg: string, data?: Record<string, unknown>): void {
		if (data) {
			this.logger.debug(data, msg)
		} else {
			this.logger.debug(msg)
		}
	}

	/**
	 * Registra un mensaje con nivel FATAL.
	 * @param msg - El mensaje a registrar.
	 * @param data - Metadatos adicionales opcionales.
	 */
	fatal(msg: string, data?: Record<string, unknown>): void {
		if (data) {
			this.logger.fatal(data, msg)
		} else {
			this.logger.fatal(msg)
		}
	}

	/**
	 * Crea y retorna una nueva instancia de logger que hereda la configuración actual
	 * e incluye los metadatos proporcionados en cada registro futuro.
	 *
	 * @param bindings - Metadatos para incluir de forma permanente en el logger hijo.
	 * @returns Una nueva instancia de ILogger configurada.
	 */
	child(bindings: Record<string, unknown>): ILogger {
		const childInstance = Object.create(Logger.prototype) as Logger
		;(childInstance as unknown as { logger: pino.Logger }).logger = this.logger.child(bindings)
		return childInstance
	}
}
