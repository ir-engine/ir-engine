import { Downgraded, createState } from '@hookstate/core'
import { MultiPolygon } from 'polygon-clipping'
import { Mesh } from 'three'

import { isClient } from '../common/functions/isClient'
import FeatureCache from './classes/FeatureCache'
import HashMap from './classes/HashMap'
import HashSet from './classes/HashSet'
import MutableNavMesh from './classes/MutableNavMesh'
import TileCache from './classes/TileCache'
import { MAX_CACHED_FEATURES, MAX_CACHED_TILES } from './constants'
import { LongLat } from './functions/UnitConversionFunctions'
import {
  FeatureKey,
  MapDerivedFeatureComplete,
  MapDerivedFeatureGeometry,
  MapFeatureLabel,
  MapHelpers,
  MapTransformedFeature,
  SupportedFeature,
  TaskStatus,
  Text3D,
  TileKey,
  VectorTile
} from './types'

const state = createState({
  center: [0, 0],
  originalCenter: [0, 0],
  viewerPosition: [0, 0],
  triggerRefreshRadius: 160,
  minimumSceneRadius: 800,
  labelRadius: 400,
  navMeshRadius: 400,
  scale: 1,
  fetchTilesTasks: new HashMap<TileKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
  tileCache: new TileCache<VectorTile>(MAX_CACHED_TILES),
  extractTilesTasks: new HashMap<TileKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
  featureCache: new FeatureCache<SupportedFeature>(MAX_CACHED_FEATURES),
  transformedFeatureTasks: new HashMap<FeatureKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
  transformedFeatureCache: new FeatureCache<MapTransformedFeature>(MAX_CACHED_FEATURES),
  geometryTasks: new HashMap<FeatureKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
  geometryCache: new FeatureCache<MapDerivedFeatureGeometry>(MAX_CACHED_FEATURES),
  completeObjectsTasks: new HashMap<FeatureKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
  completeObjects: new FeatureCache<MapDerivedFeatureComplete>(MAX_CACHED_FEATURES),
  labelTasks: new HashMap<FeatureKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
  labelCache: new FeatureCache<MapFeatureLabel>(MAX_CACHED_FEATURES),
  tileNavMeshTasks: new HashMap<TileKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
  tileNavMeshCache: new TileCache<MultiPolygon>(MAX_CACHED_TILES),
  helpersTasks: new HashMap<TileKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
  helpersCache: new TileCache<MapHelpers>(MAX_CACHED_TILES),
  tileMeta: new HashMap<TileKey, { cachedFeatureKeys: HashSet<FeatureKey> }>([], {
    defaultValue: { cachedFeatureKeys: new HashSet() }
  }),
  featureMeta: new HashMap<FeatureKey, { tileKey: TileKey }>(),
  navMesh: new MutableNavMesh(),
  activePhase: null as null | string,
  updateSpinner: null as null | Mesh,
  updateTextContainer: null as null | Text3D
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

if (process.env.APP_ENV === 'development' && isClient) {
  ;(window as any).mapReceptor = mapReceptor
  ;(window as any).MapAction = MapAction
  ;(window as any).accessMapState = accessMapState
}
