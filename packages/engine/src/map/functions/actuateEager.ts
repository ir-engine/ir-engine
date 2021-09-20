import { TaskStatus } from '../classes/Task'
import Phase from '../classes/Phase'

export default async function actuateEager(phases: Phase<any>[]): Promise<any[]> {
  const results = []
  for (const phase of phases) {
    // console.log('starting %s', phase.constructor.name)
    const promises = []
    const tasks = phase.getTasks()
    if (phase.isCachingPhase || phase.isAsyncPhase) {
      for (const task of tasks) {
        if (task.status === TaskStatus.NOT_STARTED) {
          if (phase.isAsyncPhase) {
            // console.log('starting a %s', task.constructor.name)
            promises.push(task.start())
          } else {
            // console.log('execing a %s', task.constructor.name)
            results.push(task.exec())
          }
          task.status = TaskStatus.STARTED
        }
      }
      results.concat(await Promise.all(promises))
    } else {
      for (const task of tasks) {
        // console.log('execing a %s', task.constructor.name)
        results.push(task.exec())
      }
    }
    phase.cleanup()
  }
  return results
}
