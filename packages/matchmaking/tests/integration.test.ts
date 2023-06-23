/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import AbortController from 'abort-controller'
import assert from 'assert'

import { createTicket, deleteTicket, getTicket, getTicketsAssignment } from '../src/functions'
import { MatchTicketType } from '../src/match-ticket.schema'
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
    assert(ticket?.searchFields)
    assert(ticket.searchFields.stringArgs)
    assert(ticket.searchFields.stringArgs['attributes.tier'] === 'bronze')

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
    const ticketsPromises: Promise<MatchTicketType>[] = []
    for (let i = 0; i < 5; i++) {
      ticketsPromises.push(createTicket(testGameMode))
    }
    const tickets = await Promise.all(ticketsPromises)

    // 2. get assignments promises
    const abortController = new AbortController()
    const assignmentsPromises = tickets.map((ticket) => {
      assert(ticket.id)

      return waitForTicketAssignment(ticket.id!, abortController.signal as any, 100).then((a) => {
        console.log('assignment for ', ticket.id, a?.connection)
        return a
      })
    })

    // 3. wait for any first assignment
    const assignment = await Promise.race(assignmentsPromises)
    assert(assignment.connection)
  })
})
