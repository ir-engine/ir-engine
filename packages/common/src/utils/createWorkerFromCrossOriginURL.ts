export const createWorkerFromCrossOriginURL = async (path: URL | string) => {
  const data = await (await fetch(path)).text()
  const workerBlob = new Blob([data], { type: 'text/javascript' })
  const workerBlobUrl = URL.createObjectURL(workerBlob)
  return workerBlobUrl
}
