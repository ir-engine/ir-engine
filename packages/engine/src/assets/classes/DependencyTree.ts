import { generateUUID } from 'three/src/math/MathUtils'
import matches from 'ts-matches'

import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { defineAction, dispatchAction } from '@xrengine/hyperflux'

import { matchActionOnce } from '../../networking/functions/matchActionOnce'

export class DependencyTreeActions {
  static dependencyFulfilled = defineAction({
    type: 'DEPENDENCY_FULFILLED' as const,
    uuid: matches.string
  })
}

const dependencyTree: Map<string, Promise<any>[]> = new Map()
let active = false

function add(uuid: string, promise?: Promise<any>) {
  if (!dependencyTree.has(uuid)) dependencyTree.set(uuid, [])
  if (promise) {
    const promises = dependencyTree.get(uuid)!
    promises.push(promise)
  }
}

function activate() {
  if (active) {
    throw Error('Depenency Tree is already active')
  }
  active = true
  Promise.allSettled(
    [...dependencyTree.entries()].map(([uuid, promises]) => {
      return Promise.allSettled(promises).then(() => {
        dependencyTree.delete(uuid)
        dispatchAction(DependencyTreeActions.dependencyFulfilled({ uuid }))
        console.log('Dependencies fulfilled for entity node ' + uuid)
      })
    })
  ).then(() => {
    console.log('All dependencies fulfilled')
    active = false
  })
}

export const DependencyTree = {
  activate,
  add
}
