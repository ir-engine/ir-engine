import { Feature } from 'geojson'
import unifyCachedFeatures from '../functions/unifyCachedFeatures'
import FeatureCache from './FeatureCache'
import Task from './Task'

export default class UnifyFeaturesTask extends Task<void> {
  featureCache: FeatureCache<Feature>
  constructor(featureCache: FeatureCache<Feature>) {
    super()
    this.featureCache = featureCache
  }

  exec() {
    unifyCachedFeatures(this.featureCache)
  }
}
