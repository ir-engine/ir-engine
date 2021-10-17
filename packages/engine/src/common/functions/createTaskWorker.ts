import { createInlineWorkerFromString } from './createInlineWorkerFromString'
import { isClient } from './isClient'

// TODO: replace this or wrap around something like https://www.npmjs.com/package/workerpool ?

export interface TaskContext {
  onmessage: (msg: MessageEvent) => void
  postResult(result: any, transfer?: Transferable[]): void
}

// TODO figure out how to stringify worker code as part of the build
/**
 * Stringifies a function into a form that can be deserialized in the worker
 */
export function stringifyFunctionBody(
  fn: (...args: any[]) => any,
  dependencies: { [constName: string]: any } = {}
): string {
  const str = fn.toString()
  const openBraceIndex = str.indexOf('{')
  const closeBraceIndex = str.lastIndexOf('}')
  if (openBraceIndex === -1 || closeBraceIndex === -1) {
    throw new Error('Not supported: lamba functions')
  }
  const depEntries = Object.entries(dependencies)
  const depStr =
    depEntries.length > 0
      ? depEntries
          .map(
            ([constName, value]) =>
              `const ${constName} = ${typeof value === 'object' ? JSON.stringify(value) : value.toString()}`
          )
          .join(`;\n`) + `;\n`
      : ''
  const fnBodyStr = str
    .slice(openBraceIndex + 1, closeBraceIndex)
    .replace(/^\s+/, '')
    .replace(/\s+$/, '')

  return `${depStr}${fnBodyStr}`
}

export function createWorkerBody<TaskId, TaskArgs extends any[], TaskResult>(
  messageQueue: MessageEvent[],
  createTaskHandler: () => (...args: TaskArgs) => void,
  getTaskContext: (id: TaskId) => { postResult: (result: TaskResult) => void },
  intervalDuration: number
) {
  return function workerBody() {
    const taskHandler = createTaskHandler()
    let processingQueue = false

    this.onmessage = function (msg: MessageEvent) {
      messageQueue.push(msg)
    }

    setInterval(() => {
      if (processingQueue && messageQueue.length > 0) return

      processingQueue = true
      while (messageQueue.length > 0) {
        const msg = messageQueue.shift()
        const { id, args } = msg!.data
        taskHandler.apply(getTaskContext(id), args)
      }
      processingQueue = false
    }, intervalDuration)
  }
}

export function superviseOnInterval<TaskId, TaskResult>(
  map: Map<TaskId, TaskResult>,
  id: TaskId,
  intervalDuration: number
) {
  const promise = new Promise<TaskResult>((resolve) => {
    const interval = setInterval(() => {
      const result = map.get(id)
      if (result) {
        clearInterval(interval)
        resolve(result)
      }
    }, intervalDuration)
  })
  return promise
}

export async function startTaskLifecycle<TaskId, TaskArgs extends any[], TaskResult>(
  worker: Worker,
  map: Map<TaskId, TaskResult>,
  id: TaskId,
  args: TaskArgs,
  supervise: () => Promise<TaskResult>
) {
  const promise = supervise()
  worker.postMessage({ id, args })
  const result = await promise
  map.delete(id)
  return result
}

export default function createTaskWorker<TaskId, TaskArgs extends any[], TaskResult>(
  createTaskHandler: () => (...args: TaskArgs) => any,
  dependencies: { [constName: string]: any } = {}
) {
  if (isClient) {
    const getTaskContext = (id: TaskId) => ({
      postResult(result: TaskResult, transfer: Transferable[] = []) {
        ;(postMessage as DedicatedWorkerGlobalScope['postMessage'])({ id, result }, transfer)
      }
    })

    const intervalDuration = 200
    const messageQueue = []
    const workerBody = createWorkerBody(messageQueue, createTaskHandler, getTaskContext, intervalDuration)
    const workerBodySourceCode = stringifyFunctionBody(workerBody, {
      ...dependencies,
      messageQueue,
      intervalDuration,
      createTaskHandler,
      getTaskContext
    })

    const worker = createInlineWorkerFromString(workerBodySourceCode)

    const results = new Map<TaskId, TaskResult>()

    worker.onmessage = (msg) => {
      const { id, result } = msg.data
      results.set(id, result)
    }
    return {
      getResult(id: TaskId) {
        return results.get(id)
      },
      postTask(id: TaskId, ...args: TaskArgs) {
        return startTaskLifecycle(worker, results, id, args, () => superviseOnInterval(results, id, 200))
      }
    }
  }
}
