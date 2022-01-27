import assert from 'assert'
import app from '@xrengine/server/src/app'
import nock from 'nock'
import {
  createTicket,
  deleteTicket,
  FRONTEND_SERVICE_URL,
  getTicket,
  getTicketsAssignment
} from '@xrengine/matchmaking/src/functions'
import { v1 } from 'uuid'

describe('matchmaking services', () => {
  let scope: nock.Scope
  let user1, user2
  let apiKey
  let params: any = {}
  before(async () => {
    scope = nock(FRONTEND_SERVICE_URL)
    await app.setup()

    user1 = await app.service('user').create({
      name: 'Test #' + Math.random(),
      userRole: 'guest'
    })
    user2 = await app.service('user').create({
      name: 'Test #' + Math.random(),
      userRole: 'guest'
    })

    // // @ts-ignore
    // const newProvider = await app.service('identity-provider').create({
    //   type: 'guest',
    //   token: v1()
    // })
    // let accessToken = newProvider.accessToken
    // console.log('provider', newProvider)
    // console.log('provider, newProvider.userId', newProvider.userId)

    console.log('created user1', user1.id)
    console.log('created user2', user2.id)
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
  })
  after(async () => {
    if (user1?.id) {
      await app.service('user').remove(user1.id)
    }
    if (user2?.id) {
      await app.service('user').remove(user2.id)
    }
  })
  afterEach(() => {
    nock.cleanAll()
  })
  const ipAddress = '127.0.0.1'
  const port = '3031'
  const locationId = 'game-test'
  const gamemode = 'msa-private'
  const tier = 'bronze'

  const connection = Math.random().toString(16)
  const assignmentReplyBody = {
    result: {
      assignment: {
        connection
      }
    }
  }

  it('assigns players to one server', async () => {
    scope
      .post('/tickets')
      .times(2)
      .reply(200, () => {
        return { id: Math.random().toString() }
      })
    const ticketsService = app.service('match-ticket')
    const assignmentService = app.service('match-ticket-assignment')

    const userParams1 = { user: user1 }
    const userParams2 = { user: user2 }

    const ticket1r = await ticketsService.create({ gamemode, attributes: { tier } }, userParams1)
    const ticket2r = await ticketsService.create({ gamemode, attributes: { tier } }, userParams2)
    const ticket1 = Array.isArray(ticket1r) ? ticket1r[0] : ticket1r
    const ticket2 = Array.isArray(ticket2r) ? ticket2r[0] : ticket2r

    scope.get(`/tickets/${ticket1.id}/assignments`).reply(200, assignmentReplyBody)
    scope.get(`/tickets/${ticket2.id}/assignments`).reply(200, assignmentReplyBody)

    // made with promise all to make both request work simultaneously
    const [assignment1, assignment2] = await Promise.all([
      assignmentService.get(ticket1.id, { 'identity-provider': { userId: user1.id } }),
      assignmentService.get(ticket2.id, { 'identity-provider': { userId: user2.id } })
    ])

    // test cleanup, delete tickets
    if (ticket1.id) {
      scope.delete('/tickets/' + ticket1.id).reply(200, { id: ticket1.id })
      await ticketsService.remove(ticket1.id)
    }
    if (ticket2.id) {
      scope.delete('/tickets/' + ticket2.id).reply(200, { id: ticket2.id })
      await ticketsService.remove(ticket2.id)
    }

    const matchInstance = await app.service('match-instance').find({
      query: {
        connection: connection
        // ended: false
      }
    })
    assert(Array.isArray(matchInstance))
    console.log(matchInstance.length)
    assert(matchInstance.length === 1)

    // test cleanup
    await app.service('match-instance').remove(matchInstance[0].id)

    const gameServerInstance = await app.service('instance').get(matchInstance[0].gameserver)
    assert(gameServerInstance)
    assert(!gameServerInstance.ended)
  })
})
