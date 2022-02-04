import { isClient } from './isClient'

/**
 * return current time of the system.
 * performance.now() "polyfill"
 */
export const nowMilliseconds = isClient
  ? performance.now.bind(performance)
  : require('perf_hooks').performance.now.bind(require('perf_hooks').performance)
