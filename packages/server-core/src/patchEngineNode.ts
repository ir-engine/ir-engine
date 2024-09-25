import 'jsdom-global/register'

import { Blob } from 'buffer'

import fetch, { Headers, Request, Response } from 'node-fetch'

globalThis.fetch = fetch as any
globalThis.Request = Request as any
globalThis.Response = Response as any
globalThis.Headers = Headers as any

globalThis.self = globalThis as Window & typeof globalThis

if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = (blob) => null!
if (!globalThis.Blob) (globalThis as any).Blob = Blob
