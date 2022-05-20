const baseComponent = 'client-core'
/**
 * A logger class (similar to the one provided by Pino.js) to replace
 * console.log() usage on the client side.
 */
const multiLogger = {
  debug: window.console.debug.bind(window.console, `[${baseComponent}]`),
  info: window.console.log.bind(window.console, `[${baseComponent}]`),
  warn: window.console.warn.bind(window.console, `[${baseComponent}]`),
  error: window.console.error.bind(window.console, `[${baseComponent}]`),
  fatal: window.console.error.bind(window.console, `[${baseComponent}]`),

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
  child: (opts: any) => {
    return {
      debug: window.console.debug.bind(window.console, `[${opts.component}]`),
      info: window.console.log.bind(window.console, `[${opts.component}]`),
      warn: window.console.warn.bind(window.console, `[${opts.component}]`),
      error: window.console.error.bind(window.console, `[${opts.component}]`),
      fatal: window.console.error.bind(window.console, `[${opts.component}]`)
    }
  }
}

export default multiLogger
