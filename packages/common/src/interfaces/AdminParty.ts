export interface AdminParty {
  id: string
  createdAt: string
  updatedAt: string
  instanceId: string
  locationId: string
  location?: Location
  instance?: Instance
}

interface Location {
  id: string
  name: string
  sceneId: string
  slugifiedName: string
  isLobby: boolean
  isFeatured: boolean
  maxUsersPerInstance: number
  createdAt: string
  updatedAt: string
}

interface Instance {
  id: string
  ipAddress?: string
  channelId?: string
  currentUsers: number
  ended: boolean
  createdAt: string
  updatedAt: string
  locationId: string
}
