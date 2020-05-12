import { Hook, HookContext } from '@feathersjs/feathers'
import { v1 } from 'uuid'

export default function (options = {}): Hook {
  return async (context: HookContext) => {
    context.params.uuid = context.params.uuid ? context.params.uuid : v1()
    return context
  }
}
