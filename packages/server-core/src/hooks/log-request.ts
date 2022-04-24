import { HookContext } from '@feathersjs/feathers'

import logger from '../logger'

export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { params } = context
    if (context.error) {
      logger.error(context.error)
    }
    const body = params.body || {}
    logger.info(body)
    return context
  }
}
