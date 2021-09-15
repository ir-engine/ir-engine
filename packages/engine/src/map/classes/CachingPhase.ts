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
  abstract getTaskKeys(): Iterable<TaskKey>
  abstract createTask(...args: TaskKey): TaskType
  abstract cache: MapCache<TaskKey, TaskResult>
  taskMap = new ArrayKeyedMap<TaskKey, TaskType>();
  *getTasks(): Iterable<TaskType> {
    const createTaskUsingCache = createUsingCache(this.createTask)
    for (const createArgs of this.getTaskKeys()) {
      yield createTaskUsingCache(this.taskMap, createArgs)
    }
  }
  cleanup() {
    for (const keyArgs of this.cache.evictLeastRecentlyUsedItems()) this.taskMap.delete(keyArgs)
  }
}
