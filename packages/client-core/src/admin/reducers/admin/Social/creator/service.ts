import { Dispatch } from 'redux'
import { creatorLoggedRetrieved, add_creator, removeCreator } from './actions'
import { client } from '../../../../../feathers'

export const fetchCreatorAsAdmin =
  () =>
  async (dispatch: Dispatch, getState: any): Promise<any> => {
    const user = getState().get('auth').get('user')
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
      dispatch(add_creator(creator))
    } catch (err) {
      console.log(err)
      // dispatchAlertError(dispatch, err.message)
    }
  }
}

export function deleteCreator(creatorId: string){
  return async (dispatch: Dispatch): Promise<any> =>{
    try{
      await client.service('creator').remove(creatorId)
      dispatch(removeCreator(creatorId))
    }catch(err){
      console.log(err)
    }
  }
}
