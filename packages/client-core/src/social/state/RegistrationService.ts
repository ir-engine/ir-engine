import { AlertService } from '../../common/state/AlertService'
import { bindActionCreators } from 'redux'
import { useDispatch } from '../../store'
import { AuthService } from '../../user/state/AuthService'

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
