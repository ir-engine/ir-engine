export interface Instance {
  id: number
  currentUsers: number
  ipAddress: string
  locationId: string
  gameserver_subdomain_provision?: GameServerSubdomainProvision
}

export const InstanceSeed: Instance = {
  id: 0,
  ipAddress: '',
  currentUsers: 0,
  locationId: ''
}

export interface GameServerSubdomainProvision {
  id: number
  gs_id: string
  gs_number: string
  allocated: boolean
}
