import assert from 'assert'
import { createTicket, deleteTicket, getTicket, getTicketsAssignment } from '../src/functions'
import { OpenMatchTicket } from '../src/interfaces'
import AbortController from 'abort-controller'
import { waitForTicketAssignment } from './helpers'

const testGameMode = 'tournament'

// TODO: find a way to create empty open match db for this tests
// TODO: find a way to properly test assignments

// this tests use real open match services
describe.skip('open-match frontend service', () => {
  it('creates ticket', async () => {
    const ticket = await createTicket(testGameMode, { tier: 'bronze' })
    assert(ticket.id)

    // cleanup
    await deleteTicket(ticket.id)
  })

  it('gets ticket info after creation', async () => {
    const result = await createTicket(testGameMode, { tier: 'bronze' })
    assert(result.id)

    const ticket = await getTicket(result.id)
    console.log('ticket', ticket)
    assert(ticket?.search_fields)
    assert(ticket.search_fields.string_args)
    assert(ticket.search_fields.string_args['attributes.tier'] === 'bronze')

    // cleanup
    await deleteTicket(result.id)
  })

  it('deletes ticket', async () => {
    const result = await createTicket(testGameMode)
    assert(result.id, 'Ticket creation is failed')
    await deleteTicket(result.id)

    const ticket = await getTicket(result.id)
    assert(!ticket?.id)
  })

  it('throws 404 on reading assignment of not existing ticket', async function () {
    try {
      const a = await getTicketsAssignment('not-a-ticket' + Math.random())
      assert(!a)
    } catch (e) {
      assert(e && e.message.match(/^Ticket id: .* not found$/))
    }
  })

  it('sets assignment', async function () {
    // @ts-ignore
    this.timeout(6000)

    // 1. create enough tickets
    const ticketsPromises: Promise<OpenMatchTicket>[] = []
    for (let i = 0; i < 5; i++) {
      ticketsPromises.push(createTicket(testGameMode))
    }
    const tickets = await Promise.all(ticketsPromises)

    // 2. get assignments promises
    const abortController = new AbortController()
    const assignmentsPromises = tickets.map((ticket) => {
      assert(ticket.id)

      return waitForTicketAssignment(ticket.id!, abortController.signal, 100).then((a) => {
        console.log('assignment for ', ticket.id, a?.connection)
        return a
      })
    })

    // 3. wait for any first assignment
    const assignment = await Promise.race(assignmentsPromises)
    assert(assignment.connection)
  })
})
