import * as Comlink from 'comlink'

export default function createWorkerFunction<
  WorkerApi extends { handle: (...args: HandlerArgs) => HandlerResult },
  HandlerArgs extends any[] = Parameters<WorkerApi['handle']>,
  HandlerResult = ReturnType<WorkerApi['handle']>
>(
  worker: Worker
): (...args: { [I in keyof HandlerArgs]: Comlink.UnproxyOrClone<HandlerArgs[I]> }) => Promise<HandlerResult> {
  const api = Comlink.wrap<WorkerApi>(worker)

  return async function workerFunction(...args: { [I in keyof HandlerArgs]: Comlink.UnproxyOrClone<HandlerArgs[I]> }) {
    return (await api.handle(...args)) as Promise<HandlerResult>
  }
}
