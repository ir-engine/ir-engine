export const createInlineWorkerFromString = (str: string) => {
  return new Worker(URL.createObjectURL(new Blob([str], { type: 'text/javascript' })))
}
