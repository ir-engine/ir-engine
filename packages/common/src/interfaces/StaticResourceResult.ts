import { StaticResource } from './StaticResource'

export interface StaticResourceResult {
  data: StaticResource[]
  total: number
  limit: number
  skip: number
}
