import { realityPacksFetched } from './actions'
import { client } from '../../../../feathers'
import { Dispatch } from 'redux'

export function fetchAdminRealityPacks(incDec?: 'increment' | 'decrement') {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const adminRealityPackState = getState().get('adminRealityPack').get('realityPacks')
    const limit = adminRealityPackState.get('limit')
    const skip = adminRealityPackState.get('skip')
    const realityPacks = await client.service('reality-pack').find({
      query: {
        $limit: limit,
        $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip
      }
    })
    dispatch(realityPacksFetched(realityPacks))
  }
}
