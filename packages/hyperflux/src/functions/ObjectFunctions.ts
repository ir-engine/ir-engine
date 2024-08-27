/**
 * Simple object check, with type inference
 * @param value
 * @returns {boolean}
 */
function isObject(value: any): value is object {
  const type = typeof value
  return !!value && (type === 'object' || type === 'function')
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep(target: object, ...sources: object[]): object {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) target[key] = {}
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return mergeDeep(target, ...sources)
}

/**
 * 
 * @param a 
 * @param b 
 * @returns 
 */
export const equalsDeep = (a: any, b: any): boolean => {
  if (a === b) return true

  if (typeof a !== 'object' || typeof b !== 'object') return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if (!equalsDeep(a[key], b[key])) return false
  }

  return true
}

/**
 * Merge objects
 * @param objects
 * @returns
 */
export const merge = <T extends object>(...objects: T[]): T => {
  return Object.assign({}, ...objects)
}

/**
 * Spec https://www.geeksforgeeks.org/lodash-_-isempty-method/
 * @param obj
 * @returns
 */
export const isEmpty = (obj: null | undefined | object | number | string | Array<any>) => {
  if (typeof obj === 'string' || Array.isArray(obj)) {
    return obj.length === 0
  }
  if (typeof obj === 'undefined' || obj === null) return true
  if (typeof obj === 'number') return false
  return Object.keys(obj).length === 0
}

const hasStructuredCloneSupport = typeof globalThis.structuredClone !== 'undefined'

/**
 * Deep clone an object
 * @param value
 * @returns
 */
export const cloneDeep = hasStructuredCloneSupport
  ? (globalThis.structuredClone as <T>(value: T) => T)
  : <T>(value: T): T => {
      return JSON.parse(JSON.stringify(value))
    }

export function debounce(func, wait, options?: { leading?: boolean; maxWait?: number; trailing?: boolean }) {
  let lastArgs
  let lastThis
  let maxWait
  let result
  let timerId
  let lastCallTime
  let lastInvokeTime = 0
  let leading = false
  let maxing = false
  let trailing = true

  // Bypass `requestAnimationFrame` by explicitly setting `wait=0`.
  const useRAF = !wait && wait !== 0 && typeof globalThis.requestAnimationFrame === 'function'

  if (typeof func !== 'function') {
    throw new TypeError('Expected a function')
  }
  wait = +wait || 0
  if (isObject(options)) {
    leading = !!options.leading
    maxing = 'maxWait' in options
    maxWait = maxing ? Math.max(+(options.maxWait || 0), wait) : maxWait
    trailing = 'trailing' in options ? !!options.trailing : trailing
  }

  function invokeFunc(time) {
    const args = lastArgs
    const thisArg = lastThis

    lastArgs = lastThis = undefined
    lastInvokeTime = time
    result = func.apply(thisArg, args)
    return result
  }

  function startTimer(pendingFunc, milliseconds) {
    if (useRAF) {
      globalThis.cancelAnimationFrame(timerId)
      return globalThis.requestAnimationFrame(pendingFunc)
    }
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    return setTimeout(pendingFunc, milliseconds)
  }

  function cancelTimer(id) {
    if (useRAF) {
      globalThis.cancelAnimationFrame(id)
      return
    }
    clearTimeout(id)
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time
    // Start the timer for the trailing edge.
    timerId = startTimer(timerExpired, wait)
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = wait - timeSinceLastCall

    return maxing ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxing && timeSinceLastInvoke >= maxWait)
    )
  }

  function timerExpired() {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    // Restart the timer.
    timerId = startTimer(timerExpired, remainingWait(time))
    return undefined
  }

  function trailingEdge(time) {
    timerId = undefined

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = lastThis = undefined
    return result
  }

  function cancel() {
    if (timerId !== undefined) {
      cancelTimer(timerId)
    }
    lastInvokeTime = 0
    lastArgs = lastCallTime = lastThis = timerId = undefined
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now())
  }

  function pending() {
    return timerId !== undefined
  }

  function debounced(...args) {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = args
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    lastThis = this
    lastCallTime = time

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime)
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = startTimer(timerExpired, wait)
        return invokeFunc(lastCallTime)
      }
    }
    if (timerId === undefined) {
      timerId = startTimer(timerExpired, wait)
    }
    return result
  }
  debounced.cancel = cancel
  debounced.flush = flush
  debounced.pending = pending
  return debounced
}

/**
 * Changes the first character of each word in a string to uppercase
 * - does not affect non-alphabetic characters
 * - does not change the rest of the string
 * @param str 
 * @returns 
 */
export const startCase = (str: string) => {
  return str
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/(?:^|\s|["'([{])+\S/g, (match) => match.toUpperCase())
}

export const orderBy = (arr: any[], props: string[], orders: string[]) => {
  return arr.sort((a, b) => {
    for (let i = 0; i < props.length; i++) {
      const prop = props[i]
      const order = orders[i]
      if (a[prop] < b[prop]) return order === 'asc' ? -1 : 1
      if (a[prop] > b[prop]) return order === 'asc' ? 1 : -1
    }
    return 0
  })
}