import assert from 'assert'
import { createTicket, deleteTicket, getTicket, getTicketsAssignment } from '../src/functions'
import { OpenMatchTicket, OpenMatchTicketAssignment } from '../src/interfaces'

const testGameMode = 'msa-private'

// this tests use real open match services
// TODO: rewrite it to interval version
// describe('open-match + MSA frontend service', () => {
//   // TODO: unfinished
//   it('sets assignment', async function () {
//     // @ts-ignore
//     this.timeout(6000)
//
//     const mapTicketToTier = new Map<string, string>()
//
//     // TODO: make a bunch of tickets of random tier from three available, then check that at least one pack is assembled
//
//     // 1. create enough tickets
//     const ticketsPromises: Promise<OpenMatchTicket>[] = (['bronze', 'gold', 'bronze', 'gold']).map(tier => {
//       return createTicket(testGameMode, { tier: tier })
//         .then(ticket => {
//           console.log('ticket.id', ticket.id, tier)
//           assert(ticket.id)
//           mapTicketToTier.set(ticket.id, tier)
//           return ticket
//         })
//       })
//
//     const tickets = await Promise.all(ticketsPromises)
//
//     // 2. get assignments promises
//     const assignmentsPromises = tickets.map((ticket) => {
//       assert(ticket.id)
//
//       const checkForAssignmentPeriodically = (id:string, period:number, timeout:number) => {
//         setTimeout
//       }
//
//       return new Promise<OpenMatchTicketAssignment>((resolve, reject) => {
//
//         getTicketsAssignment(ticket.id!).then(a => {
//           console.log('assignment for ', ticket.id, a?.connection)
//           return a
//         })
//       })
//     })
//
//     // wait for at least two assignments, and check that both are bronze
//     const assignments = await Promise.all([ assignmentsPromises[0], assignmentsPromises[2] ])
//     assert(assignments[0].connection === assignments[1].connection)
//   })
// })
