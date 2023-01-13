import { StaticResourceInterface } from './StaticResourceInterface'

export interface DataInterface {
  id: string
  name?: string
  tags?: string[]
  type?: string
  thumbnail?: string
  src: string
  staticResource?: StaticResourceInterface
}
