import fetch, { Headers, Request, Response } from 'node-fetch'

;(globalThis as any).fetch = fetch
;(globalThis as any).Request = Request
;(globalThis as any).Response = Response
;(globalThis as any).Headers = Headers
;(globalThis as any).self = globalThis

// import URL from 'url'
;(globalThis as any).self.URL = URL
