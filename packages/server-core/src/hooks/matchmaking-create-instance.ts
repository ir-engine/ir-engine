import { Hook, HookContext } from '@feathersjs/feathers'
import { getFreeGameserver } from '../networking/instance-provision/instance-provision.class'
import { Application } from '../../declarations'

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, result } = context
    console.log('assignment HOOK!', result)
    const connection = result?.connection
    // context.params.connection
    if (!connection) {
      // throw error?!
      throw new Error('Unexpected response from match finder')
    }

    const location = await app.service('location').find({
      query: {
        name: result.MatchType
      }
    })
    const freeInstance = await getFreeGameserver(app as Application, false)
    try {
      const newInstance = {
        ipAddress: `${freeInstance.ipAddress}:${freeInstance.port}`,
        currentUsers: 0,
        locationId: location.data[0].id,
        sceneId: location.data[0].sceneId
      }
      const newInstanceResult = await app.service('instance').create(newInstance)
    } catch (e) {
      console.log('matchmaking instance create error', e)
      // TODO: check error? skip?
      console.log('instance creation failed:', e.errors[0].message)
    }

    return context
  }
}
