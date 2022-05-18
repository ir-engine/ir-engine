import { TaskStatus } from '../types'
import { ICachingPhase, IPhase, ISyncPhase } from '../types'
import checkKey from './checkKey'
import { Store } from './createStore'

// TODO be more lazy?
export default function actuateLazy(store: Store, phases: readonly IPhase<any, any>[]) {
  for (const phase of phases) {
    // console.log('starting %s', phase.constructor.name)
    const keys = phase.getTaskKeys(store)
    if (process.env.NODE_ENV === 'development') {
      if (!keys[Symbol.iterator]) {
        throw new Error('task keys are not iterable!')
      }
    }
    if (phase.isCachingPhase || phase.isAsyncPhase) {
      for (const key of keys) {
        if (process.env.NODE_ENV === 'development') {
          checkKey(key)
        }
        if (phase.getTaskStatus(store, key) === TaskStatus.NOT_STARTED) {
          if (phase.isAsyncPhase) {
            // console.log('starting a %s', task.constructor.name)
            // TODO need to be able to cancel tasks that are no longer needed
            phase.startTask(store, key)
          } else {
            // console.log('execing a %s', task.constructor.name)
            ;(phase as ICachingPhase<any, any>).execTask(store, key)
          }
          ;(phase as ICachingPhase<any, any>).setTaskStatus(store, key, TaskStatus.STARTED)
        }
      }
    } else {
      for (const key of keys) {
        // console.log('execing a %s', task.constructor.name)
        ;(phase as ISyncPhase<any, any>).execTask(store, key)
      }
    }
    phase.cleanup(store)
  }
}
