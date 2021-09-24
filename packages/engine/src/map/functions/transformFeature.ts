import { MapTransformedFeature, SupportedFeature } from '../types'
import { LongLat, toMetersFromCenter } from '../units'
import transformGeometry from './transformGeometry'
import { bbox, center as findCenter } from '@turf/turf'

export function measure(feature: SupportedFeature) {
  const [minX, minY, maxX, maxY] = bbox(feature)
  return {
    width: maxX - minX,
    height: maxY - minY
  }
}

interface Transformer {
  (source: [number, number], target: [number, number]): void
  key: any
}

function createMetersFromCenterTransform(center: LongLat) {
  const fn: Transformer = (source, target) => {
    toMetersFromCenter(source, center, target)
  }
  fn.key = center
  return fn
}

let transformToMetersFromCenter: Transformer

export default function transformFeature<FeatureType extends SupportedFeature>(
  feature: FeatureType,
  center: LongLat
): MapTransformedFeature {
  const geometryType = feature.geometry.type
  const coordinates = feature.geometry.coordinates

  const centerPointLongLat = findCenter(feature).geometry.coordinates
  const centerPoint = toMetersFromCenter(centerPointLongLat, center) as [number, number]

  if (!transformToMetersFromCenter || transformToMetersFromCenter.key !== center) {
    transformToMetersFromCenter = createMetersFromCenterTransform(center)
  }

  // transforming in-place since the original feature coordinates will not be needed
  // transformGeometry(geometryType, coordinates, applyScale)
  transformGeometry(geometryType, coordinates, transformToMetersFromCenter)

  // TODO(perf): finding the center and bounding circle radius depend on calculating the bounding box, so calculate bounding box once

  transformGeometry(geometryType, coordinates, (source, target) => {
    target[0] = source[0] - centerPoint[0]
    target[1] = source[1] - centerPoint[1]
  })

  const { width, height } = measure(feature)

  const boundingCircleRadius = Math.max(width, height) / 2

  // Account for the fact that Latitude decreases as we move south, while Z increases
  centerPoint[1] *= -1

  return {
    feature,
    centerPoint,
    boundingCircleRadius
  }
}
