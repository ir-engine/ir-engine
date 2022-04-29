import { Hook, HookContext } from '@feathersjs/feathers'

import { Application } from '@xrengine/server-core/declarations'

import logger from '../logger'

function processInclude(includeCollection: any, context: HookContext): any {
  if (!includeCollection) {
    return
  }
  includeCollection = includeCollection.map((model: any) => {
    const newModel = { ...model, ...processInclude(model.include, context) }
    newModel.model = context.app.services[model.model].Model
    return newModel
  })
  return { include: includeCollection }
}

export default (options: any = {}): Hook => {
  return (context: HookContext<Application>): HookContext => {
    if (!context.params) context.params = {}
    try {
      const sequelize = context.params.sequelize || {}
      const include = sequelize.include || []
      sequelize.include = include.concat(
        options.models.map((model: any) => {
          const newModel = { ...model, ...processInclude(model.include, context) }
          newModel.model = context.app.services[model.model].Model
          return newModel
        })
      )
      sequelize.raw = false
      context.params.sequelize = sequelize
    } catch (err) {
      context.params = {}
      logger.error(err, `Add association error: ${err.message}`)
    }
    return context
  }
}
