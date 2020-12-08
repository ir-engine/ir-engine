import { HookContext } from '@feathersjs/feathers'

export default (options = {}) => {
  return async (context: HookContext): Promise<HookContext> => {
    const { params } = context
    if (context.error) {
      console.log('***** Error')
      console.log(context.error)
    }
    const body = params.body || {}
    console.log(body)
    return context
  }
}
