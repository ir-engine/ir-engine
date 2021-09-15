import AsyncTask from './AsyncTask'
import CachingPhase from './CachingPhase'

export default abstract class AsyncPhase<
  TaskType extends AsyncTask<TaskResult>,
  TaskKey extends any[],
  TaskResult
> extends CachingPhase<TaskType, TaskKey, TaskResult> {}
