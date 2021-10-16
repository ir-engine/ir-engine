import { bboxPolygon as convertBboxToPolygon, clone } from '@turf/turf'
import computeTileBoundingBox from '../functions/computeTileBoundingBox'
import { Store } from '../functions/createStore'
import createUsingCache from '../functions/createUsingCache'
import { MapTransformedFeature, TaskStatus, TileKey } from '../types'
import computePolygonDifference from '../functions/computePolygonDifference'
import { TILE_ZOOM } from '../constants'
import createSurroundingTileIterator from '../functions/createSurroundingTileIterator'
import { Feature, MultiPolygon, Polygon } from 'geojson'
import transformGeometry from '../functions/transformGeometry'
import * as PC from 'polygon-clipping'
import tesselatePolygon from '../functions/tesselatePolygon'

export const name = 'create navigation mesh polygons for tile'
export const isAsyncPhase = false
export const isCachingPhase = true

function createScaleTransform(scale: number) {
  return (source: [number, number], target: [number, number]) => {
    target[0] = source[0] * scale
    target[1] = source[1] * scale
  }
}

export default function getPCPolygons(features: Feature<Polygon | MultiPolygon>[]): PC.MultiPolygon {
  const result: PC.MultiPolygon = []
  for (const feature of features) {
    if (feature.geometry.type === 'MultiPolygon') {
      result.push(...(feature.geometry.coordinates as any))
    } else {
      result.push(feature.geometry.coordinates as any)
    }
  }
  return result
}

function fixLastPair(coordinates: Polygon) {
  const outerRing = coordinates[0]
  outerRing[outerRing.length - 1] = outerRing[0].slice() as PC.Pair
}

const createNavMeshUsingCache = createUsingCache((store: Store, ...key: TileKey) => {
  const [x, y] = key

  const relevantFeatures: MapTransformedFeature[] = []
  for (const featureKey of store.tileMeta.get(key).cachedFeatureKeys) {
    if (featureKey[0] === 'building') {
      const feature = store.transformedFeatureCache.get(featureKey)
      relevantFeatures.push(feature)
    }
  }

  const bbox = computeTileBoundingBox(x, y, store.originalCenter)
  const bboxPolygon = convertBboxToPolygon(bbox)

  const scaleCoord = createScaleTransform(store.scale)

  fixLastPair(bboxPolygon.geometry.coordinates as any)
  transformGeometry('Polygon', bboxPolygon.geometry.coordinates as any, scaleCoord)
  const transformedFeatures = relevantFeatures.map((feature) => {
    const clonedFeature: Feature<Polygon> = clone(feature.feature)
    transformGeometry(clonedFeature.geometry.type, clonedFeature.geometry.coordinates, (source, target) => {
      target[0] = source[0] + feature.centerPoint[0]
      target[1] = source[1] - feature.centerPoint[1]
    })
    transformGeometry(clonedFeature.geometry.type, clonedFeature.geometry.coordinates, scaleCoord)
    return clonedFeature
  })

  const pcPolygons: PC.MultiPolygon = getPCPolygons(transformedFeatures)
  const clippedPCPolygons = computePolygonDifference(bboxPolygon.geometry.coordinates as PC.Polygon, ...pcPolygons)

  const nonOverlappingConvexPolygons: PC.MultiPolygon = [] as any
  clippedPCPolygons.forEach((polygon) => {
    polygon.length > 1
      ? nonOverlappingConvexPolygons.push(...tesselatePolygon(polygon))
      : nonOverlappingConvexPolygons.push(polygon)
  })

  return nonOverlappingConvexPolygons as PC.MultiPolygon
})

export function getTaskKeys(store: Store) {
  return createSurroundingTileIterator(store.center, store.navMeshRadius, TILE_ZOOM)
}

export function getTaskStatus(store: Store, key: TileKey) {
  return store.tileNavMeshTasks.get(key)
}
export function setTaskStatus(store: Store, key: TileKey, status: TaskStatus) {
  return store.tileNavMeshTasks.set(key, status)
}

export function execTask(store: Store, key: TileKey) {
  return createNavMeshUsingCache(store.tileNavMeshCache, key, store)
}

export function cleanup(store: Store) {
  for (const [key] of store.tileNavMeshCache.evictLeastRecentlyUsedItems()) {
    store.tileNavMeshTasks.delete(key)
  }
}
