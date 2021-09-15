import { Feature } from 'geojson'
import { BufferAttribute, BufferGeometryLoader } from 'three'
import FeatureCache from '../classes/FeatureCache'
import { DEFAULT_FEATURE_STYLES, getFeatureStyles } from '../styles'
import { ILayerName, MapDerivedFeatureGeometry } from '../types'
import { LongLat } from '../units'
import createGeometryWorker from './createGeometryWorker'

const geometryWorker = createGeometryWorker()
const geometryLoader = new BufferGeometryLoader()

// TODO make this in to a parameter?
/** Should only be used within the map code */
// export const $geometriesByTaskId = new Map<string, { geometry: BufferGeometry; geographicCenterPoint: LongLat }>()

export default async function createGeometry(
  taskId: string,
  layerName: ILayerName,
  feature: Feature,
  llCenter: LongLat
): Promise<MapDerivedFeatureGeometry> {
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
  // TODO compute boundingCircleRadius
  return { geometry, centerPoint: geographicCenterPoint, boundingCircleRadius: 5 }
}

export async function createGeometryUsingCache(
  cache: FeatureCache<MapDerivedFeatureGeometry>,
  layerName: string,
  x: number,
  y: number,
  tileIndex: string,
  feature: Feature,
  center: LongLat
): Promise<MapDerivedFeatureGeometry> {
  return null as any
}
