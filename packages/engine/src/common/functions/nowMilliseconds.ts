import { performance } from './performance'

/**
 * return current time of the system.
 */
export const nowMilliseconds = performance.now.bind(performance)
