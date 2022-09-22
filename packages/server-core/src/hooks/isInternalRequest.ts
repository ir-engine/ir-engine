import { HookContext } from '@feathersjs/feathers'
import { isProvider } from 'feathers-hooks-common'

import { Application } from './../../declarations'

export default () => {
  return async (context: HookContext<Application>): Promise<HookContext> => {
    // setting up flag which indicates whether this service is being called internally or originated from client side
    context.params.isInternal = !isProvider('external')(context as any)
    return context
  }
}
