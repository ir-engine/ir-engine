import { StaticResourceInterface } from './StaticResourceInterface'

export interface VideoInterface {
  id: string
  name?: string
  tags?: string[]
  height: number
  width: number
  duration: number
  mp4StaticResourceId?: string
  m3u8StaticResourceId?: string
  mp4StaticResource?: StaticResourceInterface
  m3u8StaticResource?: StaticResourceInterface
  thumbnail?: string
  thumbnailId?: string
}
