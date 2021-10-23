import { LocationSettings } from './LocationSettings'

export interface Location {
  id: string
  name: string
  slugifiedName: string
  maxUsersPerInstance: number
  sceneId: string
  locationSettingsId: string
  location_settings: LocationSettings
  isLobby: boolean
  isFeatured: boolean
}

export const LocationSeed: Location = {
  id: '',
  name: '',
  slugifiedName: '',
  maxUsersPerInstance: 10,
  sceneId: '',
  locationSettingsId: '',
  isLobby: false,
  isFeatured: false,
  location_settings: {
    id: '',
    locationId: '',
    instanceMediaChatEnabled: false,
    audioEnabled: false,
    screenSharingEnabled: false,
    faceStreamingEnabled: false,
    locationType: 'private',
    videoEnabled: false
  }
}
