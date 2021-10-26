import assert from 'assert'
import { createTicket, deleteTicket, getTicket, getTicketsAssignment } from '../src/functions'
import { OpenMatchTicket } from '../src/interfaces'

describe('frontend service', () => {
  it('creates ticket', async () => {
    const ticket = await createTicket('mode.battleroyale')
    assert(ticket.id)
  })

  it('gets ticket info after creation', async () => {
    const result = await createTicket('mode.battleroyale')
    assert(result.id)

    const ticket = await getTicket(result.id)
    console.log('ticket', ticket)
  })

  it('deletes ticket', async () => {
    const result = await createTicket('mode.battleroyale')
    const deleteResult = await deleteTicket(result.id)

    try {
      const ticket = await getTicket(result.id)
      assert(!ticket?.id)
    } catch (e) {
      assert(e.isAxiosError)
      assert(e.response.status && e.response.status === 404)
    }
  })

  it('sets assignment', async function () {
    this.timeout(6000)

    // 1. create enough tickets
    const ticketsPromises: Promise<OpenMatchTicket>[] = []
    for (let i = 0; i < 5; i++) {
      ticketsPromises.push(createTicket('mode.battleroyale'))
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
