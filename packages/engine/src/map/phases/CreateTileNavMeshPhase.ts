import { clone, bboxPolygon as convertBboxToPolygon } from '@turf/turf'
import { Feature, MultiPolygon, Polygon } from 'geojson'
import * as PC from 'polygon-clipping'

import { TILE_ZOOM } from '../constants'
import computePolygonDifference from '../functions/computePolygonDifference'
import computeTileBoundingBox from '../functions/computeTileBoundingBox'
import createSurroundingTileIterator from '../functions/createSurroundingTileIterator'
import createUsingCache from '../functions/createUsingCache'
import tesselatePolygon from '../functions/tesselatePolygon'
import transformGeometry from '../functions/transformGeometry'
import { MapStateUnwrapped, MapTransformedFeature, TaskStatus, TileKey } from '../types'

export const name = 'CreateTileNavMesh'
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

// @ts-ignore
const createNavMeshUsingCache = createUsingCache((state: MapStateUnwrapped, key: TileKey) => {
  const [x, y] = key

  const relevantFeatures: MapTransformedFeature[] = []
  // @ts-ignore
  for (const featureKey of state.tileMeta.get(key).cachedFeatureKeys.keys()) {
    if (featureKey[0] === 'building') {
      const feature = state.transformedFeatureCache.get(featureKey)
      relevantFeatures.push(feature)
    }
  }

  const bbox = computeTileBoundingBox(x, y, state.originalCenter)
  const bboxPolygon = convertBboxToPolygon(bbox)

  const scaleCoord = createScaleTransform(state.scale)

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

export function getTaskKeys(state: MapStateUnwrapped) {
  return createSurroundingTileIterator(state.center, state.navMeshRadius, TILE_ZOOM)
}

export function getTaskStatus(state: MapStateUnwrapped, key: TileKey) {
  return state.tileNavMeshTasks.get(key)
}
export function setTaskStatus(state: MapStateUnwrapped, key: TileKey, status: TaskStatus) {
  return state.tileNavMeshTasks.set(key, status)
}

export function execTask(state: MapStateUnwrapped, key: TileKey) {
  return createNavMeshUsingCache(state.tileNavMeshCache, state, key)
}

export function cleanup(state: MapStateUnwrapped) {
  for (const [key] of state.tileNavMeshCache.evictLeastRecentlyUsedItems()) {
    state.tileNavMeshTasks.delete(key)
  }
}

export function reset(state: MapStateUnwrapped) {
  state.tileNavMeshTasks.clear()
  state.tileNavMeshCache.clear()
}
