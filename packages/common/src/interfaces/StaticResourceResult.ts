import { StaticResourceInterface } from './StaticResourceInterface'

export interface StaticResourceResult {
  data: StaticResourceInterface[]
  total: number
  limit: number
  skip: number
}
