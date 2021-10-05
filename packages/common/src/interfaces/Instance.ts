export interface Instance {
  id: string
  currentUsers: number
  ipAddress: string
  locationId: string
  channelId: string
  ended: boolean
  gameserver_subdomain_provision?: any
}
