import { StaticResourceVariantInterface } from '../dbmodels/StaticResourceVariant'

export interface StaticResourceInterface {
  id: string
  sid: string
  key: string
  metadata: object
  mimeType: string
  staticResourceType: string
  userId: string
  hash?: string
  project?: string
  driver?: string
  attribution?: string
  licensing?: string
  tags?: string[]
  url: string
  variants: StaticResourceVariantInterface[]
}

export interface StaticResourceCreateInterface {}
