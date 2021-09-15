export default abstract class Task<TaskResult> {
  abstract exec(): TaskResult
}
