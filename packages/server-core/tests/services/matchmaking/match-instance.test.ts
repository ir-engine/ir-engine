import assert from 'assert'
import app from '@xrengine/server/src/app'
import nock from 'nock'
import { FRONTEND_SERVICE_URL } from '@xrengine/matchmaking/src/functions'
import type { OpenMatchTicket } from '@xrengine/matchmaking/src/interfaces'

interface User {
  id: string
}

interface ticketsTestData {
  id: string
  ticket: OpenMatchTicket
  connection: string
  user: User
}

describe('matchmaking match-instance service', () => {
  let scope: nock.Scope
  const ticketsNumber = 3
  const users: User[] = []
  const tickets: ticketsTestData[] = []
  const gamemode = 'msa-private'
  const tier = 'bronze'

  const connections = [Math.random().toString(16), Math.random().toString(16)]
  const emptyAssignmentReplyBody = {
    result: {
      assignment: {
        connection: ''
      }
    }
  }

  before(async () => {
    scope = nock(FRONTEND_SERVICE_URL)
    await app.setup()

    const ticketsService = app.service('match-ticket')

    scope
      .post('/tickets')
      .times(connections.length * ticketsNumber)
      .reply(200, () => {
        return { id: 'tst' + Math.random().toString() }
      })

    const usersPromises: Promise<any>[] = []
    const ticketsPromises: Promise<any>[] = []
    connections.forEach((connection) => {
      for (let i = 0; i < ticketsNumber; i++) {
        const userPromise = app.service('user').create({
          name: 'Test #' + Math.random(),
          userRole: 'guest'
        })
        usersPromises.push(userPromise)

        userPromise.then((user) => {
          ticketsPromises.push(
            ticketsService.create({ gamemode, attributes: { tier } }, { user }).then((ticketResponse) => {
              const ticket = Array.isArray(ticketResponse) ? ticketResponse[0] : ticketResponse
              return {
                id: ticket.id,
                ticket: ticket,
                connection: connection,
                user: user
              }
            })
          )
        })
      }
    })
    users.push(...(await Promise.all(usersPromises)))

    // apiKey = await app.service('user-api-key').create({
    //     userId: user.id
    // })
    //
    // apiKey = await app.service('user-api-key').find({
    //   query: {
    //     userId: user.id
    //   }
    // })
    // console.log('api key', apiKey)
    // params.headers = { authorization: apiKey + ' ' + user.id }

    tickets.push(...(await Promise.all(ticketsPromises)))
  })

  after(async () => {
    const cleanupPromises: Promise<any>[] = []

    // delete tickets
    tickets.forEach((ticket) => {
      if (!ticket?.id) return
      scope.delete('/tickets/' + ticket.id).reply(200, { id: ticket.id })
      cleanupPromises.push(app.service('match-ticket').remove(ticket.id))
    })
    tickets.length = 0

    users.map((user) => {
      cleanupPromises.push(app.service('user').remove(user.id))
    })
    users.length = 0

    await Promise.all(cleanupPromises)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('assigns players to one server', async () => {
    const assignmentService = app.service('match-ticket-assignment')
    const connection = connections[0]
    const connectionTickets = tickets.filter((t) => t.connection === connection)

    connectionTickets.forEach((ticket) => {
      scope
        .get(`/tickets/${ticket.id}/assignments`)
        .reply(200, { result: { assignment: { connection: ticket.connection } } })
    })

    // made with promise all to make all request work asynchronous
    const assignments = await Promise.all(
      connectionTickets.map((ticket, index) => {
        return assignmentService.get(ticket.id, { 'identity-provider': { userId: ticket.user.id } })
      })
    )

    const matchInstance = await app.service('match-instance').find({
      query: {
        connection: connection
        // ended: false
      }
    })
    assert(Array.isArray(matchInstance))
    assert(matchInstance.length === 1)

    // test cleanup
    await app.service('match-instance').remove(matchInstance[0].id)

    const gameServerInstance = await app.service('instance').get(matchInstance[0].gameserver)
    assert(gameServerInstance)
    assert(!gameServerInstance.ended)

    // just in case, check that assignments have instance id and location name
    // it should be set in one of hooks
    assert((assignments[0] as any).instanceId)
    assert((assignments[0] as any).locationName)

    // cleanup created instance
    await app.service('instance').remove(gameServerInstance.id)
  })

  // it will create null:null instance server on localhost for second match
  it('assigns two packs of players to different servers', async () => {
    const assignmentService = app.service('match-ticket-assignment')

    tickets.forEach((ticket) => {
      scope
        .get(`/tickets/${ticket.id}/assignments`)
        .reply(200, { result: { assignment: { connection: ticket.connection } } })
    })

    // made with promise all to make all request work asynchronous
    await Promise.all(
      tickets.map((ticket, index) => {
        return assignmentService.get(ticket.id, { 'identity-provider': { userId: ticket.user.id } })
      })
    )

    const matchInstance = await app.service('match-instance').find({
      query: {
        connection: {
          $in: connections
        }
      }
    })
    assert(Array.isArray(matchInstance))
    assert(matchInstance.length === connections.length)

    // test cleanup
    await Promise.all(matchInstance.map((mi) => app.service('match-instance').remove(mi.id)))
    await Promise.all(matchInstance.map((mi) => app.service('instance').remove(mi.gameserver)))
  })

  it('does not assign players if match is not found', async () => {
    const assignmentService = app.service('match-ticket-assignment')

    tickets.forEach((ticket) => {
      scope.get(`/tickets/${ticket.id}/assignments`).reply(200, emptyAssignmentReplyBody)
    })

    // made with promise all to make all request work asynchronous
    await Promise.all(
      tickets.map((ticket, index) => {
        return assignmentService.get(ticket.id, { 'identity-provider': { userId: users[index].id } })
      })
    )

    const matchInstance = await app.service('match-instance').find({
      query: {
        connection: ''
      }
    })
    assert(Array.isArray(matchInstance))
    assert(matchInstance.length === 0)
  })
})
