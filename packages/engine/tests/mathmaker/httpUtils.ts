import http from 'http'

// TODO: move this to match-maker folder
// TODO: use axios

export interface requestResponse {
  code: number | undefined
  body: unknown
}

export function post(path, data): Promise<requestResponse> {
  const postData = JSON.stringify(data)
  const options = {
    hostname: 'localhost',
    port: 51504,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  }

  return new Promise<requestResponse>((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log(`statusCode: ${res.statusCode}`)

      const chunks: Uint8Array[] = []
      res.on('data', (data) => chunks.push(data))
      res.on('end', () => {
        let body = Buffer.concat(chunks)
        switch (res.headers['content-type']) {
          case 'application/json':
            // @ts-ignore
            resolve({ code: res.statusCode, body: JSON.parse(body) })
            break
        }
        reject('unexpected')
      })
    })

    req.on('error', reject)

    req.write(postData)
    req.end()
  })
}

export function get(path, options = {}, resolveOnFirstData = false): Promise<requestResponse> {
  console.log('get path', path)
  const defaultOptions = {
    hostname: 'localhost',
    port: 51504,
    path: path,
    method: 'GET'
  }
  const _options = Object.assign({}, defaultOptions, options)

  return new Promise<requestResponse>((resolve, reject) => {
    const req = http.request(_options, (res) => {
      console.log(`statusCode: ${res.statusCode}`)

      const chunks: Uint8Array[] = []
      const onRequestEnd = () => {
        console.log('on request end', path)
        let body = Buffer.concat(chunks)
        console.log('body.type', res.headers['content-type'])
        console.log('body', body.toString())
        switch (res.headers['content-type']) {
          case 'application/json':
            resolve({ code: res.statusCode, body: JSON.parse(body.toString()) })
            return
        }
        reject(`unexpected content type: ${res.headers['content-type']}, body: ${body.toString()}`)
      }

      res.on('data', (data) => {
        console.log('data', data)
        chunks.push(data)
        if (resolveOnFirstData) {
          console.log('destroy')
          res.destroy()
        }
      })
      res.on('close', onRequestEnd)
      res.on('end', onRequestEnd)

      // setTimeout(() => {
      //   res.destroy(new Error('timeout!'))
      // }, 2000)
    })

    req.on('error', reject)
    req.end()
  })
}
