import { MapProps } from '../MapProps'
import { LongLat } from '../units'
import ArrayKeyedMap from '../../map/classes/ArrayKeyedMap'
import {
  FeatureKey,
  MapDerivedFeatureComplete,
  MapDerivedFeatureGeometry,
  MapFeatureLabel,
  TileKey,
  VectorTile
} from '../../map/types'
import FetchTileTask from '../../map/classes/FetchTileTask'
import TileCache from '../../map/classes/TileCache'
import FeatureCache from '../../map/classes/FeatureCache'
import { Feature } from 'geojson'
import ExtractTileFeaturesTask from '../../map/classes/ExtractTileFeaturesTask'
import CreateGeometryTask from '../../map/classes/CreateGeometryTask'
import CreateCompleteObjectTask from '../../map/classes/CreateCompleteObjectTask'
import { Entity } from '../../ecs/classes/Entity'
import CreateLabelTask from '../classes/CreateLabelTask'

export const MAX_CACHED_FEATURES = 1024 * 4

export default function createStore(
  center: LongLat,
  args: MapProps,
  triggerRefreshRadius: number,
  minimumSceneRadius: number
) {
  return {
    center,
    originalCenter: center,
    triggerRefreshRadius,
    minimumSceneRadius,
    fetchTilesTasks: new ArrayKeyedMap<TileKey, FetchTileTask>(),
    tileCache: new TileCache<VectorTile>(16),
    extractTilesTasks: new ArrayKeyedMap<TileKey, ExtractTileFeaturesTask>(),
    featureCache: new FeatureCache<Feature>(MAX_CACHED_FEATURES),
    geometryTasks: new ArrayKeyedMap<FeatureKey, CreateGeometryTask>(),
    geometryCache: new FeatureCache<MapDerivedFeatureGeometry>(MAX_CACHED_FEATURES),
    completeObjectsTasks: new ArrayKeyedMap<FeatureKey, CreateCompleteObjectTask>(),
    completeObjects: new FeatureCache<MapDerivedFeatureComplete>(MAX_CACHED_FEATURES),
    labelTasks: new ArrayKeyedMap<FeatureKey, CreateLabelTask>(),
    labelCache: new FeatureCache<Entity>(MAX_CACHED_FEATURES),
    // TODO get rid of `args`, flatten in to parent object maybe
    args
  }
}
