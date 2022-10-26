export const createWorkerFromCrossOriginURL = async (path: string) => {
  const data = `import '${path}'`
  const workerBlob = new Blob([data], { type: 'text/javascript' })
  const workerBlobUrl = URL.createObjectURL(workerBlob)
  return workerBlobUrl
}
