// to determine if a url string is internal or external
export default function isExternalUrl(url: string): boolean {
  const externalProtocols = ['https://', 'http://', 'data:']
  // if url starts with an external protocol
  return !!externalProtocols.find((protocol: string) => url.startsWith(protocol))
}
