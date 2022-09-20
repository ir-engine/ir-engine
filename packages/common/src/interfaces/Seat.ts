export interface Seat {
  subscriptionId: string
  userId: string
  seatStatus: string
}

export interface SeatParams {
  self: boolean
  userId?: string
}
