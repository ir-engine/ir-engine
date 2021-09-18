import { Feature } from 'geojson'
import { every } from 'lodash'
import FeatureCache from '../classes/FeatureCache'
import findSplitFeatures from './findSplitFeatures'
import unifyFeatures from './unifyFeatures'

const allowedGeometryTypes: Feature['geometry']['type'][] = ['Polygon', 'MultiPolygon']

export default function unifyCachedFeatures(cache: FeatureCache<Feature>) {
  for (const splitFeature of findSplitFeatures(cache.keys(), cache.values())) {
    const firstKey = splitFeature[0][0]
    const features = splitFeature.map(([_, feature]) => feature)
    if (every(features.map((feature) => allowedGeometryTypes.indexOf(feature.geometry.type) >= 0))) {
      const unifiedFeature = unifyFeatures(features)
      cache.setWithoutAffectingLastUsedTime(firstKey, unifiedFeature)
    }
  }
}
