import { Mesh, MeshLambertMaterial } from 'three'
import { DEFAULT_FEATURE_STYLES, getFeatureStyles, MAX_Z_INDEX } from '../styles'
import { ILayerName, MapDerivedFeatureComplete, MapDerivedFeatureGeometry, SupportedFeature } from '../types'
import getCachedMaterial from './getCachedMaterial'

export default function createCompleteObject(
  layerName: ILayerName,
  geometryPhaseResult: MapDerivedFeatureGeometry,
  feature: SupportedFeature
): MapDerivedFeatureComplete {
  const { color, extrude, zIndex = 0 } = getFeatureStyles(DEFAULT_FEATURE_STYLES, layerName, feature.properties.class)

  const materialParams = {
    ...(color?.constant ? { color: color?.constant } : {}),
    vertexColors: color?.builtin_function === 'purple_haze' ? true : false,
    depthTest: extrude !== 'flat'
  }

  const { geometry, centerPoint, boundingCircleRadius } = geometryPhaseResult

  const material = getCachedMaterial(MeshLambertMaterial, materialParams)
  const mesh = new Mesh(geometry, material)
  mesh.renderOrder = extrude === 'flat' ? -1 * (MAX_Z_INDEX - zIndex) : Infinity
  return { mesh, centerPoint, boundingCircleRadius }
}
