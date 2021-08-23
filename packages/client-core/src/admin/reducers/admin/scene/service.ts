import { client } from '../../../../feathers'
import { Dispatch } from 'redux'
import { collectionsFetched } from './actions'

export function fetchAdminScenes() {
  return async (dispatch: Dispatch): Promise<any> => {
    const scenes = await client.service('collection').find({
      query: {
        $limit: 100,
        $sort: {
          name: -1
        }
      }
    })
    dispatch(collectionsFetched(scenes))
  }
}
