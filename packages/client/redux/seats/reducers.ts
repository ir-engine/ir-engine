import Immutable from 'immutable'
import {
  SeatAction,
  LoadedSeatsAction,
  CanceledInvitationAction,
  RemovedSeatAction
} from './actions'

import {
  LOADED_SEATS,
  CANCELED_INVITATION,
  INVITED_USER,
  REMOVED_SEAT
} from '../actions'

export const initialState = {
  seats: [],
  updateNeeded: true
}

const immutableState = Immutable.fromJS(initialState)

const seatReducer = (state = immutableState, action: SeatAction): any => {
  let seats
  switch (action.type) {
    case LOADED_SEATS:
      return state
        .set('seats', (action as LoadedSeatsAction).seats)
        .set('updateNeeded', false)
    case INVITED_USER:
      return state
        .set('seats', state.get('seats'))
        .set('updateNeeded', true)
    case CANCELED_INVITATION:
      seats = state.get('seats').filter((seat) => seat.id !== (action as CanceledInvitationAction).seat.id)
      return state
        .set('seats', seats)
        .set('updateNeeded', true)
    case REMOVED_SEAT:
      seats = state.get('seats').filter((seat) => seat.id !== (action as RemovedSeatAction).seat.id)
      return state
        .set('seats', seats)
        .set('updateNeeded', true)
  }

  return state
}

export default seatReducer
