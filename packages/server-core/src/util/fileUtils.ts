export const getContentType = (url: string) => {
  if (/.glb$/.test(url) === true) return 'glb'
  if (/.jpeg$/.test(url) === true) return 'jpeg'
  if (/.json$/.test(url) === true) return 'json'
  if (/.ts$/.test(url) === true) return 'ts'
  if (/.tsx$/.test(url) === true) return 'tsx'
  return 'octet-stream'
}
