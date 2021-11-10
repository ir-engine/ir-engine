import { UserInventoryItem } from './UserInventoryItem'

export type UserInventoryResult = {
  data: UserInventoryItem[]
  total: number
  limit: number
  skip: number
}
