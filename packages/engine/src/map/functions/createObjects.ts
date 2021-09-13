import { Mesh } from 'three'
import createMesh from './createMesh'
import createGeometry, { $geometriesByTaskId } from './createGeometry'
import { DEFAULT_FEATURE_STYLES, getFeatureStyles } from '../styles'
import { FeatureWithTileIndex, ILayerName, MapDerivedFeatureComplete } from '../types'
import { LongLat } from '../units'

const $meshesByTaskId = new Map<string, { mesh: Mesh; geographicCenterPoint: LongLat }>()

function getFeatureUUID(layerName: string, tileX: number, tileY: number, feature: FeatureWithTileIndex) {
  return `${layerName},${tileX},${tileY},${feature.properties.tileIndex}`
}

// TODO add labels, raster tiles
export default async function* createObjects(
  layerName: ILayerName,
  tileX: number,
  tileY: number,
  features: FeatureWithTileIndex[],
  llCenter: LongLat
): AsyncGenerator<MapDerivedFeatureComplete> {
  const pendingTasks: { id: string; featureIndex: number }[] = []
  const promises = []
  features.forEach((feature, featureIndex) => {
    const id = getFeatureUUID(layerName, tileX, tileY, feature)
    const promise = createGeometry(id, layerName, feature, llCenter)
    // Don't rebuild it if already available
    // TODO move this to system
    if (!$meshesByTaskId.has(id)) {
      promises.push(promise)
      pendingTasks.push({
        id,
        featureIndex
      })
    }
  })

  await Promise.all(promises)

  for (const task of pendingTasks) {
    const geometryTaskResult = $geometriesByTaskId.get(task.id)
    if (geometryTaskResult) {
      const { geometry, geographicCenterPoint } = geometryTaskResult
      const style = getFeatureStyles(DEFAULT_FEATURE_STYLES, layerName, features[task.featureIndex].properties.class)

      const mesh = createMesh(geometry, style)
      const result = { uuid: task.id, mesh, geographicCenterPoint }
      $meshesByTaskId.set(task.id, result)
      yield result
    }
  }
}
