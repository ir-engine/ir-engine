import assert from 'assert'
import { createTicket, deleteTicket, getTicket, getTicketsAssignment } from '../src/functions'
import { OpenMatchTicket } from '../src/interfaces'

// const testGameMode = 'mode.battleroyale'
const testGameMode = 'tournament'

// this tests use real open match services
describe('open-match + MSA frontend service', () => {
  it('creates ticket', async () => {
    const ticket = await createTicket(testGameMode)
    assert(ticket.id)
  })

  it('gets ticket info after creation', async () => {
    const result = await createTicket(testGameMode, { tier: 'bronze' })
    assert(result.id)

    const ticket = await getTicket(result.id)
    console.log('ticket', ticket)
    assert(ticket?.search_fields)
    assert(ticket.search_fields.string_args)
    assert(ticket.search_fields.string_args['attributes.tier'] === 'bronze')
  })

  it('creates ticket with attributes', async () => {
    const ticket = await createTicket(testGameMode, { tier: 'bronze' })
    assert(ticket.id)
  })


  // it('deletes ticket', async () => {
  //   const result = await createTicket(testGameMode)
  //   assert(result.id, 'Ticket creation is failed')
  //   await deleteTicket(result.id)
  //
  //   const ticket = await getTicket(result.id)
  //   assert(!ticket?.id)
  // })
  //
  it('sets assignment', async function () {
    // @ts-ignore
    this.timeout(6000)

    const mapTicketToTier = new Map<string, string>()

    // TODO: make a bunch of tickets of random tier from three available, then check that at least one pack is assembled

    // 1. create enough tickets
    const ticketsPromises: Promise<OpenMatchTicket>[] = (['bronze', 'gold', 'bronze', 'gold']).map(tier => {
      return createTicket(testGameMode, { tier: tier })
        .then(ticket => {
          console.log('ticket.id', ticket.id, tier)
          assert(ticket.id)
          mapTicketToTier.set(ticket.id, tier)
          return ticket
        })
      })

    const tickets = await Promise.all(ticketsPromises)

    // 2. get assignments promises
    const assignmentsPromises = tickets.map((ticket) => {
      assert(ticket.id)
      return getTicketsAssignment(ticket.id)
    })

    // wait for at least two assignments, and check that both are bronze
    const assignments = await Promise.all([ assignmentsPromises[0], assignmentsPromises[2] ])
    assert(assignments[0].connection === assignments[1].connection)
  })
})
