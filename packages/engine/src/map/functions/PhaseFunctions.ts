import { TaskStatus } from '../types'
import { ICachingPhase, IPhase, ISyncPhase, MapStateUnwrapped } from '../types'
import checkKey from './checkKey'
import { isClient } from '../../common/functions/isClient'

// Random Thought: Monads like https://github.com/monet/monet.js/blob/master/docs/FREE.md could be useful here.
type FeatureId = 'navigation'

const defaultPhases: Promise<IPhase<any, any>>[] = []
const phasesNoNavigation: Promise<IPhase<any, any>>[] = []

if (isClient) {
  const phases: { [name: string]: Promise<IPhase<any, any>> | null } = {
    FetchTilesPhase: null,
    ExtractTileFeaturesPhase: null,
    TransformFeaturePhase: null,
    UnifyFeaturesPhase: null,
    CreateGeometryPhase: null,
    CreateFallbackLanduseMeshPhase: null,
    CreateTileNavMeshPhase: null,
    CreateCompleteObjectPhase: null,
    CreateCompleteNavMeshPhase: null,
    CreateLabelPhase: null,
    CreateHelpersPhase: null
  }

  Object.keys(phases).forEach((name: string) => {
    phases[name] = import(`../phases/${name}.ts`)
  })
  defaultPhases.push(
    phases.FetchTilesPhase!,
    phases.ExtractTileFeaturesPhase!,
    phases.UnifyFeaturesPhase!,
    phases.TransformFeaturePhase!,
    phases.CreateGeometryPhase!,
    phases.CreateFallbackLanduseMeshPhase!,
    phases.CreateTileNavMeshPhase!,
    phases.CreateCompleteObjectPhase!,
    phases.CreateCompleteNavMeshPhase!,
    phases.CreateLabelPhase!,
    phases.CreateHelpersPhase!
  )
  phasesNoNavigation.push(
    phases.FetchTilesPhase!,
    phases.ExtractTileFeaturesPhase!,
    phases.UnifyFeaturesPhase!,
    phases.TransformFeaturePhase!,
    phases.CreateGeometryPhase!,
    phases.CreateFallbackLanduseMeshPhase!,
    phases.CreateCompleteObjectPhase!,
    phases.CreateLabelPhase!
  )
}

Object.freeze(defaultPhases)
Object.freeze(phasesNoNavigation)

export async function getPhases(options: { exclude?: FeatureId[] } = {}): Promise<readonly IPhase<any, any>[]> {
  const exclude = options.exclude || []
  return Promise.all(exclude.includes('navigation') ? phasesNoNavigation : defaultPhases)
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
