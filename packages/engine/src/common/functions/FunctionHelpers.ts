/* eslint-disable @typescript-eslint/no-this-alias */
/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
    // eslint-disable-next-line prefer-rest-params
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
