import { Group } from './Group'

export interface GroupResult {
  data: Group[]
  total: number
  limit: number
  skip: number
}
