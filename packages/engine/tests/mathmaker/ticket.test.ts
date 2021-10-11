import assert from 'assert'
import http from 'http'

// TODO: move this to match-maker folder
// TODO: use axios

interface requestResponse {
  code: number | undefined
  body: any
}
function post(path, data): Promise<requestResponse> {
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

function get(path, options = {}, resolveOnFirstData = false): Promise<requestResponse> {
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

// let fsa: FrontendServiceApi
// beforeAll(() => {
//   const ac = new ApiClient()
//   ac.basePath = FRONTEND_API_PATH
//   fsa = new FrontendServiceApi(ac)
// })

it('creates ticket', () => {
  // const tr = new OpenmatchCreateTicketRequest()
  // const t = new OpenmatchTicket()
  // t.searchFields = { tags: ['beta-gameplay'] }
  // tr.ticket = t
  //
  // return new Promise((resolve, reject) => {
  //   fsa.frontendServiceCreateTicket(tr, (resp) => {
  //     console.log('response!', resp)
  //     assert(resp?.ticket?.id)
  //   })
  // })

  return createTicket('mode.battleroyale').then((result) => {
    console.log('result', result)
    assert(result.code === 200)
    assert(result.body?.id)
  })
})

it('gets ticket info after creation', async () => {
  const result = await createTicket('mode.battleroyale')
  console.log('result', result)
  assert(result.code === 200)
  assert(result.body?.id)

  const ticketDataResult = await getTicket(result.body.id)
  console.log('ticketDataResult', ticketDataResult)
})

it('sets assignment', function (done) {
  this.timeout(5000)

  const ticketsPromises: Promise<requestResponse>[] = []
  for (let i = 0; i < 5; i++) {
    const t = createTicket('mode.battleroyale')
    ticketsPromises.push(t)
  }
  Promise.all(ticketsPromises).then((tickets) => {
    console.log('tickets', tickets)

    const assignmentsPromises = tickets.map((ticketResponse) => {
      return getTicketsAssignments(ticketResponse.body.id).then((result) => {
        console.log('result', result)
        const a = result.body as TicketAssignmentsResponse
        console.log('assignment', a)
        return a
      })
      // .catch((e) => {
      //   console.log('failed to get for ', ticketResponse.body.id, ' error:', e)
      // })
    })

    return Promise.race(assignmentsPromises).then((assignmentResponse) => {
      console.log('got assignment', assignmentResponse)
      assert(assignmentResponse?.result?.assignment?.connection)
      done()
    })
  })
  // TicketAssignmentsResponse
})

function createTicket(gameMode) {
  return post('/v1/frontendservice/tickets', {
    ticket: {
      searchFields: {
        tags: [gameMode],
        DoubleArgs: {
          'time.enterqueue': 0
        }
      }
    }
  })
}

interface OpenAPIErrorResponse {
  code: number
  message: string
  details?: [
    {
      type_url: string
      value: string
    }
  ]
}
interface TicketAssignmentsResponse {
  result: {
    assignment: {
      connection: string
      extensions: Record<
        string,
        {
          type_url: string
          value: string
        }
      >
    }
  }
}

// TicketAssignmentsResponse
function getTicketsAssignments(ticketId: string) {
  return get(`/v1/frontendservice/tickets/${ticketId}/assignments`, {}, true)
}

function getTicket(ticketId: string) {
  return get(`/v1/frontendservice/tickets/${ticketId}`)
}
