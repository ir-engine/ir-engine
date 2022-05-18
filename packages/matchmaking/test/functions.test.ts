import assert from 'assert'
import nock from 'nock'

import { createTicket, deleteTicket, FRONTEND_SERVICE_URL, getTicket, getTicketsAssignment } from '../src/functions'

describe('match maker functions', () => {
  const scope = nock(FRONTEND_SERVICE_URL)

  afterEach(() => {
    // clean all interceptors
    nock.cleanAll()
  })

  describe('create ticket', () => {
    it('usual call', async () => {
      scope.post('/tickets').reply(200, { id: '123' })

      const ticket = await createTicket('mode.battleroyale')
      // Assert that the expected request was made.
      scope.done()
      assert(ticket.id && ticket.id === '123')
    })

    it('throws on api error', async () => {
      const errorBody = { code: '123', message: 'api error' }
      scope.post('/tickets').reply(200, errorBody)

      await assert.rejects(
        async () => {
          await createTicket('mode.battleroyale')
        },
        { message: errorBody.message }
      )
    })

    it('throws on network/server error', async () => {
      scope.post('/tickets').reply(500, 'any message')

      await assert.rejects(async () => {
        await createTicket('mode.battleroyale')
      }, Error)
    })
  })

  describe('getTicket', () => {
    it('usual', async () => {
      const ticketId = '23414'
      scope.get(/\/tickets\//).reply(200, { id: ticketId })
      const ticket = await getTicket(ticketId)
      scope.done()
      assert(ticket)
      assert(ticket.id === ticketId)
    })

    it('returns empty on 404', async () => {
      const ticketId = '23414'
      scope.get(/\/tickets\//).reply(200, { id: ticketId })
      const ticket = await getTicket(ticketId)
      scope.done()
      assert(ticket)
      assert(ticket.id === ticketId)
    })

    it('throws on api error', async () => {
      const errorBody = { code: '123', message: 'api error' }
      scope.get(/\/tickets\//).reply(200, errorBody)

      await assert.rejects(
        async () => {
          await getTicket('123')
        },
        { message: errorBody.message }
      )
    })

    it('throws on network/server error', async () => {
      const errorMessage = 'something awful happened'
      scope.get(/\/tickets\//).replyWithError(errorMessage)

      await assert.rejects(
        async () => {
          await getTicket('123')
        },
        { message: errorMessage }
      )
    })
  })

  describe('deleteTicket', () => {
    it('usual', async () => {
      const ticketId = '23414'
      scope.delete('/tickets/' + ticketId).reply(200, { id: ticketId })
      await deleteTicket(ticketId)
      scope.done()
    })

    it('throws on api error', async () => {
      const errorBody = { code: '123', message: 'api error' }
      scope.delete(/\/tickets\//).reply(200, errorBody)

      await assert.rejects(
        async () => {
          await deleteTicket('123')
        },
        { message: errorBody.message }
      )
    })

    it('throws on network/server error', async () => {
      const errorMessage = 'something awful happened'
      scope.delete(/\/tickets\//).replyWithError(errorMessage)

      await assert.rejects(
        async () => {
          await deleteTicket('123')
        },
        { message: errorMessage }
      )
    })
  })
  describe('getTicketAssignment', () => {
    const ticketId = '123'
    const connection = '321'
    const url = `/tickets/${ticketId}/assignments`
    const replyBody = {
      result: {
        assignment: {
          connection
        }
      }
    }
    it('usual', async () => {
      scope.get(url).reply(200, replyBody)
      const assignment = await getTicketsAssignment(ticketId)
      assert.strictEqual(assignment.connection, connection)
    })

    it('throws on api error', async () => {
      const errorBody = { code: '123', message: 'api error' }
      scope.get(/\/tickets\//).reply(200, errorBody)

      await assert.rejects(
        async () => {
          await getTicketsAssignment(ticketId)
        },
        { message: errorBody.message }
      )
    })

    it('throws on network/server error', async () => {
      const errorMessage = 'something awful happened'
      scope.get(/\/tickets\//).replyWithError(errorMessage)

      await assert.rejects(
        async () => {
          await getTicketsAssignment(ticketId)
        },
        { message: errorMessage }
      )
    })
  })
})
