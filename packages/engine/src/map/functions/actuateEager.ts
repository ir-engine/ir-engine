import { TaskStatus } from '../types'
import { ICachingPhase, IPhase, ISyncPhase } from '../types'
import checkKey from './checkKey'
import { Store } from './createStore'

export default async function actuateEager(store: Store, phases: readonly IPhase<any, any>[]) {
  const results = [] as any[]
  let result: any
  for (const phase of phases) {
    // console.log('starting %s', phase.constructor.name)
    const keys = phase.getTaskKeys(store)
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
        if (phase.getTaskStatus(store, key) === TaskStatus.NOT_STARTED) {
          if (phase.isAsyncPhase) {
            // console.log('starting a %s', task.constructor.name)
            promise = phase.startTask(store, key)
            promises.push(promise)
          } else {
            // console.log('execing a %s', task.constructor.name)
            result = (phase as ICachingPhase<any, any>).execTask(store, key)
            results.push(result)
          }
          ;(phase as ICachingPhase<any, any>).setTaskStatus(store, key, TaskStatus.STARTED)
        }
      }
      results.push(...(await Promise.all(promises)))
    } else {
      for (const key of keys) {
        // console.log('execing a %s', task.constructor.name)
        result = (phase as ISyncPhase<any, any>).execTask(store, key)
        results.push(result)
      }
    }
    phase.cleanup(store)
  }
  return results
}
