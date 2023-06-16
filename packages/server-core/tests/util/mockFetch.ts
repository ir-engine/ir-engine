const originalFetch = (global as any).fetch

export const mockFetch = (urls: { [url: string]: { contentType: string; response: Buffer } }) => {
  // override fetch
  ;(global as any).fetch = async (url: string, options?: any) => {
    if (!urls[url])
      return {
        status: 404
      }
    if (options?.method === 'HEAD') {
      return {
        status: 200,
        headers: new Map()
          .set('content-length', urls[url].response.byteLength)
          .set('content-type', urls[url].contentType)
      }
    } else {
      return {
        arrayBuffer: async () => urls[url].response,
        status: 200,
        headers: new Map()
          .set('content-length', urls[url].response.byteLength)
          .set('content-type', urls[url].contentType)
      }
    }
  }
}

export const restoreFetch = () => {
  ;(global as any).fetch = originalFetch
}
