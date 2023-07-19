/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Hook, HookContext } from '@feathersjs/feathers'

import { Application } from '@etherealengine/server-core/declarations'

import logger from '../ServerLogger'
import { createAvatarModel } from '../user/user/user.model'

const getMigratedModels = (app: Application) => {
  return {
    avatar: createAvatarModel(app)
  }
}

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
  where?: Object
  required?: boolean
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
          if (context.app.services[model.model].Model.name !== 'knex') {
            newModel.model = context.app.services[model.model].Model
          } else {
            const migratedModels = getMigratedModels(context.app)
            newModel.model = migratedModels[model.model]
          }
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
