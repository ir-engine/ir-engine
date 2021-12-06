import assert from 'assert'
import { createTicket, deleteTicket, getTicket, getTicketsAssignment } from '../src/functions'
import { OpenMatchTicket } from '../src/interfaces'

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
    const assignmentsPromises = tickets.map((ticket) => {
      assert(ticket.id)
      return getTicketsAssignment(ticket.id)
    })

    // 3. wait for any first assignment
    const assignment = await Promise.race(assignmentsPromises)
    assert(assignment.connection)
  })
})
