export interface AudioInterface {
  id: string
  name?: string
  tags?: string[]
  duration: number
  mp3StaticResourceId?: string
  oggStaticResourceId?: string
  mpegStaticResourceId?: string
}
