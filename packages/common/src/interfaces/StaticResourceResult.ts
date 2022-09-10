import { StaticResourceInterface } from './StaticResourceInterface'

export interface StaticResourceResult {
  data: StaticResourceInterface[]
  total: number
  limit: number
  skip: number
}

export interface StaticResourceFilterResult {
  mimeTypes: string[]
  staticResourceTypes: string[]
  allStaticResourceTypes: string[]
}
