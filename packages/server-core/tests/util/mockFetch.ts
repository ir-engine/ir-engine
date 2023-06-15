const originalFetch = (global as any).fetch

export const mockFetch = (responseType = 'application/octet-stream') => {
  // override fetch
  ;(global as any).fetch = async (url: string, options?: any) => {
    if (options?.method === 'HEAD') {
      return {
        status: 200,
        headers: new Map().set('content-length', '4').set('content-type', responseType)
      }
    } else {
      return {
        arrayBuffer: async () => Buffer.from('test'),
        status: 200,
        headers: new Map().set('content-length', '6').set('content-type', responseType)
      }
    }
  }
}

export const restoreFetch = () => {
  ;(global as any).fetch = originalFetch
}
