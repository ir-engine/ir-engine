import { Feature } from 'geojson'
import { BufferAttribute, BufferGeometry, BufferGeometryLoader } from 'three'
import { DEFAULT_FEATURE_STYLES, getFeatureStyles } from '../styles'
import { ILayerName } from '../types'
import { LongLat } from '../units'
import createGeometryWorker from './createGeometryWorker'

const geometryWorker = createGeometryWorker()
const geometryLoader = new BufferGeometryLoader()

// TODO make this in to a parameter?
/** Should only be used within the map code */
export const $geometriesByTaskId = new Map<string, { geometry: BufferGeometry; geographicCenterPoint: LongLat }>()

export default async function createGeometry(
  taskId: string,
  layerName: ILayerName,
  feature: Feature,
  llCenter: LongLat
): Promise<void> {
  const style = getFeatureStyles(DEFAULT_FEATURE_STYLES, layerName, feature.properties.class)
  const {
    geometry: { json, transfer },
    geographicCenterPoint
  } = await geometryWorker.postTask(taskId, feature, llCenter, style)

  const geometry = geometryLoader.parse(json)
  for (const attributeName in transfer.attributes) {
    const { array, itemSize, normalized } = transfer.attributes[attributeName]
    geometry.setAttribute(attributeName, new BufferAttribute(array, itemSize, normalized))
  }
  $geometriesByTaskId.set(taskId, { geometry, geographicCenterPoint })
}
