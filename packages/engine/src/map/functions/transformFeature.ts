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

function createScaleTransform(scale: number) {
  const fn: Transformer = (source, target) => {
    target[0] = source[0] * scale
    target[1] = source[1] * scale
  }
  fn.key = scale
  return fn
}

function createMetersFromCenterTransform(center: LongLat) {
  const fn: Transformer = (source, target) => {
    toMetersFromCenter(source, center, target)
  }
  fn.key = center
  return fn
}

let applyScale: Transformer
let transformToMetersFromCenter: Transformer

export default function transformFeature<FeatureType extends SupportedFeature>(
  feature: FeatureType,
  scale: number,
  center: LongLat
): MapTransformedFeature {
  const geometryType = feature.geometry.type
  const coordinates = feature.geometry.coordinates

  if (!applyScale || applyScale.key !== scale) {
    applyScale = createScaleTransform(scale)
  }
  if (!transformToMetersFromCenter || transformToMetersFromCenter.key !== center) {
    transformToMetersFromCenter = createMetersFromCenterTransform(center)
  }

  // transforming in-place since the original feature coordinates will not be needed
  transformGeometry(geometryType, coordinates, applyScale)
  transformGeometry(geometryType, coordinates, transformToMetersFromCenter)

  const centerPoint = findCenter(feature).geometry.coordinates as any

  transformGeometry(geometryType, coordinates, (source, target) => {
    target[0] = source[0] - centerPoint[0]
    target[1] = source[1] - centerPoint[1]
  })

  const { width, height } = measure(feature)

  // Account for the fact that Latitude decreases as we move south, while Z increases
  centerPoint[1] *= -1
  const boundingCircleRadius = Math.max(width, height) / 2

  return {
    feature,
    centerPoint,
    boundingCircleRadius
  }
}
