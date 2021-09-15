export enum TaskStatus {
  NOT_STARTED = 0,
  STARTED = 1
}

export default abstract class AsyncTask<TaskResult> {
  status = TaskStatus.NOT_STARTED
  abstract start(): Promise<TaskResult>
}
