export default function convertFunctionToWorker(fn: (...args: any[]) => any): Worker {
  const workerUrl = URL.createObjectURL(new Blob([fn.toString().slice(12, -1)], { type: 'text/javascript' }))
  return new Worker(workerUrl)
}
