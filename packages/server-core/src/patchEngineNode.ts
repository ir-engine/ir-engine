import { Blob } from 'buffer'
import fetch, { Headers, Request, Response } from 'node-fetch'
import { performance } from 'perf_hooks'

globalThis.fetch = fetch as any
globalThis.Request = Request as any
globalThis.Response = Response as any
globalThis.Headers = Headers as any
globalThis.self = globalThis as Window & typeof globalThis

// this will be added in node 19
if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = (blob) => null!
if (!globalThis.Blob) (globalThis as any).Blob = Blob

const _localStorage = {}
if (!globalThis.localStorage)
  globalThis.localStorage = {
    setItem: (key, val) => {
      _localStorage[key] = val
    },
    getItem: (key) => {
      return _localStorage[key] ?? null
    }
  } as Storage

// patches for headless-gl - currently unused

// patch navigator
if (!globalThis.navigator)
  (globalThis as any).navigator = {
    product: 'NativeScript', // patch axios so it doesnt complain,
    userAgent: 'node'
  }
;(globalThis as any).window = {
  navigator: globalThis.navigator,
  performance
}
