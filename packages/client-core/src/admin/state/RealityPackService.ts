import { RealityPackAction } from './RealityPackActions'
import { client } from '../../feathers'
import { accessRealityPackState } from './RealityPackState'
import { store, useDispatch } from '../../store'

export async function fetchAdminRealityPacks(incDec?: 'increment' | 'decrement') {
  const adminRealityPackState = accessRealityPackState().realityPacks
  const limit = adminRealityPackState.limit.value
  const skip = adminRealityPackState.skip.value
  const realityPacks = await client.service('reality-pack').find({
    query: {
      $limit: limit,
      $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip
    }
  })
  store.dispatch(RealityPackAction.realityPacksFetched(realityPacks))
}
