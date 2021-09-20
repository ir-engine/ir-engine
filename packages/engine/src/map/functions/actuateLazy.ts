import { TaskStatus } from '../classes/AsyncTask'
import Phase from '../classes/Phase'

// TODO be more lazy?
export default async function actuateLazy(phases: Phase<any>[]) {
  for (const phase of phases) {
    // console.log('starting %s', phase.constructor.name)
    const tasks = phase.getTasks()
    if (phase.isCachingPhase || phase.isAsyncPhase) {
      for (const task of tasks) {
        if (task.status === TaskStatus.NOT_STARTED) {
          if (phase.isAsyncPhase) {
            // console.log('starting a %s', task.constructor.name)
            task.start()
          } else {
            // console.log('execing a %s', task.constructor.name)
            task.exec()
          }
          task.status = TaskStatus.STARTED
        }
      }
    } else {
      for (const task of tasks) {
        // console.log('execing a %s', task.constructor.name)
        task.exec()
      }
    }
    phase.cleanup()
  }
}
