import { createState, useState, none, Downgraded } from '@hookstate/core'
import { RegistrationActionType } from './RegistrationActions'

const state = createState({
  registration: {}
})

export const registrationReducer = (_, action: RegistrationActionType) => {
  Promise.resolve().then(() => registrationReceptor(action))
  return state.attach(Downgraded).value
}

const registrationReceptor = (action: RegistrationActionType): any => {
  /* state.merge((s)=>{
  switch (action.type) {
    default:
      return state
  }
},action.type)*/
}

export const accessRegistrationState = () => state
export const useRegistrationState = () => useState(state)
