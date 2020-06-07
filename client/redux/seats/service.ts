import { Dispatch } from 'redux'
import { client } from '../feathers'
import {
  loadedSeats,
  invitedUser,
  canceledInvitation,
  removedSeat
} from './actions'
import { Seat } from '../../interfaces/Seat'

export function getSeats() {
  return (dispatch: Dispatch) => {
    // dispatch(actionProcessing(true))
    client.service('seat').find({
      query: {
        $limit: 100
      }
    }).then((res: any) => {
      console.log('seats------', res)
      dispatch(loadedSeats(res.data as Seat[]))
    })
      .catch((err: any) => {
        console.log(err)
      })
      // .finally(() => dispatch(actionProcessing(false)))
  }
}

export function createSeat(email: string, subscriptionId: string) {
  return (dispatch: Dispatch) => {
    console.log('CREATING SEAT')

    client.service('seat').create({
      email: email,
      subscriptionId: subscriptionId
    })
      .then((res: any) => {
        dispatch(invitedUser(res as Seat))
      })
      .catch((err: any) => {
        console.log(err)
      })
  }
}

export function cancelInvite(seat: Seat) {
  return (dispatch: Dispatch) => {
    console.log('CANCELING INVITATION')

    client.service('seat').remove(seat.id)
      .then((res: any) => {
        dispatch(canceledInvitation(res as Seat))
      })
      .catch((err: any) => {
        console.log(err)
      })
  }
}

export function dropSeat(seat: Seat) {
  return (dispatch: Dispatch) => {
    console.log('REMOVING FILLED SEAT')

    client.service('seat').remove(seat.id)
      .then((res: any) => {
        dispatch(removedSeat(res as Seat))
      })
      .catch((err: any) => {
        console.log(err)
      })
  }
}

export function inviteUser(email: string, subscriptionId: string) {
  return createSeat(email, subscriptionId)
}

export function cancelInvitation(seat: Seat) {
  return cancelInvite(seat)
}

export function removeSeat(seat: Seat) {
  return dropSeat(seat)
}
