import { client } from '../../feathers'
import { store, useDispatch } from '../../store'
import { SceneAction } from './SceneActions'
import { accessSceneState } from './SceneState'

export const SceneService = {
  fetchAdminScenes: async (incDec?: 'increment' | 'decrement' | 'all') => {
    console.warn('deprecated - use fetchProjectScenes')
    // const dispatch = useDispatch()
    // const adminScene = accessSceneState()
    // const skip = adminScene.scenes.skip.value
    // const limit = adminScene.scenes.limit.value
    // const scenes = await client.service('collection').find({
    //   query: {
    //     $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
    //     $limit: incDec === 'all' ? 1000 : limit,
    //     $sort: {
    //       name: 1
    //     }
    //   }
    // })
    // dispatch(SceneAction.scenesFetched(scenes))
  },

  deleteScene: async (sceneId: string) => {},

  getScene: async (projectName: string) => {
    const dispatch = useDispatch()
    const scenes = await client.service('scenes').get({ projectName })
    dispatch(SceneAction.scenesFetched(scenes))
  },

  createScene: async (projectName: string, sceneName: string) => {
    const dispatch = useDispatch()
    const result = await client.service('scene').create({ projectName, sceneName })
    console.log('Upload project result', result)
    dispatch(SceneAction.sceneCreated())
  }
}
