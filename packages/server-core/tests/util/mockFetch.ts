const originalFetch = (global as any).fetch

export const mockFetch = (responseType = 'application/octet-stream', response = Buffer.from('test')) => {
  // override fetch
  ;(global as any).fetch = async (url: string, options?: any) => {
    if (options?.method === 'HEAD') {
      return {
        status: 200,
        headers: new Map().set('content-length', response.byteLength).set('content-type', responseType)
      }
    } else {
      return {
        arrayBuffer: async () => response,
        status: 200,
        headers: new Map().set('content-length', response.byteLength).set('content-type', responseType)
      }
    }
  }
}

export const restoreFetch = () => {
  ;(global as any).fetch = originalFetch
}
