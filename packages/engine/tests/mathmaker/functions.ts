import { get, post, requestResponse } from './httpUtils'
import {
  isOpenAPIError,
  OpenMatchTicket,
  OpenMatchTicketAssignment,
  OpenMatchTicketAssignmentResponse
} from './interfaces'

function checkForApiErrorResponse(data: requestResponse): requestResponse {
  if (isOpenAPIError(data.body)) {
    throw new Error(`[${data.body.code}] ${data.body.message}`)
  }
  return data
}

function createTicket(gameMode): Promise<OpenMatchTicket> {
  return post('/v1/frontendservice/tickets', {
    ticket: {
      searchFields: {
        tags: [gameMode],
        DoubleArgs: {
          'time.enterqueue': 0
        }
      }
    }
  })
    .then(checkForApiErrorResponse)
    .then((response) => response.body as OpenMatchTicket)
}

// TicketAssignmentsResponse
function getTicketsAssignment(ticketId: string): Promise<OpenMatchTicketAssignment> {
  return get(`/v1/frontendservice/tickets/${ticketId}/assignments`, {}, true)
    .then(checkForApiErrorResponse)
    .then((response) => (response.body as OpenMatchTicketAssignmentResponse).result.assignment)
}

function getTicket(ticketId: string): Promise<OpenMatchTicket> {
  return get(`/v1/frontendservice/tickets/${ticketId}`)
    .then(checkForApiErrorResponse)
    .then((response) => response.body as OpenMatchTicket)
}

export { createTicket, getTicket, getTicketsAssignment }
