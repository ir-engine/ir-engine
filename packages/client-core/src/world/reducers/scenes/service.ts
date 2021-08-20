import { Dispatch } from 'redux'
import { client } from '../../../feathers'

export const createPublishProject =
  (data) =>
  (dispatch: Dispatch): any => {
    try {
      const result = client.service('publish-project').create(data)
      console.log(result)
    } catch (error) {
      console.error(error)
    }
  }
