import { MapProps } from '../MapProps'
import { LongLat } from '../functions/UnitConversionFunctions'
import ArrayKeyedMap from '../../map/classes/ArrayKeyedMap'
import {
  FeatureKey,
  MapDerivedFeatureComplete,
  MapDerivedFeatureGeometry,
  MapFeatureLabel,
  MapHelpers,
  MapTransformedFeature,
  SupportedFeature,
  TileKey,
  VectorTile
} from '../../map/types'
import TileCache from '../../map/classes/TileCache'
import FeatureCache from '../../map/classes/FeatureCache'
import { TaskStatus } from '../types'
import { MultiPolygon } from 'polygon-clipping'
import MutableNavMesh from '../classes/MutableNavMesh'

export const MAX_CACHED_TILES = 32
export const MAX_CACHED_FEATURES = 1024 * MAX_CACHED_TILES

export type Store = ReturnType<typeof createStore>

export default function createStore(
  center: LongLat,
  viewerPosition: [number, number],
  triggerRefreshRadius: number,
  minimumSceneRadius: number,
  scale: number,
  args: MapProps
) {
  return {
    center,
    originalCenter: center,
    viewerPosition: viewerPosition,
    triggerRefreshRadius,
    minimumSceneRadius,
    labelRadius: minimumSceneRadius * 0.5,
    navMeshRadius: minimumSceneRadius * 0.5,
    scale,
    fetchTilesTasks: new ArrayKeyedMap<TileKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
    tileCache: new TileCache<VectorTile>(MAX_CACHED_TILES),
    extractTilesTasks: new ArrayKeyedMap<TileKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
    featureCache: new FeatureCache<SupportedFeature>(MAX_CACHED_FEATURES),
    transformedFeatureTasks: new ArrayKeyedMap<FeatureKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
    transformedFeatureCache: new FeatureCache<MapTransformedFeature>(MAX_CACHED_FEATURES),
    geometryTasks: new ArrayKeyedMap<FeatureKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
    geometryCache: new FeatureCache<MapDerivedFeatureGeometry>(MAX_CACHED_FEATURES),
    completeObjectsTasks: new ArrayKeyedMap<FeatureKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
    completeObjects: new FeatureCache<MapDerivedFeatureComplete>(MAX_CACHED_FEATURES),
    labelTasks: new ArrayKeyedMap<FeatureKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
    labelCache: new FeatureCache<MapFeatureLabel>(MAX_CACHED_FEATURES),
    tileNavMeshTasks: new ArrayKeyedMap<TileKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
    tileNavMeshCache: new TileCache<MultiPolygon>(MAX_CACHED_TILES),
    helpersTasks: new ArrayKeyedMap<TileKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
    helpersCache: new TileCache<MapHelpers>(MAX_CACHED_TILES),
    tileMeta: new ArrayKeyedMap<TileKey, { cachedFeatureKeys: Set<FeatureKey> }>([], {
      defaultValue: { cachedFeatureKeys: new Set() }
    }),
    featureMeta: new ArrayKeyedMap<FeatureKey, { tileKey: TileKey }>(),
    navMesh: new MutableNavMesh(),
    // TODO get rid of `args`, flatten in to parent object maybe
    args
  }
}
