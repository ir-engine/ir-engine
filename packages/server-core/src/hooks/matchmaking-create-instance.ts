import { Hook, HookContext, Paginated } from '@feathersjs/feathers'

import { Instance } from '@xrengine/common/src/interfaces/Instance'
import { Location as LocationType } from '@xrengine/common/src/interfaces/Location'

import { Application } from '../../declarations'
import { getFreeInstanceserver } from '../networking/instance-provision/instance-provision.class'
import logger from '../ServerLogger'

export default (): Hook => {
  return async (context: HookContext<Application>): Promise<HookContext> => {
    const { app, result } = context
    const matchInstanceId = result?.id
    const connection = result?.connection
    const gameMode = result?.gamemode

    if (!connection) {
      // assignment is not found yet
      return context
    }
    if (!gameMode) {
      // throw error?!
      throw new Error('Unexpected response from match finder. ' + JSON.stringify(result))
    }

    const locationName = 'game-' + gameMode
    const location = (await app.service('location').find({
      query: {
        name: locationName
      }
    })) as Paginated<LocationType>
    if (!location.data.length) {
      // throw error?!
      throw new Error(`Location for match type '${gameMode}'(${locationName}) is not found.`)
    }

    const freeInstance = await getFreeInstanceserver(app, 0, location.data[0].id, null!, null!)
    try {
      const existingInstance = (await app.service('instance').find({
        query: {
          ipAddress: `${freeInstance.ipAddress}:${freeInstance.port}`,
          locationId: location.data[0].id,
          ended: false
        }
      })) as Paginated<Instance>

      let instanceId
      if (existingInstance.total === 0) {
        const newInstance = {
          ipAddress: `${freeInstance.ipAddress}:${freeInstance.port}`,
          currentUsers: 0,
          locationId: location.data[0].id,
          assigned: true,
          assignedAt: new Date()
        }
        const newInstanceResult = (await app.service('instance').create(newInstance)) as Instance
        instanceId = newInstanceResult.id
      } else {
        instanceId = existingInstance.data[0].id
      }

      // matchInstanceId
      await app.service('match-instance').patch(matchInstanceId, {
        instanceserver: instanceId
      })

      context.result.instanceserver = instanceId
    } catch (e) {
      logger.error(e, `Matchmaking instance create error: ${e.message || e.errors[0].message}`)
      // TODO: check error? skip?
    }

    return context
  }
}
