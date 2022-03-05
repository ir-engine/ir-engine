export interface SubscriptionInterface {
  id: string
  plan: string
  amount: number
  currency: string
  quantity: number
  status: boolean
  totalSeats: number
  unusedSeats: number
  pendingSeats: number
  filledSeats: number
}
