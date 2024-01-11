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

import { matchUserPath } from '@etherealengine/common/src/schemas/matchmaking/match-user.schema'
import { MatchTicketAssignmentType } from '@etherealengine/matchmaking/src/match-ticket-assignment.schema'
import { MatchTicketType } from '@etherealengine/matchmaking/src/match-ticket.schema'

async function waitAndGetMatchUser(app, ticketId, userId, timeout) {
  return new Promise<any>((resolve, reject) => {
    setTimeout(async () => {
      const matchUserResult = await app.service(matchUserPath).find({
        query: {
          ticketId,
          userId
        }
      })
      if (Array.isArray(matchUserResult) || matchUserResult.data.length === 0) {
        resolve(null)
        return
      }

      resolve(matchUserResult.data[0])
    }, timeout)
  })
}

export async function emulate_createTicket(gameMode: string): Promise<MatchTicketType> {
  return { id: Math.random().toString(), searchFields: { tags: [gameMode] } } as MatchTicketType
}

export async function emulate_getTicket(app, ticketId, userId): Promise<MatchTicketType | void> {
  const matchUserResult = await app.service(matchUserPath).find({
    query: {
      ticketId,
      userId
    }
  })
  if (Array.isArray(matchUserResult) || matchUserResult.data.length === 0) {
    return
  }
  const matchUser = matchUserResult.data[0]

  return {
    id: ticketId,
    searchFields: {
      tags: [matchUser.gameMode]
    }
  }
}

export async function emulate_getTicketsAssignment(app, ticketId, userId): Promise<MatchTicketAssignmentType> {
  // emulate response from open-match-api
  const matchUser = await waitAndGetMatchUser(app, ticketId, userId, 50)

  if (!matchUser) {
    // throw new BadRequest('MatchUser not found. ticket is outdated?')
    // FIXME: not a valid Error format
    throw { code: 5, message: `Ticket id: ${ticketId} not found` }
  }

  const connection = Math.random().toString()
  await app.service(matchUserPath).patch(matchUser.id, {
    connection
  })

  return new Promise<MatchTicketAssignmentType>((resolve, reject) => {
    setTimeout(async () => {
      try {
        await app.service(matchUserPath).get(matchUser.id)
      } catch (e) {
        reject({ code: 5, message: `Ticket id: ${ticketId} not found` })
      }

      const assignment: MatchTicketAssignmentType = {
        connection: connection,
        extensions: {
          GameMode: { typeUrl: '', value: matchUser.gameMode }
        }
      }

      resolve(assignment)
    }, 2000)
  })
}
