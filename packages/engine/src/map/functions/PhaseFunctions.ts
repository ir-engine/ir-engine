import { TaskStatus } from '../types'
import { ICachingPhase, IPhase, ISyncPhase, MapStateUnwrapped } from '../types'
import checkKey from './checkKey'
import * as FetchTilesPhase from '../phases/FetchTilesPhase'
import * as ExtractTileFeaturesPhase from '../phases/ExtractTileFeaturesPhase'
import * as TransformFeaturePhase from '../phases/TransformFeaturePhase'
import * as UnifyFeaturesPhase from '../phases/UnifyFeaturesPhase'
import * as CreateGeometryPhase from '../phases/CreateGeometryPhase'
import * as CreateFallbackLanduseMeshPhase from '../phases/CreateFallbackLanduseMeshPhase'
import * as CreateTileNavMeshPhase from '../phases/CreateTileNavMeshPhase'
import * as CreateCompleteObjectPhase from '../phases/CreateCompleteObjectPhase'
import * as CreateCompleteNavMeshPhase from '../phases/CreateCompleteNavMeshPhase'
import * as CreateLabelPhase from '../phases/CreateLabelPhase'
import * as CreateHelpersPhase from '../phases/CreateHelpersPhase'

// Random Thought: Monads like https://github.com/monet/monet.js/blob/master/docs/FREE.md could be useful here.

const defaultPhases = Object.freeze([
  FetchTilesPhase,
  ExtractTileFeaturesPhase,
  UnifyFeaturesPhase,
  TransformFeaturePhase,
  CreateGeometryPhase,
  CreateFallbackLanduseMeshPhase,
  CreateTileNavMeshPhase,
  CreateCompleteObjectPhase,
  CreateCompleteNavMeshPhase,
  CreateLabelPhase,
  CreateHelpersPhase
])

const phasesNoNavigation = Object.freeze([
  FetchTilesPhase,
  ExtractTileFeaturesPhase,
  UnifyFeaturesPhase,
  TransformFeaturePhase,
  CreateGeometryPhase,
  CreateFallbackLanduseMeshPhase,
  CreateCompleteObjectPhase,
  CreateLabelPhase
])

type FeatureId = 'navigation'

export function getPhases(options: { exclude?: FeatureId[] } = {}): readonly IPhase<any, any>[] {
  const exclude = options.exclude || []
  return exclude.includes('navigation') ? phasesNoNavigation : defaultPhases
}

export function resetPhases(state: MapStateUnwrapped, phases: readonly IPhase<any, any>[]) {
  for (const phase of phases) {
    phase.reset(state)
  }
}

export async function startPhases(state: MapStateUnwrapped, phases: readonly IPhase<any, any>[]) {
  const results = [] as any[]
  let result: any
  for (const phase of phases) {
    const keys = phase.getTaskKeys(state)
    if (process.env.NODE_ENV === 'development') {
      if (!keys[Symbol.iterator]) {
        throw new Error('task keys are not iterable!')
      }
    }
    if (phase.isCachingPhase || phase.isAsyncPhase) {
      const promises = [] as Promise<any>[]
      let promise: Promise<any>
      for (const key of keys) {
        if (process.env.NODE_ENV === 'development') {
          checkKey(key)
        }
        if (phase.getTaskStatus(state, key) === TaskStatus.NOT_STARTED) {
          if (phase.isAsyncPhase) {
            promise = phase.startTask(state, key)
            promises.push(promise)
          } else {
            result = (phase as ICachingPhase<any, any>).execTask(state, key)
            results.push(result)
          }
          ;(phase as ICachingPhase<any, any>).setTaskStatus(state, key, TaskStatus.STARTED)
        }
      }
      results.push(...(await Promise.all(promises)))
    } else {
      for (const key of keys) {
        result = (phase as ISyncPhase<any, any>).execTask(state, key)
        results.push(result)
      }
    }
    phase.cleanup(state)
  }
  state.needsUpdate = true
  return results
}
