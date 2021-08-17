import { Vector3 } from 'three'

export interface MapProps {
  name?: string
  scale?: Vector3
  style?: any
  useTimeOfDay?: number
  useDirectionalShadows?: boolean
  useDeviceGeolocation?: boolean
  startLatitude?: string
  startLongitude?: string
  showRasterTiles?: boolean
  enableDebug?: boolean
}
