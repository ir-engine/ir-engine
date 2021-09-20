import createUsingCache from '../functions/createUsingCache'
import ArrayKeyedMap from './ArrayKeyedMap'
import AsyncTask from './AsyncTask'
import MapCache from './MapCache'
import { IPhase } from './Phase'
import Task from './Task'

export default abstract class CachingPhase<
  TaskType extends Task<TaskResult> | AsyncTask<TaskResult>,
  TaskKey extends any[],
  TaskResult
> implements IPhase<TaskType>
{
  isCachingPhase = true
  isAsyncPhase = false
  abstract taskMap: ArrayKeyedMap<TaskKey, TaskType>
  abstract getTaskKeys(): Iterable<TaskKey>
  abstract createTask(...args: TaskKey): TaskType
  abstract cache: MapCache<TaskKey, TaskResult>
  abstract cleanupCacheItem(value: TaskResult): void
  *getTasks(): Iterable<TaskType> {
    const createTaskUsingCache = createUsingCache(this.createTask.bind(this))
    for (const taskArgs of this.getTaskKeys()) {
      const task = createTaskUsingCache(this.taskMap, taskArgs)
      yield task
    }
  }
  cleanup() {
    for (const [key, value] of this.cache.evictLeastRecentlyUsedItems()) {
      this.taskMap.delete(key)
      this.cleanupCacheItem(value)
    }
  }
}
