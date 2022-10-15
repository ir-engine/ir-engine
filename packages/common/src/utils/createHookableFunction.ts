/**
 * Create a function whose implementation can be easily updated or extended
 */
export const createHookableFunction = <F extends (...args) => any>(func: F) => {
  const ctx = {
    args: [] as unknown as Parameters<F>,
    result: undefined as unknown as ReturnType<F>
  }
  const wrapped = (...args: Parameters<F>) => {
    ctx.args = args
    ctx.result = undefined as any
    for (const h of wrapped.beforeHooks) h(ctx)
    ctx.result = wrapped.implementation(...ctx.args)
    for (const h of wrapped.afterHooks) h(ctx)
    return ctx.result
  }
  wrapped.implementation = func
  wrapped.beforeHooks = [] as ((context: typeof ctx) => void)[]
  wrapped.afterHooks = [] as ((context: typeof ctx) => void)[]
  return wrapped
}
