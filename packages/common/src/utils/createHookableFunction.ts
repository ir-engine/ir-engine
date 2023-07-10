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

export interface HookableFunctionContext<F extends (...args) => any> {
  args: Parameters<F>
  result: ReturnType<F>
}
export interface HookableFunction<F extends (...args) => any> {
  (...args: Parameters<F>): ReturnType<F>
  implementation: F
  beforeHooks: ((context: HookableFunctionContext<F>) => void)[]
  afterHooks: ((context: HookableFunctionContext<F>) => void)[]
}

/**
 * Create a function whose implementation can be easily updated or extended
 */
export const createHookableFunction = <F extends (...args) => any>(func: F): HookableFunction<F> => {
  const ctx = {
    args: [] as unknown as Parameters<F>,
    result: undefined as unknown as ReturnType<F>
  } as HookableFunctionContext<F>
  const wrapped = (...args: Parameters<F>) => {
    ctx.args = args
    ctx.result = undefined as any
    for (const h of wrapped.beforeHooks) h(ctx)
    ctx.result = wrapped.implementation(...ctx.args)
    for (const h of wrapped.afterHooks) h(ctx)
    return ctx.result
  }
  wrapped.implementation = func
  wrapped.beforeHooks = []
  wrapped.afterHooks = []
  wrapped.before = (hook: (context: HookableFunctionContext<F>) => void) => {
    wrapped.beforeHooks.push(hook)
    return wrapped
  }
  wrapped.after = (hook: (context: HookableFunctionContext<F>) => void) => {
    wrapped.afterHooks.push(hook)
    return wrapped
  }
  return wrapped
}
