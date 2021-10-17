import { store, useDispatch } from '../../store'
import { client } from '../../feathers'

export const ScenesService = {
  createPublishProject: async (data) => {
    const dispatch = useDispatch()
    {
      try {
        const result = client.service('publish-scene').create(data)
        console.log(result)
      } catch (error) {
        console.error(error)
      }
    }
  }
}
