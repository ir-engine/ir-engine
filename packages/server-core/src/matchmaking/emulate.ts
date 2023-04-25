import { matchUserPath } from '@etherealengine/engine/src/schemas/matchmaking/match-user.schema'
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

export async function emulate_createTicket(gamemode: string): Promise<MatchTicketType> {
  return { id: Math.random().toString(), searchFields: { tags: [gamemode] } } as MatchTicketType
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
      tags: [matchUser.gamemode]
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
          GameMode: { typeUrl: '', value: matchUser.gamemode }
        }
      }

      resolve(assignment)
    }, 2000)
  })
}
