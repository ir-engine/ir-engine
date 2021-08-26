import { Position } from 'geojson'
import { createMappedComponent } from '../ecs/functions/EntityFunctions'

export type MapComponentType = {
  center: Position
  currentTile: Position
  loading?: boolean
  showRasterTiles?: boolean
  // TODO: remove this args
  args: any
}

export const MapComponent = createMappedComponent<MapComponentType>()
