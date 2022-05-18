import { ILayerName, MapTransformedFeature, SupportedFeature } from '../types'
import { LongLat, toMetersFromCenter } from '../functions/UnitConversionFunctions'
import transformGeometry from './transformGeometry'
import * as turf from '@turf/turf'
import { DEFAULT_FEATURE_STYLES, getFeatureStyles } from '../styles'

export function measure(feature: SupportedFeature) {
  const [minX, minY, maxX, maxY] = turf.bbox(feature)
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

const LINE_TYPES: SupportedFeature['geometry']['type'][] = ['LineString', 'MultiLineString']

export default function transformFeature<FeatureType extends SupportedFeature>(
  layerName: ILayerName,
  feature: FeatureType,
  center: LongLat
): MapTransformedFeature {
  const centerPointLongLat = turf.center(feature).geometry.coordinates
  const centerPoint = toMetersFromCenter(centerPointLongLat, center) as [number, number]
  let transformedFeature = feature

  feature.properties ||= {}

  if (!feature.properties.transformed) {
    if (!transformToMetersFromCenter || transformToMetersFromCenter.key !== center) {
      transformToMetersFromCenter = createMetersFromCenterTransform(center)
    }

    if (LINE_TYPES.includes(feature.geometry.type)) {
      const style = getFeatureStyles(DEFAULT_FEATURE_STYLES, layerName, feature.properties.class)
      // TODO(perf) reduce number of steps
      transformedFeature = turf.buffer(feature, style.width || 1, {
        units: 'meters',
        steps: 6
      }) as any
    }

    // transforming in-place since the original feature coordinates will not be needed
    transformGeometry(
      transformedFeature.geometry.type,
      transformedFeature.geometry.coordinates,
      transformToMetersFromCenter
    )

    // TODO(perf): finding the center and bounding circle radius depend on calculating the bounding box, so calculate bounding box once

    transformGeometry(transformedFeature.geometry.type, transformedFeature.geometry.coordinates, (source, target) => {
      target[0] = source[0] - centerPoint[0]
      target[1] = source[1] - centerPoint[1]
    })
  }

  const { width, height } = measure(feature)

  const boundingCircleRadius = Math.max(width, height) / 2

  // Account for the fact that Latitude decreases as we move south, while Z increases
  centerPoint[1] *= -1

  return {
    feature: transformedFeature,
    centerPoint,
    boundingCircleRadius
  }
}
