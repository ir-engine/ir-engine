import { StaticResourceInterface } from './StaticResourceInterface'

export type AvatarInterface = {
  id: string
  name: string
  isPublic: boolean
  userId: string
  modelResourceId: string
  thumbnailResourceId: string
  identifierName: string
  modelResource?: StaticResourceInterface
  thumbnailResource?: StaticResourceInterface
}
