import { generateUUID } from 'three/src/math/MathUtils'
import matches from 'ts-matches'

import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { defineAction, dispatchAction } from '@xrengine/hyperflux'

import { matchActionOnce } from '../../networking/functions/matchActionOnce'

export class DependencyTreeActions {
  static dependencyFulfilled = defineAction({
    type: 'xre.assets.DependencyTree.DEPENDENCY_FULFILLED' as const,
    uuid: matches.string
  })
}

const dependencyTree: Map<string, Promise<any>[]> = new Map()
let active = new Map<string, Promise<any>>()

function add(uuid: string, promise?: Promise<any>) {
  if (!dependencyTree.has(uuid)) {
    dependencyTree.set(uuid, [])
  }
  const promises = dependencyTree.get(uuid)!
  if (promise) {
    promises.push(promise)
  }
  const activePromise = Promise.allSettled(promises)
  active.set(uuid, activePromise)
  activePromise.then(() => {
    if (active.get(uuid) === activePromise) {
      dependencyTree.delete(uuid)
      active.delete(uuid)
      dispatchAction(DependencyTreeActions.dependencyFulfilled({ uuid }))
    }
  })
}
export const DependencyTree = {
  add
}
