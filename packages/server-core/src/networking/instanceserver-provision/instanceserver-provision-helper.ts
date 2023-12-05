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

import { Paginated, Params } from '@feathersjs/feathers'

import { LocationID, locationPath, LocationType } from '@etherealengine/engine/src/schemas/social/location.schema'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { getFreeInstanceserver } from '../instance-provision/instance-provision.class'

type Props = {
  locationId: LocationID
  count: number
}

export const patchInstanceserverLocation =
  (app: Application) =>
  async ({ locationId, count }: Props, params?: Params) => {
    try {
      const location = (await app.service(locationPath).find({
        query: {
          id: locationId
        }
      })) as Paginated<LocationType>

      if (!location.data.length) {
        const message = `Failed to patch instanceserver. (Location for id '${locationId}' is not found.)`
        logger.info(message)
        return { status: false, message }
      }

      const patchServer = async () => {
        const freeInstance = await getFreeInstanceserver({
          app,
          headers: params?.headers || {},
          iteration: 0,
          locationId
        })
        await app.service('instanceserver-load').patch({
          id: freeInstance.id,
          ipAddress: freeInstance.ipAddress,
          podName: freeInstance.podName,
          locationId,
          sceneId: location.data[0].sceneId
        })

        logger.info('successfully patched instance server %o', { ...freeInstance, locationId })
      }

      for (let i = 0; i < count; i++) patchServer()

      return { status: true, message: 'instanceserver patched successfully' }
    } catch (e) {
      logger.error(e)
      return { status: false, message: `Failed to patch instanceserver. (${e.body.reason})` }
    }
  }
