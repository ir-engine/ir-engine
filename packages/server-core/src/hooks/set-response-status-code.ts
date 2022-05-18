import { HookContext } from '@feathersjs/feathers'

export default (statusCode = 200) => {
  return (context: HookContext): HookContext => {
    context.statusCode = statusCode
    return context
  }
}
