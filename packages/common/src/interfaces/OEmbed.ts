export interface OEmbed {
  version: string
  type: string
  title: string
  description: string
  provider_name: string
  provider_url: string
  thumbnail_url: string
  thumbnail_width: number
  thumbnail_height: number
  query_url: string
  url?: string
  height?: number
  width?: number
}
