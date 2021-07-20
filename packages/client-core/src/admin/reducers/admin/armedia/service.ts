import { Dispatch } from 'redux'
import { client } from '../../../../feathers'
import { adminArmediaRetrieved } from './actions'

export function fetchAdminArmedia() {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const result = await client.service('ar-media').find()
      dispatch(adminArmediaRetrieved(result))
    } catch (error) {
      console.error(error)
    }
  }
}
