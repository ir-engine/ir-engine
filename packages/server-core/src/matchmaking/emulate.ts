import { BadRequest } from '@feathersjs/errors'
import { OpenAPIErrorResponse, OpenMatchTicket, OpenMatchTicketAssignment } from '@xrengine/matchmaking/src/interfaces'
import { getTicket } from '@xrengine/matchmaking/src/functions'

async function waitAndGetMatchUser(app, ticketId, userId, timeout) {
  return new Promise<any>((resolve, reject) => {
    setTimeout(async () => {
      const matchUserResult = await app.service('match-user').find({
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

export async function emulate_createTicket(gamemode: string): Promise<OpenMatchTicket> {
  return { id: Math.random().toString(), search_fields: { tags: [gamemode] } } as OpenMatchTicket
}

export async function emulate_getTicket(app, ticketId, userId): Promise<OpenMatchTicket | void> {
  const matchUserResult = await app.service('match-user').find({
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
    search_fields: {
      tags: [matchUser.gamemode]
    }
  }
}

export async function emulate_getTicketsAssignment(
  app,
  ticketId,
  userId
): Promise<OpenMatchTicketAssignment | OpenAPIErrorResponse> {
  // emulate response from open-match-api
  const matchUser = await waitAndGetMatchUser(app, ticketId, userId, 50)

  if (!matchUser) {
    // throw new BadRequest('MatchUser not found. ticket is outdated?')
    throw { code: 5, message: `Ticket id: ${ticketId} not found` }
  }

  const connection = Math.random().toString()
  await app.service('match-user').patch(matchUser.id, {
    connection
  })

  return new Promise<OpenMatchTicketAssignment | OpenAPIErrorResponse>((resolve, reject) => {
    setTimeout(async () => {
      try {
        await app.service('match-user').get(matchUser.id)
      } catch (e) {
        reject({ code: 5, message: `Ticket id: ${ticketId} not found` })
      }

      const assignment: OpenMatchTicketAssignment = {
        connection: connection,
        extensions: {
          GameMode: { type_url: '', value: matchUser.gamemode }
        }
      }

      resolve(assignment)
    }, 2000)
  })
}
