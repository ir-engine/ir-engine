import { SceneAction } from '../../../../../world/store/SceneAction'
import { client } from '../../../../../feathers'
import { Dispatch } from 'redux'

export const AdminSceneService = {
  fetchAdminScenes: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      const scenes = await client.service('collection').find({
        query: {
          $limit: 100,
          $sort: {
            name: -1
          }
        }
      })
      dispatch(SceneAction.collectionsFetched(scenes))
    }
  }
}
