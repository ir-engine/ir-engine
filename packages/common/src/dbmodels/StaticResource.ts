export interface StaticResourceInterface {
  id: string
  sid: string
  // primary variant URL
  url: string
  key: string
  hash?: string
  mimeType: string
  metadata: any
  project?: string
  driver?: string
  attribution?: string
  licensing?: string
  tags?: string[]
}
