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

function get(path): Promise<requestResponse> {
  console.log('get path', path)
  const options = {
    hostname: 'localhost',
    port: 51504,
    path: path,
    method: 'GET'
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
            resolve({ code: res.statusCode, body: JSON.parse(body.toString()) })
            return
        }
        reject('unexpected')
      })
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

it('sets assignment', () => {
  const ticketsPromises: Promise<requestResponse>[] = []
  for (let i = 0; i < 6; i++) {
    const t = createTicket('mode.battleroyale').then((result) => {
      assert(result.code === 200)
      assert(result.body?.id)
      return result
    })
    ticketsPromises.push(t)
  }
  return Promise.all(ticketsPromises).then((tickets) => {
    console.log('tickets', tickets)

    // @ts-ignore
    return getTicketsAssignments(tickets[0].body.id).then((result) => {
      const a = result.body as TicketAssignmentsResponse
      console.log('assignment', a)
      assert(a?.result?.assignment?.connection)
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
  return get(`/v1/frontendservice/tickets/${ticketId}/assignments`)
}
