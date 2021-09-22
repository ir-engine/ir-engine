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
import TileCache from '../../map/classes/TileCache'
import FeatureCache from '../../map/classes/FeatureCache'
import { Feature } from 'geojson'
import { TaskStatus } from '../types'

export const MAX_CACHED_FEATURES = 1024 * 8

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
    scale,
    fetchTilesTasks: new ArrayKeyedMap<TileKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
    tileCache: new TileCache<VectorTile>(MAX_CACHED_FEATURES),
    extractTilesTasks: new ArrayKeyedMap<TileKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
    featureCache: new FeatureCache<Feature>(MAX_CACHED_FEATURES),
    geometryTasks: new ArrayKeyedMap<FeatureKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
    geometryCache: new FeatureCache<MapDerivedFeatureGeometry>(MAX_CACHED_FEATURES),
    completeObjectsTasks: new ArrayKeyedMap<FeatureKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
    completeObjects: new FeatureCache<MapDerivedFeatureComplete>(MAX_CACHED_FEATURES),
    labelTasks: new ArrayKeyedMap<FeatureKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
    labelCache: new FeatureCache<MapFeatureLabel>(MAX_CACHED_FEATURES),
    tileMeta: new ArrayKeyedMap<TileKey, { cachedFeatureKeys: Set<FeatureKey> }>([], {
      defaultValue: { cachedFeatureKeys: new Set() }
    }),
    featureMeta: new ArrayKeyedMap<FeatureKey, { tileKey: TileKey }>(),
    // TODO get rid of `args`, flatten in to parent object maybe
    args
  }
}
