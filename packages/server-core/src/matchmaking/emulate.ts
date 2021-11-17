import { BadRequest } from '@feathersjs/errors'
import { OpenMatchTicketAssignment } from '@xrengine/matchmaking/src/interfaces'

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

export async function emulate_getTicketsAssignment(app, ticketId, userId) {
  // emulate response from open-match-api
  const matchUser = await waitAndGetMatchUser(app, ticketId, userId, 5000)

  if (!matchUser) {
    throw new BadRequest('MatchUser not found. ticket is outdated?')
  }

  console.log('matchUser', matchUser)
  const connection = Math.random().toString()
  await app.service('match-user').patch(matchUser.id, {
    connection
  })

  return new Promise<OpenMatchTicketAssignment>((resolve, reject) => {
    setTimeout(async () => {
      const user = await app.service('match-user').get(matchUser.id)
      console.log('assignment time', user)
      if (!user) {
        reject()
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
