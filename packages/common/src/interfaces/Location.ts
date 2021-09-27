import { LocationSettings } from './LocationSettings'

export interface Location {
  id: string
  name: string
  sceneId: string
  locationSettingsId: string
  maxUsersPerInstance: number
  locationSettings: LocationSettings
  slugifiedName: string
  location_setting: any
  isFeatured: boolean
  isLobby: boolean
}
