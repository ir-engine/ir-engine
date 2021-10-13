import assert from 'assert'
import { createTicket, getTicket, getTicketsAssignment } from './functions'
import { OpenMatchTicket } from './interfaces'

it('creates ticket', () => {
  return createTicket('mode.battleroyale').then((result) => {
    console.log('result', result)
    assert(result.id)
  })
})

it('gets ticket info after creation', async () => {
  const result = await createTicket('mode.battleroyale')
  console.log('result', result)
  assert(result.id)

  const ticket = await getTicket(result.id)
  console.log('ticket', ticket)
})

it('sets assignment', async function () {
  this.timeout(5000)

  const ticketsPromises: Promise<OpenMatchTicket>[] = []
  for (let i = 0; i < 5; i++) {
    const t = createTicket('mode.battleroyale')
    ticketsPromises.push(t)
  }

  const tickets = await Promise.all(ticketsPromises)

  console.log('tickets', tickets)

  const assignmentsPromises = tickets.map((ticket) => {
    assert(ticket.id)
    return getTicketsAssignment(ticket.id)
    // .then((assignment) => {
    //   console.log('assignment', assignment)
    //   return assignment
    // })
  })

  const assignment = await Promise.race(assignmentsPromises)
  console.log('got assignment', assignment)
  assert(assignment.connection)
})
