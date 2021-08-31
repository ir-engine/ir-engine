import { Entity } from '../ecs/classes/Entity'
import { createMappedComponent } from '../ecs/functions/EntityFunctions'
import { LongLat } from './types'

export type MapComponentType = {
  /** Geographic point corresponding to the center of the map's 3D scene object's X,Z plane */
  center: LongLat
  viewer: Entity
  /** Distance of `viewer` from `center` which will trigger a refresh, in meters.
   */
  triggerRefreshRadius: number
  // TODO: remove this args
  args: any
}

export const MapComponent = createMappedComponent<MapComponentType>()
