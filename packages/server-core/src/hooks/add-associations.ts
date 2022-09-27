import { Hook, HookContext } from '@feathersjs/feathers'

import { Application } from '@xrengine/server-core/declarations'

import logger from '../ServerLogger'

function processInclude(context: HookContext, includeCollection?: ModelType[]) {
  if (!includeCollection) {
    return
  }
  includeCollection = includeCollection?.map((model: ModelType) => {
    const newModel = { ...model, ...processInclude(context, model.include) } as ModelType
    newModel.model = context.app.services[model.model].Model
    return newModel
  })
  return { include: includeCollection }
}

type ModelType = {
  model: string
  include?: ModelType[]
  as?: string
}

type ModelAssociationsType = {
  models: ModelType[]
}

export default (options: ModelAssociationsType): Hook => {
  return (context: HookContext<Application>): HookContext => {
    if (!context.params) context.params = {}
    try {
      const sequelize = context.params.sequelize || {}
      const include: ModelType[] = sequelize.include || []
      sequelize.include = include.concat(
        options.models.map((model: ModelType) => {
          const newModel = { ...model, ...processInclude(context, model.include) } as ModelType
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
