import { TaskStatus } from './Task'

export default abstract class AsyncTask<TaskResult> {
  status = TaskStatus.NOT_STARTED
  abstract start(): Promise<TaskResult>
}
