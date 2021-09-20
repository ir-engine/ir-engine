import { TaskStatus } from '../classes/AsyncTask'
import Phase from '../classes/Phase'

export default async function actuateLazy(phases: Phase<any>[]) {
  const promises = []
  for (const phase of phases) {
    // console.log('starting %s', phase.constructor.name)
    const tasks = phase.getTasks()
    if (phase.isCachingPhase || phase.isAsyncPhase) {
      for (const task of tasks) {
        if (task.status === TaskStatus.NOT_STARTED) {
          if (phase.isAsyncPhase) {
            // console.log('starting a %s', task.constructor.name)
            promises.push(task.start())
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
  return await Promise.all(promises)
}
