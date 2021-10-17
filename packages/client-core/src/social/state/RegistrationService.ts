import { AlertService } from '@xrengine/client-core/src/common/state/AlertService'
import { bindActionCreators, Dispatch } from 'redux'
import { useDispatch } from '@xrengine/client-core/src/store'
import { AuthService } from '@xrengine/client-core/src/user/state/AuthService'

import {} from './RegistrationActions'

export const RegistrationService = {
  middlewareFromAddConnectionByEmail: async (emailPhone: string, id: string) => {
    const dispatch = useDispatch()
    {
      try {
        // dispatch(fetchingCurrentCreator())

        // const creator = await client
        //   .service('creator')
        //   .create({ name: 'User', username: 'user_' })
        //console.log(id)
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
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}
