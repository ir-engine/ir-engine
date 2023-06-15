import { StaticResourceInterface } from './StaticResourceInterface'

export interface ImageInterface {
  id: string
  name?: string
  tags?: string[]
  height: number
  width: number
  src: string
  staticResourceId?: string
  staticResource?: StaticResourceInterface
}
