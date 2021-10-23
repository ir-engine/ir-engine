import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { store } from '../../store'
import { RegistrationActionType } from './RegistrationActions'

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
