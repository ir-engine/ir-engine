import { RealityPackAction } from './RealityPackActions'
import { client } from '../../../../feathers'
import { Dispatch } from 'redux'
import { accessRealityPackState } from './RealityPackState'

export function fetchAdminRealityPacks(incDec?: 'increment' | 'decrement') {
  return async (dispatch: Dispatch): Promise<any> => {
    const adminRealityPackState = accessRealityPackState().realityPacks
    const limit = adminRealityPackState.limit.value
    const skip = adminRealityPackState.skip.value
    const realityPacks = await client.service('reality-pack').find({
      query: {
        $limit: limit,
        $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip
      }
    })
    dispatch(RealityPackAction.realityPacksFetched(realityPacks))
  }
}
