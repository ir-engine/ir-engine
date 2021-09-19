import { LongLat } from '../units'
import FetchTilesPhase from '../classes/FetchTilesPhase'
import ExtractTileFeaturesPhase from '../classes/ExtractTileFeaturesPhase'
import UnifyFeaturesPhase from '../classes/UnifyFeaturesPhase'
import CreateGeometryPhase from '../classes/CreateGeometryPhase'
import CreateCompleteObjectPhase from '../classes/CreateCompleteObjectPhase'
import { Vector3 } from 'three'
import Phase from '../classes/Phase'
import { World } from '../../ecs/classes/World'
import CreateLabelPhase from '../classes/CreateLabelPhase'

export function createProductionPhases(
  world: World,
  fetchTilesTasks: FetchTilesPhase['taskMap'],
  tileCache: FetchTilesPhase['cache'],
  extractTilesTasks: ExtractTileFeaturesPhase['taskMap'],
  featureCache: ExtractTileFeaturesPhase['cache'],
  geometryTasks: CreateGeometryPhase['taskMap'],
  geometryCache: CreateGeometryPhase['cache'],
  completeObjectsTasks: CreateCompleteObjectPhase['taskMap'],
  completeObjects: CreateCompleteObjectPhase['cache'],
  labelTasks: CreateLabelPhase['taskMap'],
  labelCache: CreateLabelPhase['cache'],
  center: LongLat,
  originalCenter: LongLat,
  minimumSceneRadius: number,
  viewerPosition: Vector3,
  mapScale: number
): Phase<any>[] {
  return [
    new FetchTilesPhase(fetchTilesTasks, tileCache, center, minimumSceneRadius),
    new ExtractTileFeaturesPhase(extractTilesTasks, tileCache, featureCache),
    new UnifyFeaturesPhase(featureCache),
    new CreateGeometryPhase(geometryTasks, featureCache, geometryCache, originalCenter),
    new CreateCompleteObjectPhase(
      completeObjectsTasks,
      featureCache,
      geometryCache,
      completeObjects,
      viewerPosition,
      minimumSceneRadius,
      mapScale
    ),
    new CreateLabelPhase(world, labelTasks, labelCache, featureCache, originalCenter)
  ]
}
