import { bboxPolygon as convertBboxToPolygon, clone } from '@turf/turf'
import computeTileBoundingBox from '../functions/computeTileBoundingBox'
import { Store } from '../functions/createStore'
import createUsingCache from '../functions/createUsingCache'
import { TaskStatus, TileKey } from '../types'
import computePolygonsOfFeaturesNegative from '../functions/computePolygonsOfFeaturesNegative'
import { toMetersFromCenter } from '../units'
import { TILE_ZOOM } from '../constants'
import createSurroundingTileIterator from '../functions/createSurroundingTileIterator'
import { Feature, Polygon } from 'geojson'
import transformPolygon from '../functions/transformPolygon'

export const name = 'create navigation mesh polygons for tile'
export const isAsyncPhase = false
export const isCachingPhase = true

function createScaleTransform(scale: number) {
  return (source: [number, number], target: [number, number]) => {
    target[0] = source[0] * scale
    target[1] = source[1] * scale
  }
}

const createNavMeshUsingCache = createUsingCache((store: Store, ...key: TileKey) => {
  const [x, y] = key

  // const relevantGeometries: MapDerivedFeatureGeometry[] = []
  const relevantFeatures = []
  for (const featureKey of store.tileMeta.get(key).cachedFeatureKeys) {
    if (featureKey[0] === 'building') {
      // relevantGeometries.push(store.geometryCache.get(featureKey))
      // }
      // }
      const feature = store.featureCache.get(featureKey)
      relevantFeatures.push(feature)
    }
  }

  const bbox = computeTileBoundingBox(x, y, store.originalCenter)
  const bboxPolygon = convertBboxToPolygon(bbox)

  // const transformedFeatures = relevantGeometries.map((geometry) => {
  //   const coordinates = []
  //   const normals = geometry.geometry.getAttribute('normal')
  //   const positions = geometry.geometry.getAttribute('position')
  //   const [centerX, centerZ] = geometry.centerPoint
  //   for (let index = 0, length = normals.count; index < length; index++) {
  //     if (normals.getY(index) === 1) {
  //       coordinates.push([(positions.getX(index) + centerX) * store.scale, (positions.getZ(index) + centerZ) * store.scale])
  //     }
  //   }
  //   coordinates.push([coordinates[0][0], coordinates[0][1]])
  //   return polygon([coordinates])
  // })
  const scaleCoord = createScaleTransform(store.scale)
  const scaleAndConvertCoord = (source: [number, number], target: [number, number]) => {
    toMetersFromCenter(source, store.originalCenter, target)
    scaleCoord(source, target)
  }

  transformPolygon('Polygon', bboxPolygon.geometry.coordinates as any, scaleCoord)
  const transformedFeatures = []
  for (const feature of relevantFeatures) {
    const clonedFeature: Feature<Polygon> = clone(feature)
    transformPolygon(clonedFeature.geometry.type, clonedFeature.geometry.coordinates as any, scaleAndConvertCoord)
    transformedFeatures.push(clonedFeature)
  }
  return computePolygonsOfFeaturesNegative(bboxPolygon, transformedFeatures)
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
