import { StaticResourceInterface } from './StaticResourceInterface'

export interface ImageInterface {
  id: string
  name?: string
  tags?: string[]
  height: number
  width: number
  src: string
  jpegStaticResourceId?: string
  jpegStaticResource?: StaticResourceInterface
  ktx2StaticResourceId?: string
  ktx2StaticResource?: StaticResourceInterface
  gifStaticResourceId?: string
  gifStaticResource?: StaticResourceInterface
  pngStaticResourceId?: string
  pngStaticResource?: StaticResourceInterface
}
