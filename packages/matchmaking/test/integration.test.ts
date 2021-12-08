import assert from 'assert'
import { createTicket, deleteTicket, getTicket, getTicketsAssignment } from '../src/functions'
import { OpenMatchTicket } from '../src/interfaces'

// const testGameMode = 'mode.battleroyale'
const testGameMode = 'tournament'

// this tests use real open match services
describe.skip('open-match frontend service', () => {
  it('creates ticket', async () => {
    const ticket = await createTicket(testGameMode)
    assert(ticket.id)
  })

  it('gets ticket info after creation', async () => {
    const result = await createTicket(testGameMode)
    assert(result.id)

    const ticket = await getTicket(result.id)
    console.log('ticket', ticket)
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
