import { Location } from './Location'
import { LocationSettings } from './LocationSettings'

export interface Instance {
  id: string
  roomCode: string
  currentUsers: number
  ipAddress: string
  locationId: string
  location: Location
  channelId: string
  podName?: string
  ended?: boolean
  assigned?: boolean
  assignedAt?: Date
  instanceserver_subdomain_provision?: InstanceServerSubdomainProvision
}

export const InstanceSeed: Instance = {
  id: '',
  roomCode: '',
  ipAddress: '',
  currentUsers: 0,
  location: {
    id: '',
    name: '',
    slugifiedName: '',
    maxUsersPerInstance: 10,
    sceneId: '',
    locationSettingsId: '',
    locationSetting: {
      id: '',
      locationId: '',
      locationType: 'public',
      instanceMediaChatEnabled: false,
      audioEnabled: false,
      screenSharingEnabled: false,
      faceStreamingEnabled: false,
      videoEnabled: false
    },
    isLobby: false,
    isFeatured: false
  },
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
