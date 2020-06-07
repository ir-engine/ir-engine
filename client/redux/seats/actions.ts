import {
  LOADED_SEATS,
  INVITED_USER,
  CANCELED_INVITATION,
  REMOVED_SEAT
} from '../actions'
import { Seat } from '../../interfaces/Seat'

export interface LoadedSeatsAction {
  type: string
  seats: Seat[]
}

export interface InvitedUserAction {
  type: string,
  seat: Seat
}

export interface CanceledInvitationAction {
  type: string,
  seat: Seat
}

export interface RemovedSeatAction {
  type: string,
  seat: Seat
}

export type SeatAction =
    LoadedSeatsAction
    | InvitedUserAction
    | CanceledInvitationAction
    | RemovedSeatAction

export function loadedSeats(seats: Seat[]): LoadedSeatsAction {
  return {
    type: LOADED_SEATS,
    seats
  }
}

export function invitedUser(seat: Seat): InvitedUserAction {
  return {
    type: INVITED_USER,
    seat
  }
}

export function canceledInvitation(seat: Seat): CanceledInvitationAction {
  return {
    type: CANCELED_INVITATION,
    seat
  }
}

export function removedSeat(seat: Seat): RemovedSeatAction {
  return {
    type: REMOVED_SEAT,
    seat
  }
}
