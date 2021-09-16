import { Feature } from 'geojson'
import FeatureCache from '../classes/FeatureCache'
import findSplitFeatures from './findSplitFeatures'
import unifyFeatures from './unifyFeatures'

export default function unifyCachedFeatures(cache: FeatureCache<Feature>) {
  for (const splitFeature of findSplitFeatures(cache.keys(), cache.values())) {
    const firstKey = splitFeature[0][0]
    const features = splitFeature.map(([_, feature]) => feature)
    const unifiedFeature = unifyFeatures(features)
    cache.setWithoutAffectingLastUsedTime(firstKey, unifiedFeature)
  }
}
