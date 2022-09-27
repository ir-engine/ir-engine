/**
 * An isomorphic logger with a built-in transport, meant to make
 * error aggregation easier on the client side.
 *
 * All log events (info, warn, error, etc) are:
 *  1. Printed to the console (likely browser console), and (optionally)
 *  2. Sent to the server-side /api/log endpoint, where the pino logger
 *     instance (see packages/server-core/src/logger.ts) sends them to Elastic etc.
 *     Note: The sending/aggregation to Elastic only happens when APP_ENV !== 'development'.
 *
 */
import { LruCache } from '@digitalcredentials/lru-memoize'
import fetch from 'cross-fetch'

import { hostDefined, localBuildOrDev, serverHost } from './config'

const logRequestCache = new LruCache({
  maxAge: 1000 * 5 // 5 seconds cache expiry
})

const disableLog = process.env['VITE_DISABLE_LOG']

const baseComponent = 'client-core'
/**
 * No-op logger, used for unit testing (or other disabling of logger)
 */
const nullLogger = {
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
  fatal: console.error
}

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
   * @param opts {object}
   * @param opts.component {string}
   */
  child: (opts: any) => {
    if (!hostDefined || (localBuildOrDev && !process.env.VITE_FORCE_CLIENT_LOG_AGGREGATE)) {
      // Locally, this will provide correct file & line numbers in browser console
      return {
        debug: console.debug.bind(console, `[${opts.component}]`),
        info: console.log.bind(console, `[${opts.component}]`),
        warn: console.warn.bind(console, `[${opts.component}]`),
        error: console.error.bind(console, `[${opts.component}]`),
        fatal: console.error.bind(console, `[${opts.component}]`)
      }
    } else {
      // For non-local builds, this send() is used
      const send = (level) => {
        const url = new URL('/api/log', serverHost)

        return async (...args) => {
          const consoleMethods = {
            debug: console.debug.bind(console, `[${opts.component}]`),
            info: console.log.bind(console, `[${opts.component}]`),
            warn: console.warn.bind(console, `[${opts.component}]`),
            error: console.error.bind(console, `[${opts.component}]`),
            fatal: console.error.bind(console, `[${opts.component}]`)
          }

          // @ts-ignore
          const logParams = encodeLogParams(...args)

          // In addition to sending to logging endpoint,  output to console
          consoleMethods[level](...args)

          // Send an async rate-limited request to backend /api/log endpoint for aggregation
          // Also suppress logger.info() levels (the equivalent to console.log())
          if (hostDefined && level !== 'info') {
            logRequestCache.memoize({
              key: logParams.msg,
              fn: () =>
                fetch(url, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    level,
                    component: opts.component,
                    ...logParams
                  })
                })
            })
          }
        }
      }

      return disableLog
        ? nullLogger
        : {
            debug: send('debug'),
            info: send('info'),
            warn: send('warn'),
            error: send('error'),
            fatal: send('fatal')
          }
    }
  }
}

/**
 * Support a limited subset of Pino's log parameters
 * @see https://getpino.io/#/docs/api?id=logging-method-parameters
 *
 * Limitations:
 * - Pino supports multiple interpolation values, but we're only going to use one in our code.
 * - Only supports %o interpolation (for %s or %d, just use native `${}`).
 *
 * Usage:
 * encodeLogParams(new TypeError('Error message'))
 * -> { msg: '{"error": "TypeError"", "message": "Error message", stack, cause }' }
 *
 * encodeLogParams(new Error('Error message'), 'Error while loading user')
 * -> { msg: '{"error": "Error"", "message": "Error while loading user: Error message", stack, cause }' }
 *
 * encodeLogParams('Message') -> { msg: 'Message' }
 *
 * encodeLogParams({ merge: 'object' }) -> { merge: 'object' }
 *
 * encodeLogParams({ merge: 'object' }, 'Message') -> { merge: 'object', msg: 'Message' }
 *
 * encodeLogParms('Message %o', { interpolation: 'value' })
 * -> { msg: 'Message {"interpolation": "value"}' }
 *
 * encodeLogParms({ merge: 'object' }, 'Message %o', { interpolation: 'value' })
 * -> { merge: 'object', msg: 'Message {"interpolation": "value"}' }
 *
 */
function encodeLogParams(first, second, third) {
  if (Array.isArray(first)) {
    first = first[0]
  }
  let mergeObject: any = {}
  let message: string

  if (first instanceof Error) {
    message = stringifyError(first, second)
  } else if (typeof first === 'string') {
    message = interpolate(first, second)
  } else {
    mergeObject = first
    message = interpolate(second, third)
  }

  return { ...mergeObject, msg: message }
}

/**
 * Note: Only supports %o interpolation (for %s or %d, just use native `${}`).
 * @param message {string}
 * @param interpolationObject {object}
 */
function interpolate(message, interpolationObject): string {
  if (!interpolationObject || !message?.includes('%o')) {
    return message
  }

  return message?.replace('%o', JSON.stringify(interpolationObject))
}

function stringifyError(error, errorContextMessage?) {
  let cause, stack

  const trace = { stack: '' }
  Error.captureStackTrace?.(trace) // In Firefox captureStackTrace is undefined
  stack = trace.stack

  if (error.cause) {
    cause = stringifyError(error.cause)
  }

  let message = error.message

  if (errorContextMessage) {
    message = `${errorContextMessage}: ${message}`
  }

  return JSON.stringify({ error: error.name, message, stack, cause })
}

export default multiLogger

globalThis.logger = multiLogger
