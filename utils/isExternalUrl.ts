// to determine if a url string is internal or external
const isExternalUrl = (url: string): boolean => {
  const externalProtocols = ['https://', 'http://', 'data:']
  // if url starts with an external protocol
  const isExternal = !!externalProtocols.find((protocol: string) => url.startsWith(protocol))
  return isExternal
}
export default isExternalUrl
