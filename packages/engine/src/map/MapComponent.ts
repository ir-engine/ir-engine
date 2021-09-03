import { createMappedComponent } from '../ecs/functions/EntityFunctions'
import { LongLat } from './types'

export type MapComponentType = {
  /** Geographic point corresponding to the center of the map's scene object's ground plane */
  center: LongLat
  /** Trigger a refresh when camera target entity reaches this distance, in meters, from `center`.
   */
  triggerRefreshRadius: number
  refreshInProgress: boolean
  /** Distance from `center` for which to fetch data and build a scene object, in meters
   */
  minimumSceneRadius: number
  // TODO: remove this args
  args: any
}

export const MapComponent = createMappedComponent<MapComponentType>()
