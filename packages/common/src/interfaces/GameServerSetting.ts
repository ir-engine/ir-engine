export interface GameServerSetting {
  id: string
  clientHost: string
  enabled: boolean
  rtc_start_port: number
  rtc_end_port: number
  rtc_port_block_size: number
  identifierDigits: number
  local: boolean
  domain: string
  releaseName?: string
  port: string
  mode: string
  locationName?: string
}
