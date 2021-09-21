import { Store } from '../functions/createStore'
import unifyCachedFeatures from '../functions/unifyCachedFeatures'

export const name = 'unify features'
export const isAsyncPhase = false
export const isCachingPhase = false

export function* getTaskKeys() {
  yield null
}

export function execTask(store: Store) {
  unifyCachedFeatures(store.featureCache)
}

export function cleanup() {}
