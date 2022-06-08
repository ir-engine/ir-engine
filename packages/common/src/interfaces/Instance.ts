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
  instanceserver_subdomain_provision?: InstanceServerSubdomainProvision
}

export const InstanceSeed: Instance = {
  id: '',
  ipAddress: '',
  currentUsers: 0,
  podName: '',
  locationId: '',
  channelId: ''
}

export interface InstanceServerSubdomainProvision {
  id: number
  is_id: string
  is_number: string
  allocated: boolean
}

export interface InstanceServerPatch {
  status: boolean
  message: string
}
