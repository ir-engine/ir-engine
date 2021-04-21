import type { Worker } from 'worker_threads'

export const wrapNodeWorker = (worker: Worker): any => {
  worker.on('message', (data) => {
    //@ts-ignore
    if(worker.onmessage) {
      //@ts-ignore
      worker.onmessage(data);
    }
  })
  worker.on('messageerror', (data) => {
    //@ts-ignore
    if(worker.onmessageerror) {
      //@ts-ignore
      worker.onmessageerror(data);
    }
  })
  worker.on('error', (data) => {
    //@ts-ignore
    if(worker.onerror) {
      //@ts-ignore
      worker.onerror(data);
    }
  })
  //@ts-ignore
  worker.addEventListener = worker.addListener;
  //@ts-ignore
  worker.removeEventListener = worker.removeListener;
  //@ts-ignore
  worker.dispatchEvent = (ev) => worker.emit(ev.type, ev);
  //@ts-ignore
  return worker;
}