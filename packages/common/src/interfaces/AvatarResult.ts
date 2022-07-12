import { StaticResourceInterface } from './StaticResourceInterface'

export type AvatarResult = {
  data: StaticResourceInterface[]
  total: number
  limit: number
  skip: number
}
