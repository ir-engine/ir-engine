import { TaskStatus } from '../classes/AsyncTask'
import Phase from '../classes/Phase'

export default function startAvailableTasks(phases: Phase<any>[]) {
  for (const phase of phases) {
    const tasks = phase.getTasks()
    if (phase.isCachingPhase) {
      for (const task of tasks) {
        if (task.status === TaskStatus.NOT_STARTED) {
          task.start()
          task.status = TaskStatus.STARTED
        }
      }
    } else {
      for (const task of tasks) {
        task.exec()
      }
    }
    phase.cleanup()
  }
}
