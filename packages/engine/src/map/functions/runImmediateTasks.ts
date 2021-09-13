import { SUPPORTED_LAYERS, TILE_ZOOM } from '../constants'
import { MapDerivedFeatureComplete } from '../types'
import createGeometry from './createGeometry'
import createSurroundingTileIterator from './createSurroundingTileIterator'
import fetchVectorTileUsingCache from './fetchVectorTile'

export default function runImmediateTasks(
  center: LongLat,
  minimumSceneRadius: number,
  viewerPosition: Vector3,
  vectorTileCache: TileCache<VectorTile>,
  featureCache: FeatureCache<Feature>,
  geometryCache: FeatureCache<MapDerivedFeatureGeometry>,
  completeObjects: FeatureCache<MapDerivedFeatureComplete>
) {
  for (const [x, y] of createSurroundingTileIterator(center, minimumSceneRadius, TILE_ZOOM)) {
    // These *UsingCache functions should check for object in cache before doing work
    fetchVectorTileUsingCache(vectorTileCache, x, y)
    const vectorTile = vectorTileCache.get(x, y)
    if (vectorTile) {
      for (const layerName of SUPPORTED_LAYERS) {
        const layer = vectorTile.layers[layerName]

        if (!layer) continue

        // TODO unify features
        // TODO how to handle navMesh?
        for (const feature of getFeaturesFromVectorTileLayer(layerName, vectorTile, x, y, TILE_ZOOM)) {
          featureCache.set(layerName, feature)
        }
      }
    }
  }

  unifyCachedFeatures(featureCache)

  for (const [feature, layerName] of featureCache.entries()) {
    createGeometryUsingCache(geometryCache, layerName, feature, center)
    const geometry = geometryCache.get(layerName, feature)
    // TODO create separate working for geographicCenterPoint and boundingCircleRadius?
    // TODO convert geographicCenterPoint to meters in worker and rename to centerPoint
    if (
      geometry &&
      computeDistanceFromBoundingCircle(viewerPosition, geometry.geographicCenterPoint, geometry.boundingCircleRadius) <
        minimumSceneRadius
    ) {
      createCompleteObjectsUsingCache(completeObjects, geometry, layerName, feature)
    }
  }
  vectorTileCache.evictLeastRecentlyUsedItems()
  geometryCache.evictLeastRecentlyUsedItems()
  completeObjects.evictLeastRecentlyUsedItems()
}
