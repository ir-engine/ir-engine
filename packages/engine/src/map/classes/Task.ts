export enum TaskStatus {
  NOT_STARTED = 0,
  STARTED = 1
}

export default abstract class Task<TaskResult> {
  status = TaskStatus.NOT_STARTED
  abstract exec(): TaskResult
}
