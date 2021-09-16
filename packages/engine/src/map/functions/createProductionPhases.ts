import { Vector3 } from 'three'
import { LongLat } from '../units'
import { Feature } from 'geojson'
import TileCache from '../classes/TileCache'
import FeatureCache from '../classes/FeatureCache'
import { MapDerivedFeatureComplete, MapDerivedFeatureGeometry, VectorTile } from '../types'
import FetchTilesPhase from '../classes/FetchTilesPhase'
import ExtractTileFeaturesPhase from '../classes/ExtractTileFeaturesPhase'
import UnifyFeaturesPhase from '../classes/UnifyFeaturesPhase'
import CreateGeometryPhase from '../classes/CreateGeometryPhase'
import CreateCompleteObjectPhase from '../classes/CreateCompleteObjectPhase'

export function createProductionPhases(
  tileCache: TileCache<VectorTile>,
  featureCache: FeatureCache<Feature>,
  geometryCache: FeatureCache<MapDerivedFeatureGeometry>,
  completeObjects: FeatureCache<MapDerivedFeatureComplete>,
  center: LongLat,
  minimumSceneRadius: number,
  // TODO safe to assume this is same point in scene as `center`?
  viewerPosition: Vector3
) {
  return [
    new FetchTilesPhase(tileCache, center, minimumSceneRadius),
    new ExtractTileFeaturesPhase(tileCache, featureCache),
    new UnifyFeaturesPhase(featureCache),
    new CreateGeometryPhase(featureCache, geometryCache, center),
    new CreateCompleteObjectPhase(featureCache, geometryCache, completeObjects, viewerPosition, minimumSceneRadius)
  ]
}
