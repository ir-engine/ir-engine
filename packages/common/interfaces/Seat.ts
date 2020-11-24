export type SeatStatus = 'pending' | 'filled'
export interface Seat {
  id: string
  userId: string
  seatStatus: SeatStatus
  subscriptionId: string
  user?: {
    name?: string
    email?: string
  }
}

export const UserSeed = {
  id: '',
  userId: '',
  seatStatus: '',
  subscriptionId: '',
  user: {
    name: '',
    email: ''
  }
}
