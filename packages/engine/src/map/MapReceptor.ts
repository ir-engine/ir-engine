import { createState, Downgraded } from '@hookstate/core'
import ArrayKeyedMap from './classes/ArrayKeyedMap'
import TileCache from './classes/TileCache'
import {
  FeatureKey,
  MapDerivedFeatureComplete,
  MapDerivedFeatureGeometry,
  MapFeatureLabel,
  MapHelpers,
  MapTransformedFeature,
  SupportedFeature,
  TaskStatus,
  TileKey,
  VectorTile
} from './types'
import { MAX_CACHED_TILES, MAX_CACHED_FEATURES } from './constants'
import FeatureCache from './classes/FeatureCache'
import { MultiPolygon } from 'polygon-clipping'
import MutableNavMesh from './classes/MutableNavMesh'
import { LongLat } from './functions/UnitConversionFunctions'

const state = createState({
  center: [0, 0],
  originalCenter: [0, 0],
  viewerPosition: [0, 0],
  triggerRefreshRadius: 40,
  minimumSceneRadius: 800,
  labelRadius: 400,
  navMeshRadius: 400,
  scale: 1,
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
  needsUpdate: false
})

export type _MapStateUnwrapped = ReturnType<typeof state['get']>

export const MapAction = {
  initialize: (centerPoint: LongLat, scale = 1, triggerRefreshRadius = 40, minimumSceneRadius = 800) => {
    return {
      type: 'map.INITIALIZE' as const,
      centerPoint,
      triggerRefreshRadius,
      minimumSceneRadius,
      scale
    }
  },
  setCenterPoint: (centerPoint: LongLat) => {
    return {
      type: 'map.SET_CENTER_POINT' as const,
      centerPoint
    }
  }
}

export type MapActionType = ReturnType<typeof MapAction[keyof typeof MapAction]>

export const mapReducer = (_, action: MapActionType) => {
  mapReceptor(action)
  return state.attach(Downgraded).value
}

export const mapReceptor = (action: MapActionType) => {
  state.batch((s) => {
    switch (action.type) {
      case 'map.INITIALIZE':
        return s.merge({
          center: action.centerPoint,
          originalCenter: action.centerPoint,
          triggerRefreshRadius: action.triggerRefreshRadius,
          minimumSceneRadius: action.minimumSceneRadius,
          labelRadius: action.minimumSceneRadius * 0.5,
          navMeshRadius: action.minimumSceneRadius * 0.5,
          scale: action.scale
        })
      case 'map.SET_CENTER_POINT':
        return s.merge({
          center: action.centerPoint,
          originalCenter: action.centerPoint
        })
    }
  })
}

export const accessMapState = () => state
