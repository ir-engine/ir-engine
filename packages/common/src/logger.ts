const baseComponent = 'client-core'
/**
 * A logger class (similar to the one provided by Pino.js) to replace
 * console.log() usage on the client side.
 */
const multiLogger = {
  debug: console.debug.bind(console, `[${baseComponent}]`),
  info: console.log.bind(console, `[${baseComponent}]`),
  warn: console.warn.bind(console, `[${baseComponent}]`),
  error: console.error.bind(console, `[${baseComponent}]`),
  fatal: console.error.bind(console, `[${baseComponent}]`),

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
      debug: console.debug.bind(console, `[${opts.component}]`),
      info: console.log.bind(console, `[${opts.component}]`),
      warn: console.warn.bind(console, `[${opts.component}]`),
      error: console.error.bind(console, `[${opts.component}]`),
      fatal: console.error.bind(console, `[${opts.component}]`)
    }
  }
}

export default multiLogger
