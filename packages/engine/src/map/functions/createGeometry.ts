import { BufferAttribute, BufferGeometry, BufferGeometryLoader } from 'three'
import { DEFAULT_FEATURE_STYLES, getFeatureStyles } from '../styles'
import { ILayerName, SupportedFeature } from '../types'
import createGeometryWorker from './createGeometryWorker'

const geometryWorker = createGeometryWorker()
const geometryLoader = new BufferGeometryLoader()

export default async function createGeometry(
  taskId: string,
  layerName: ILayerName,
  feature: SupportedFeature
): Promise<BufferGeometry> {
  const style = getFeatureStyles(DEFAULT_FEATURE_STYLES, layerName, feature.properties.class)
  const {
    geometry: { json, transfer }
  } = await geometryWorker!.postTask(taskId, feature, style)

  const geometry = geometryLoader.parse(json)
  for (const attributeName in transfer.attributes) {
    const { array, itemSize, normalized } = transfer.attributes[attributeName]
    geometry.setAttribute(attributeName, new BufferAttribute(array, itemSize, normalized))
  }
  return geometry
}
