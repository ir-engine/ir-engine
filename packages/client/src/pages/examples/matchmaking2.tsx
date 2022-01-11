import { client } from '@xrengine/client-core/src/feathers'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import { OpenMatchTicketAssignment } from '@xrengine/matchmaking/src/interfaces'
import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const Page = () => {
  const [renderTrigger, updRenderTrigger] = useState<object>()
  const [ticketsIds, setTicketsIds] = useState<string[]>([])
  const connections = useRef<Record<string, string>>({})
  const locationService = client.service('location')
  const ticketsService = client.service('match-ticket')
  const ticketsAssignmentService = client.service('match-ticket-assignment')

  console.log('RENDER', ticketsIds, connections)

  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  async function newTicket() {
    let ticket
    try {
      ticket = await ticketsService.create({ gamemode: 'mode.demo' })
    } catch (e) {
      alert('You already searching for game')
      const matchUser = (await client.service('match-user').find()).data[0]
      console.log('matchUser', matchUser)
      ticket = { id: matchUser.ticketId }
    }
    console.log('ticket', ticket)
    if (ticketsIds.includes(ticket.id)) {
      return
    }
    setTicketsIds([...ticketsIds, ticket.id])

    getAssignment(ticket.id).then((assignment) => {})
  }

  function addConnection(key, value) {
    console.log('addConnection', connections, key, value)
    return {
      ...connections,
      [key]: value
    }
  }

  function getAssignment(ticketId: string): Promise<OpenMatchTicketAssignment> {
    return (ticketsAssignmentService.get(ticketId) as Promise<OpenMatchTicketAssignment>).then((assignment) => {
      console.log('assignment', ticketId, assignment)
      connections.current[ticketId] = assignment.connection
      updRenderTrigger({})
      return assignment
    })
  }

  const ticketsTable = !ticketsIds.length
    ? null
    : ticketsIds.map((id) => {
        const locationName = connections.current[id]
        const status = locationName ? (
          <>
            ...game found! connection link: <Link to={'/location/' + locationName}>locationName</Link>
          </>
        ) : (
          '...waiting...'
        )
        return (
          <tr key={id}>
            <td>Player id:{id}</td>
            <td>{status}</td>
          </tr>
        )
      })

  // console.log('ticketsTable', ticketsTable)

  return (
    <div style={{ backgroundColor: 'black', margin: '10px' }}>
      <button onClick={() => newTicket()}>Find game (as new player)</button>
      <div>
        Players in queue:
        <table>
          <tbody>{ticketsTable}</tbody>
        </table>
      </div>
    </div>
  )
}

export default Page
