import { Hook, HookContext } from '@feathersjs/feathers'
import { getFreeGameserver } from '../networking/instance-provision/instance-provision.class'
import { Application } from '../../declarations'

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, result, params } = context
    console.log('assignment HOOK!', result)
    const identityProvider = params['identity-provider']
    const connection = result?.connection
    // context.params.connection
    if (!connection) {
      // throw error?!
      throw new Error('Unexpected response from match finder')
    }

    const location = await app.service('location').find({
      query: {
        name: 'ctf'
      }
    })
    const freeInstance = await getFreeGameserver(app as Application, false)
    try {
      const existingInstance = await app.service('instance').find({
        query: {
          ipAddress: `${freeInstance.ipAddress}:${freeInstance.port}`,
          locationId: location.data[0].id,
          ended: false
        }
      })
      console.log('existing instance for match', existingInstance)
      let instanceId
      if (existingInstance.total === 0) {
        const newInstance = {
          ipAddress: `${freeInstance.ipAddress}:${freeInstance.port}`,
          currentUsers: 0,
          locationId: location.data[0].id
        }
        const newInstanceResult = await app.service('instance').create(newInstance)
        instanceId = newInstanceResult.id
      } else {
        instanceId = existingInstance.data[0].id
      }

      const existingInstanceAuthorizedUser = await app.service('instance-authorized-user').find({
        query: {
          userId: identityProvider.userId,
          instanceId: instanceId,
          $limit: 0
        }
      })
      if (existingInstanceAuthorizedUser.total === 0) await app.service('instance-authorized-user').create({
        userId: identityProvider.userId,
        instanceId: instanceId
      })

      context.result.instanceId = instanceId
      context.result.locationName = 'ctf'
    } catch (e) {
      console.log('matchmaking instance create error', e)
      // TODO: check error? skip?
      console.log('instance creation failed:', e.errors[0].message)
    }

    return context
  }
}
