import { TaskStatus } from '../types'
import { ICachingPhase, IPhase, ISyncPhase } from '../types'
import { Store } from './createStore'

export default async function actuateEager(store: Store, phases: readonly IPhase<any, any>[]) {
  const results = []
  let result: any
  for (const phase of phases) {
    // console.log('starting %s', phase.constructor.name)
    const keys = phase.getTaskKeys(store)
    if (phase.isCachingPhase || phase.isAsyncPhase) {
      const promises = []
      let promise: Promise<any>
      for (const key of keys) {
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
