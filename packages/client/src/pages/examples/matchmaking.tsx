import React, { useEffect, useRef, useState } from 'react'
import { client } from '@xrengine/client-core/src/feathers'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import { OpenMatchTicket, OpenMatchTicketAssignment } from '@xrengine/matchmaking/src/interfaces'
import { useHistory } from 'react-router-dom'

async function findCurrentTicketData() {
  const { data } = await client.service('match-user').find()
  if (data.length) {
    const matchUser = data[0]
    const ticket = await client.service('match-ticket').get(matchUser.ticketId)
    if (!ticket) {
      // ticket is outdated - delete match-user row
      await client.service('match-user').remove(matchUser.id)
    } else {
      const gamemode = ticket.search_fields.tags[0]
      return { id: ticket.id, gamemode }
    }
  }
}

interface TicketData {
  id: string
  gamemode: string
}

const Page = () => {
  const history = useHistory()
  const [isUpdating, setIsUpdating] = useState(true)
  const [ticketData, setTicketData] = useState<TicketData | undefined>()
  const [connection, setConnection] = useState<string | undefined>()
  const locationService = client.service('location')
  const ticketsService = client.service('match-ticket')
  const ticketsAssignmentService = client.service('match-ticket-assignment')

  console.log('RENDER', ticketData, connection)

  useEffect(() => {
    AuthService.doLoginAuto(true).then(async () => {
      const _ticketData = await findCurrentTicketData()
      setTicketData(_ticketData)
      setIsUpdating(false)
    })
  }, [])

  const ticketId = ticketData?.id
  useEffect(() => {
    if (!ticketId) {
      return
    }

    getAssignment(ticketId).then((assignment) => {
      setConnection(assignment.connection)
      // setStatus('Found!')
    })
  }, [ticketId])

  useEffect(() => {
    if (connection) {
      setTimeout(() => {
        history.push('/location/' + connection)
      }, 500)
    }
  }, [connection])

  async function newTicket(gamemode) {
    // setStatus('...')
    setIsUpdating(true)
    let serverTicket: OpenMatchTicket
    try {
      serverTicket = await ticketsService.create({ gamemode })
    } catch (e) {
      const matchUser = (await client.service('match-user').find()).data[0]
      serverTicket = await ticketsService.get(matchUser.ticketId)
      if (!serverTicket) {
        // cleanup
        await client.service('match-user').remove(matchUser.id)
        // create new
        serverTicket = await ticketsService.create({ gamemode })
      }
    }

    setIsUpdating(false)

    if (!serverTicket.id || (ticketData && ticketData.id === serverTicket.id)) {
      return
    }

    if (serverTicket.id && serverTicket.search_fields?.tags) {
      setTicketData({
        id: serverTicket.id,
        gamemode: serverTicket.search_fields?.tags[0]
      })
    }
  }

  async function deleteTicket(ticketId: string) {
    if (!ticketId) {
      return
    }
    await ticketsService.remove(ticketId)
    setTicketData(undefined)
    // setStatus('')
  }

  function getAssignment(ticketId: string): Promise<OpenMatchTicketAssignment> {
    return (ticketsAssignmentService.get(ticketId) as Promise<OpenMatchTicketAssignment>).then((assignment) => {
      console.log('assignment', ticketId, assignment)
      return assignment
    })
  }

  return (
    <div style={{ backgroundColor: 'black', margin: '10px' }}>
      {isUpdating ? (
        <>Loading...</>
      ) : (
        <MatchMakingControl
          ticket={ticketData}
          connection={connection}
          onJoinQueue={newTicket}
          onExitQueue={deleteTicket}
        />
      )}
    </div>
  )
}

interface MatchMakingControlPropsInterface {
  ticket?: TicketData
  connection?: string
  onJoinQueue: (string) => void
  onExitQueue: (string) => void
}

const MatchMakingControl = (props: MatchMakingControlPropsInterface) => {
  // ticketId, gamemode
  const { ticket, connection, onJoinQueue, onExitQueue } = props

  let content
  if (connection) {
    content = <div style={{ fontSize: 16, textAlign: 'center' }}>{`GAME FOUND, connection: ${connection}.`}</div>
  } else if (typeof ticket !== 'undefined') {
    content = (
      <>
        <div style={{ fontSize: 16, textAlign: 'center' }}>{`Searching players for ${ticket.gamemode}.`}</div>
        <button onClick={() => onExitQueue(ticket.id)}>Exit queue</button>
      </>
    )
  } else {
    content = (
      <>
        <button onClick={() => onJoinQueue('mode.ctf')}>Join: CTF</button>
        <button onClick={() => onJoinQueue('mode.battleroyale')}>Join: BATTLEROYALE</button>
      </>
    )
  }

  return content
}

export default Page
