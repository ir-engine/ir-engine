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
