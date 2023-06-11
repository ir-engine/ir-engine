import { StaticResourceInterface } from './StaticResource'

export interface DataInterface {
  id: string
  name?: string
  tags?: string[]
  type?: string
  staticResource?: StaticResourceInterface
}
