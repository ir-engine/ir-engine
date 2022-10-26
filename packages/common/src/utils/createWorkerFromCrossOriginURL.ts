/**
 * Wraps a worker in a blob URL to allow it to be referenced from a separate domain (such as an edge cache)
 * Injects process.env so it can be used in the worker context
 * @param {string} path
 * @returns {string}
 */
export const createWorkerFromCrossOriginURL = (path: string, module = true, workerArgs: WorkerOptions = {}) => {
  const data = `globalThis.process = ${JSON.stringify(process)};\n`.concat(
    module ? `import '${path}';` : `importScript('${path}')`
  )

  const workerBlob = new Blob([data], { type: 'text/javascript' })

  const workerBlobUrl = URL.createObjectURL(workerBlob)

  return new Worker(workerBlobUrl, { type: module ? 'module' : 'classic', ...workerArgs })
}
