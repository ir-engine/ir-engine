import { AvatarID } from './AvatarID'
import { StaticResourceInterface } from './StaticResourceInterface'

export type AvatarInterface = {
  id: AvatarID
  name: string
  isPublic: boolean
  userId: string
  modelResourceId: string
  thumbnailResourceId: string
  identifierName: string
  modelResource?: StaticResourceInterface
  thumbnailResource?: StaticResourceInterface
}
