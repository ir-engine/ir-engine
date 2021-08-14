import { Dispatch } from 'redux'
import { creatorLoggedRetrieved } from './actions'
import { client } from '../../../../../feathers'

export const fetchCreatorAsAdmin =
  () =>
  async (dispatch: Dispatch): Promise<any> => {
    try {
      const result = await client.service('creator').find({
        query: {
          action: 'admin'
        }
      })
      dispatch(creatorLoggedRetrieved(result))
    } catch (error) {
      console.error(error)
    }
  }

export function createCreator() {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      // dispatch(fetchingCurrentCreator())
      let userNumber = Math.floor(Math.random() * 1000) + 1
      const creator = await client
        .service('creator')
        .create({ name: 'User' + userNumber, username: 'user_' + userNumber })
      console.log(creator)
      // dispatch(creatorLoggedRetrieved(creator))
    } catch (err) {
      console.log(err)
      // dispatchAlertError(dispatch, err.message)
    }
  }
}
