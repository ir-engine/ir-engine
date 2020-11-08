import { LocationSettings } from './LocationSettings'

export interface Location {
  id: string
  name: string
  maxUsersPerInstance: number
  locationSettings: LocationSettings
}