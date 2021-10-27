import React, { useEffect, useRef, useState } from 'react'
import { client } from '@xrengine/client-core/src/feathers'
import { AuthService } from '@xrengine/client-core/src/user/state/AuthService'
import { OpenMatchTicket, OpenMatchTicketAssignment } from '@xrengine/engine/tests/mathmaker/interfaces'
import { useHistory } from 'react-router-dom'

const Page = () => {
  const history = useHistory()
  const [status, setStatus] = useState<string>('')
  const [ticket, setTicket] = useState<OpenMatchTicket | null>(null)
  const [connection, setConnection] = useState<string | null>(null)
  const locationService = client.service('location')
  const ticketsService = client.service('match-ticket')
  const ticketsAssignmentService = client.service('match-ticket-assignment')

  console.log('RENDER', ticket, connection)

  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  useEffect(() => {
    if (connection) {
      setTimeout(() => {
        history.push('/location/' + connection)
      }, 500)
    }
  }, [connection])

  async function newTicket(gamemode) {
    setStatus('...')
    const ticket = await ticketsService.create({ gamemode })
    console.log('ticket', ticket)
    setTicket(ticket)
    setStatus('Searching more players for ' + gamemode + '.')

    getAssignment(ticket.id).then((assignment) => {
      setConnection(assignment.connection)
      setStatus('Found!')
    })
  }

  function getAssignment(ticketId: string): Promise<OpenMatchTicketAssignment> {
    return (ticketsAssignmentService.get(ticketId) as Promise<OpenMatchTicketAssignment>).then((assignment) => {
      console.log('assignment', ticketId, assignment)
      // connections.current[ticketId] = assignment.connection
      // updRenderTrigger({})
      return assignment
    })
  }

  // console.log('ticketsTable', ticketsTable)

  const buttons = (
    <>
      <button onClick={() => newTicket('mode.ctf')}>Join: CTF</button>
      <button onClick={() => newTicket('mode.battleroyale')}>Join: BATTLEROYALE</button>
    </>
  )

  return (
    <div style={{ backgroundColor: 'black', margin: '10px' }}>
      {!ticket ? buttons : <div style={{ fontSize: 16, textAlign: 'center' }}>{status}</div>}
    </div>
  )
}

export default Page
