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

export default function convertFunctionToWorker(fn: (...args: any[]) => any): Worker {
  const workerUrl = URL.createObjectURL(new Blob([stringifyFunctionBody(fn)], { type: 'text/javascript' }))
  return new Worker(workerUrl)
}
