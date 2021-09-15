export interface IPhase<TaskType> {
  isCachingPhase: boolean
  getTasks(): Iterable<TaskType>
  cleanup(): void
}

export default abstract class Phase<TaskType> implements IPhase<TaskType> {
  isCachingPhase = false
  abstract getTasks(): Iterable<TaskType>
  abstract cleanup(): void
}
