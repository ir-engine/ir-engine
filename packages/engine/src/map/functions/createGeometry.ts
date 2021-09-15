import { Feature } from 'geojson'
import { BufferAttribute, BufferGeometryLoader } from 'three'
import { DEFAULT_FEATURE_STYLES, getFeatureStyles } from '../styles'
import { ILayerName, MapDerivedFeatureGeometry } from '../types'
import { LongLat } from '../units'
import createGeometryWorker from './createGeometryWorker'

const geometryWorker = createGeometryWorker()
const geometryLoader = new BufferGeometryLoader()

export default async function createGeometry(
  taskId: string,
  layerName: ILayerName,
  feature: Feature,
  center: LongLat
): Promise<MapDerivedFeatureGeometry> {
  const style = getFeatureStyles(DEFAULT_FEATURE_STYLES, layerName, feature.properties.class)
  const {
    geometry: { json, transfer },
    centerPoint
  } = await geometryWorker.postTask(taskId, feature, center, style)

  const geometry = geometryLoader.parse(json)
  for (const attributeName in transfer.attributes) {
    const { array, itemSize, normalized } = transfer.attributes[attributeName]
    geometry.setAttribute(attributeName, new BufferAttribute(array, itemSize, normalized))
  }
  // TODO compute boundingCircleRadius
  return { geometry, centerPoint, boundingCircleRadius: 5 }
}
