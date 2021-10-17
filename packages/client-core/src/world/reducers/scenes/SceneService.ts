import { Dispatch } from 'redux'
import { client } from '../../../feathers'

export const ScenesService = {
  createPublishProject: (data) => {
    return (dispatch: Dispatch): any => {
      try {
        const result = client.service('publish-scene').create(data)
        console.log(result)
      } catch (error) {
        console.error(error)
      }
    }
  }
}
