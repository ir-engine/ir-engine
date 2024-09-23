import config from '@ir-engine/common/src/config'

export interface APICallOptions {
    path: string
    method: string,
    headers?: object
    body?: object | string
}

export default function (options: APICallOptions) {
    const reqOptions = {
        method: options.method
    }

    if (options.headers) reqOptions.headers = new Headers(options.headers)
    if (options.body) reqOptions.body = options.body
    const req = new Request(`${config.client.serverUrl}/${options.path}`, reqOptions)
    return fetch(req)
}