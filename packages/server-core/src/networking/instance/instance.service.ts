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

import { Params } from '@feathersjs/feathers/lib'

import { LocationInterface } from '@etherealengine/common/src/dbmodels/Location'
import { Instance as InstanceInterface } from '@etherealengine/common/src/interfaces/Instance'

import { Application } from '../../../declarations'
import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import logger from '../../ServerLogger'
import { Instance } from './instance.class'
import instanceDocs from './instance.docs'
import hooks from './instance.hooks'
import createModel from './instance.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    instance: Instance
    'instances-active': {
      find: ReturnType<typeof getActiveInstancesForScene>
    }
  }
}

type ActiveInstance = {
  id: string
  location: string
  currentUsers: number
}

// TODO: paginate this

export const getActiveInstancesForScene =
  (app: Application) =>
  async (params: Params & { query: { sceneId: string } }): Promise<ActiveInstance[]> => {
    const sceneId = params.query!.sceneId
    if (!sceneId) return []

    // get all locationIds for sceneId
    const locations = (await app.service('location').Model.findAll({
      where: {
        sceneId
      }
    })) as LocationInterface[]

    if (!locations) return []

    const instances = (
      (await Promise.all(
        locations.map((location) => {
          return app.service('instance').Model.findAll({
            where: {
              ended: false,
              locationId: location.id
            },
            include: [
              {
                model: app.service('location').Model,
                where: {}
              }
            ]
          })
        })
      )) as InstanceInterface[]
    ).flat()

    // return all active instances for each location
    const instancesData: ActiveInstance[] = instances
      .map((instance) => {
        return {
          id: instance.id,
          location: instance.location!.id,
          currentUsers: instance.currentUsers
        }
      })
      .filter((a) => !!a)

    return instancesData
  }

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   */
  const event = new Instance(options, app)
  event.docs = instanceDocs
  app.use('instance', event)

  const service = app.service('instance')

  service.hooks(hooks)

  /**
   * A method used to remove specific instance
   *
   * @param data
   * @returns deleted channel
   */
  service.publish('removed', async (data): Promise<any> => {
    try {
      const admins = await app.service('user').Model.findAll({
        include: [
          {
            model: app.service('scope').Model,
            where: {
              type: 'admin:admin'
            }
          }
        ]
      })
      const targetIds = admins.map((admin) => admin.id)
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return await Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({
            instance: data
          })
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  app.use('instances-active', {
    find: getActiveInstancesForScene(app)
  })

  app.service('instances-active').hooks({
    before: {
      find: [authenticate(), verifyScope('editor', 'write')]
    }
  })
}
