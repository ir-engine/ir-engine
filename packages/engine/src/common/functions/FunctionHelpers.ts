// Modified version taken from underscore.js
// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once perlot `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
export function throttle<T>(func: T, wait: number, options: { leading?: boolean; trailing?: boolean } = {}) {
  let timeout, context, _args, result
  let previous = 0

  const later = function () {
    previous = options.leading === false ? 0 : Date.now()
    timeout = null
    result = (func as any).apply(context, _args)
    if (!timeout) context = _args = null
  }

  const throttled = function () {
    const _now = Date.now()
    if (!previous && options.leading === false) previous = _now
    const remaining = wait - (_now - previous)
    context = this
    _args = arguments
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = _now
      result = (func as any).apply(context, _args)
      if (!timeout) context = _args = null
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }

  ;(throttled as any).cancel = function () {
    clearTimeout(timeout)
    previous = 0
    timeout = context = _args = null
  }

  return throttled as T
}
