import React, { useEffect, useRef, useState } from 'react'
import { client } from '@xrengine/client-core/src/feathers'
import { AuthService } from '@xrengine/client-core/src/user/state/AuthService'

const Page = () => {
  const [renderTrigger, updRenderTrigger] = useState<object>()
  const [ticketsIds, setTicketsIds] = useState<string[]>([])
  const connections = useRef<Record<string, string>>({})
  const ticketsService = client.service('match-ticket')
  const ticketsAssignmentService = client.service('match-ticket-assignment')

  console.log('RENDER', ticketsIds, connections)

  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  async function newTicket() {
    const ticket = await ticketsService.create({ gamemode: 'mode.demo' })
    console.log('ticket', ticket)
    setTicketsIds([...ticketsIds, ticket.id])

    getAssignment(ticket.id)
  }

  function addConnection(key, value) {
    console.log('addConnection', connections, key, value)
    return {
      ...connections,
      [key]: value
    }
  }

  function getAssignment(ticketId: string) {
    ticketsAssignmentService.get(ticketId).then((assignment) => {
      console.log('assignment', ticketId, assignment)
      connections.current[ticketId] = assignment.connection
      updRenderTrigger({})
    })
  }

  const ticketsTable = !ticketsIds.length
    ? null
    : ticketsIds.map((id) => {
        const status = connections.current[id]
          ? '...game found! connection info:' + connections.current[id]
          : '...waiting...'
        return (
          <tr key={id}>
            <td>Player id:{id}</td>
            <td>{status}</td>
          </tr>
        )
      })

  console.log('ticketsTable', ticketsTable)

  return (
    <div style={{ color: 'black', margin: '10px' }}>
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
