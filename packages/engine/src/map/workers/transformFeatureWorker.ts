import * as Comlink from 'comlink'
import transformFeature from '../functions/transformFeature'

export interface WorkerApi {
  handle: typeof transformFeature
}

Comlink.expose({
  handle: transformFeature
} as WorkerApi)
