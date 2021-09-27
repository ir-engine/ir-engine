import { client } from '../../../../feathers'
import { Dispatch } from 'redux'
import { SceneAction } from './SceneActions'
import { accessSceneState } from './SceneState'
export function fetchAdminScenes(incDec?: 'increment' | 'decrement' | 'all') {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const adminScene = accessSceneState()
    const skip = adminScene.scenes.skip.value
    const limit = adminScene.scenes.limit.value
    const scenes = await client.service('collection').find({
      query: {
        $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
        $limit: incDec === 'all' ? 1000 : limit,
        $sort: {
          name: 1
        }
      }
    })
    dispatch(SceneAction.collectionsFetched(scenes))
  }
}
export function deleteScene() {
  return async (dispatch: Dispatch): Promise<any> => {}
}
