import config from '@ir-engine/common/src/config'

export interface APICallOptions {
  path: string
  method: string
  headers?: HeadersInit
  body?: object | string
}

export default function (options: APICallOptions) {
  const reqOptions = {
    method: options.method
  } as any

  if (options.headers) reqOptions.headers = new Headers(options.headers)
  if (options.body) reqOptions.body = options.body
  const req = new Request(`${config.client.serverUrl}/${options.path}`, reqOptions)
  return fetch(req)
}
