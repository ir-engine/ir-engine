import { createInlineWorkerFromString } from './createInlineWorkerFromString'
import { isClient } from './isClient'

interface Options {
  onmessage: (msg: MessageEvent) => void
}

/**
 * Stringifies a function into a form that can be deserialized in the worker
 */
export function stringifyFunctionBody(fn: (...args: any[]) => any): string {
  const str = fn.toString()
  const openBraceIndex = str.indexOf('{')
  const closeBraceIndex = str.lastIndexOf('}')
  if (openBraceIndex === -1 || closeBraceIndex === -1) {
    throw new Error('Not supported: lamba functions')
  }
  return str
    .slice(openBraceIndex + 1, closeBraceIndex)
    .replace(/^\s+/, '')
    .replace(/\s+$/, '')
}

export default function createWorker<MessageData>(sourceFn: (...args: any[]) => any, options: Options) {
  if (isClient) {
    const worker = createInlineWorkerFromString(stringifyFunctionBody(sourceFn))
    worker.onmessage = options.onmessage
    return {
      postMessage(message: MessageEvent<MessageData>, transfer: Transferable[]) {
        worker.postMessage(message, transfer)
      }
    }
  }
}
