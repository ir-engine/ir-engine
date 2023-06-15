import { StaticResourceInterface } from './StaticResourceInterface'

export interface VideoInterface {
  id: string
  name?: string
  tags?: string[]
  height: number
  width: number
  duration: number
  staticResourceId?: string
  staticResource?: StaticResourceInterface
  thumbnail?: string
  thumbnailId?: string
}
