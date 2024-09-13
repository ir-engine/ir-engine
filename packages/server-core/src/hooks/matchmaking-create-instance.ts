/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Hook, HookContext, Paginated } from '@feathersjs/feathers'

import { matchInstancePath } from '@ir-engine/common/src/schemas/matchmaking/match-instance.schema'
import {
  InstanceData,
  InstanceID,
  instancePath,
  InstanceType
} from '@ir-engine/common/src/schemas/networking/instance.schema'
import { LocationID, locationPath, LocationType, RoomCode } from '@ir-engine/common/src/schemas/social/location.schema'
import { toDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'

import { Application } from '../../declarations'
import { getFreeInstanceserver } from '../networking/instance-provision/instance-provision.class'
import logger from '../ServerLogger'

export default (): Hook => {
  return async (context: HookContext<Application>): Promise<HookContext> => {
    const { app, result } = context
    const matchInstanceId = result?.id
    const connection = result?.connection
    const gameMode = result?.gameMode

    if (!connection) {
      // assignment is not found yet
      return context
    }
    if (!gameMode) {
      // throw error?!
      throw new Error('Unexpected response from match finder. ' + JSON.stringify(result))
    }

    const locationName = 'game-' + gameMode
    const location = (await app.service(locationPath).find({
      query: {
        name: locationName
      }
    })) as Paginated<LocationType>
    if (!location.data.length) {
      // throw error?!
      throw new Error(`Location for match type '${gameMode}'(${locationName}) is not found.`)
    }

    const freeInstance = await getFreeInstanceserver({
      app,
      headers: context.params.headers,
      iteration: 0,
      locationId: location.data[0].id as LocationID
    })
    try {
      const existingInstance = (await app.service(instancePath).find({
        query: {
          ipAddress: `${freeInstance.ipAddress}:${freeInstance.port}`,
          locationId: location.data[0].id as LocationID,
          ended: false
        }
      })) as Paginated<InstanceType>

      let instanceId: InstanceID
      if (existingInstance.total === 0) {
        const newInstance = {
          ipAddress: `${freeInstance.ipAddress}:${freeInstance.port}`,
          locationId: location.data[0].id,
          assigned: true,
          assignedAt: toDateTimeSql(new Date()),
          roomCode: '' as RoomCode
        } as InstanceData
        const newInstanceResult = await app.service(instancePath).create(newInstance)
        instanceId = newInstanceResult.id
      } else {
        instanceId = existingInstance.data[0].id
      }

      // matchInstanceId
      await app.service(matchInstancePath).patch(matchInstanceId, {
        instanceServer: instanceId
      })

      context.result.instanceServer = instanceId
    } catch (e) {
      logger.error(e, `Matchmaking instance create error: ${e.message || e.errors[0].message}`)
      // TODO: check error? skip?
    }

    return context
  }
}
