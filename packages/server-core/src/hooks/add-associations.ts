import { Hook, HookContext } from '@feathersjs/feathers'

import { Application } from '@xrengine/server-core/declarations'

import logger from '../logger'

function processInclude(context: HookContext, includeCollection?: ModelType[]) {
  return includeCollection?.map((model: ModelType) => {
    const newModel = { ...model, ...processInclude(context, model.include) } as ModelType
    newModel.model = context.app.services[model.model].Model
    return newModel
  })
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
      sequelize.include = include.concat(processInclude(context, options.models) ?? [])
      sequelize.raw = false
      context.params.sequelize = sequelize
    } catch (err) {
      context.params = {}
      logger.error(err, `Add association error: ${err.message}`)
    }
    return context
  }
}
