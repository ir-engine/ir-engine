import { LocationSettings } from './LocationSettings'

export interface Location {
  id: string
  name: string
  slugifiedName: string
  maxUsersPerInstance: number
  sceneId: string
  locationSettingId: string
  location_setting: LocationSettings
  isLobby: boolean
  isFeatured: boolean
}
