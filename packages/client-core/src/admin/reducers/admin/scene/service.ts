import { client } from '../../../../feathers'
import { Dispatch } from 'redux'
import { collectionsFetched } from './actions'

export function fetchAdminScenes(incDec?: 'increment' | 'decrement' | 'all') {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const skip = getState().get('adminScene').get('scenes').get('skip')
    const limit = getState().get('adminScene').get('scenes').get('limit')
    const scenes = await client.service('collection').find({
      query: {
        $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
        $limit: incDec === 'all' ? 1000 : limit,
        $sort: {
          name: 1
        }
      }
    })
    dispatch(collectionsFetched(scenes))
  }
}
export function deleteScene() {
  return async (dispatch: Dispatch): Promise<any> => {}
}
