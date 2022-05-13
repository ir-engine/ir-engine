/**
 * A logger class (similar to the one provided by Pino.js) to replace
 * console.log() usage on the client side.
 */
class ClientLogger {
  component: string

  constructor(componentName: string = 'client-core') {
    this.component = componentName
  }

  /**
   * Usage:
   *
   * import multiLogger from '@xrengine/common/src/logger'
   * const logger = multiLogger.child({ component: 'client-core:authentication' })
   *
   * logger.info('Logging in...')
   * // will result in:
   * // [client-core:authentication] Logging in...
   *
   * @param childConfig
   */
  child(childConfig: any) {
    return new ClientLogger(childConfig.component)
  }

  info(objectOrMessage: any, message?: string) {
    if (typeof objectOrMessage === 'string') {
      console.log(`[${this.component}] ${objectOrMessage}`)
    } else {
      console.log(`[${this.component}] ${message}`, objectOrMessage)
    }
  }

  warn(objectOrMessage: any, message?: string) {
    if (typeof objectOrMessage === 'string') {
      console.log(`[${this.component}] WARNING: ${objectOrMessage}`)
    } else {
      console.log(`[${this.component}] WARNING: ${message}`, objectOrMessage)
    }
  }

  error(objectOrMessage: any, message?: string) {
    if (typeof objectOrMessage === 'string') {
      console.error(`[${this.component}] ERROR: ${objectOrMessage}`)
    } else {
      console.error(`[${this.component}] ERROR: ${message}`, objectOrMessage)
    }
  }

  fatal(objectOrMessage: any, message?: string) {
    if (typeof objectOrMessage === 'string') {
      console.error(`[${this.component}] FATAL: ${objectOrMessage}`)
    } else {
      console.error(`[${this.component}] FATAL: ${message}`, objectOrMessage)
    }
  }
}

const multiLogger = new ClientLogger()
export default multiLogger
