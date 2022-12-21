import { BuildStatus } from './BuildStatus'

export interface BuildStatusResult {
  data: BuildStatus[]
  total: number
  limit: number
  skip: number
}
