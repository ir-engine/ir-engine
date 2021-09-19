import { createMappedComponent } from '../ecs/functions/ComponentFunctions'
import CreateCompleteObjectPhase from './classes/CreateCompleteObjectPhase'
import CreateGeometryPhase from './classes/CreateGeometryPhase'
import CreateLabelPhase from './classes/CreateLabelPhase'
import ExtractTileFeaturesPhase from './classes/ExtractTileFeaturesPhase'
import FetchTilesPhase from './classes/FetchTilesPhase'
import { LongLat } from './units'

// TODO use ReturnType<createStore> ?
export type MapComponentType = {
  /** Geographic point corresponding to the center of the map's scene object's ground plane */
  center: LongLat
  originalCenter: LongLat
  /** Trigger a refresh when camera target entity reaches this distance, in meters, from `center`.
   */
  triggerRefreshRadius: number
  /** Distance from `center` for which to fetch data and build a scene object, in meters
   */
  minimumSceneRadius: number
  fetchTilesTasks: FetchTilesPhase['taskMap']
  tileCache: FetchTilesPhase['cache']
  extractTilesTasks: ExtractTileFeaturesPhase['taskMap']
  featureCache: ExtractTileFeaturesPhase['cache']
  geometryTasks: CreateGeometryPhase['taskMap']
  geometryCache: CreateGeometryPhase['cache']
  completeObjectsTasks: CreateCompleteObjectPhase['taskMap']
  completeObjects: CreateCompleteObjectPhase['cache']
  labelTasks: CreateLabelPhase['taskMap']
  labelCache: CreateLabelPhase['cache']
  // TODO: remove this args
  args: any
}

export const MapComponent = createMappedComponent<MapComponentType>('map')
