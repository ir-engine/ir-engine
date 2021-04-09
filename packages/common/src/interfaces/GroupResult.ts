import { Group } from './Group'

export type GroupResult = {
  data: Group[],
  total: number,
  limit: number
  skip: number
}