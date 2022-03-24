import { Location } from './Location'

export interface Instance {
  id: string
  currentUsers: number
  ipAddress: string
  locationId: string
  location?: Location
  channelId: string
  podName?: string
  ended?: boolean
  assigned?: boolean
  assignedAt?: Date
  gameserver_subdomain_provision?: GameServerSubdomainProvision
}

export const InstanceSeed: Instance = {
  id: '',
  ipAddress: '',
  currentUsers: 0,
  podName: '',
  locationId: '',
  channelId: ''
}

export interface GameServerSubdomainProvision {
  id: number
  gs_id: string
  gs_number: string
  allocated: boolean
}

export interface GameServerPatch {
  status: boolean
  message: string
}
