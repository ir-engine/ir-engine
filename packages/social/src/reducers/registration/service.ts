import { AlertService } from '@xrengine/client-core/src/common/reducers/alert/AlertService'
import { client } from '@xrengine/client-core/src/feathers'
import { Creator } from '@xrengine/common/src/interfaces/Creator'
import { upload } from '@xrengine/engine/src/scene/functions/upload'
import { bindActionCreators, Dispatch } from 'redux'
import { useDispatch } from 'react-redux'
import { AuthService } from '../../../../client-core/src/user/reducers/auth/AuthService'

import {} from './actions'

export function middlewareFromAddConnectionByEmail(emailPhone: string, id: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      // dispatch(fetchingCurrentCreator())

      // const creator = await client
      //   .service('creator')
      //   .create({ name: 'User', username: 'user_' })
      console.log(id)
      const dispatch = useDispatch()
      const promise = new Promise((resolve, reject) => {
        bindActionCreators(AuthService.addConnectionByEmail, dispatch)(emailPhone, id)
        resolve(true)
      })

      promise.then((value) => {
        console.log(value)
      })

      // dispatch(creatorLoggedRetrieved(creator))
    } catch (err) {
      console.log(err)
      dispatch(AlertService.dispatchAlertError(dispatch, err.message))
    }
  }
}
