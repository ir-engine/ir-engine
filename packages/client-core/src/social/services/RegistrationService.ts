import { AlertService } from '../../common/services/AlertService'

import { useDispatch } from '../../store'
import { AuthService } from '../../user/services/AuthService'

import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'

//State
const state = createState({
  registration: {}
})

// store.receptors.push((action: RegistrationActionType): any => {
//   /* state.merge((s)=>{
//   switch (action.type) {
//     default:
//       return state
//   }
// },action.type)*/
// })

export const accessRegistrationState = () => state
export const useRegistrationState = () => useState(state)

//Service
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
          AuthService.addConnectionByEmail(emailPhone, id)
          resolve(true)
        })

        promise.then((value) => {
          console.log(value)
        })

        // dispatch(creatorLoggedRetrieved(creator))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  }
}

//Action
export const RegistrationAction = {}

export type RegistrationActionType = ReturnType<typeof RegistrationAction[keyof typeof RegistrationAction]>
