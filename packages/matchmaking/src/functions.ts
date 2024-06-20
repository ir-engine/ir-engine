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
import axios from 'axios'
import fetch from 'node-fetch'

import { MatchTicketAssignmentType } from './match-ticket-assignment.schema'
import { MatchTicketType } from './match-ticket.schema'

export const FRONTEND_SERVICE_URL = process.env.FRONTEND_SERVICE_URL || 'http://localhost:51504/v1/frontendservice'
const axiosInstance = axios.create({
  baseURL: FRONTEND_SERVICE_URL
})

/**
 * @param response
 */
function checkForApiErrorResponse(response: unknown): unknown {
  if (!response) {
    return response
  }

  if ((response as any).code) {
    throw response
  } else if ((response as any).error) {
    throw (response as any).error
  }

  return response
}

function createTicket(gameMode: string, attributes?: Record<string, string>): Promise<MatchTicketType> {
  const searchFields: any = {
    tags: [gameMode],
    doubleArgs: {
      'time.enterqueue': Date.now()
    }
  }

  if (attributes) {
    searchFields.stringArgs = {}
    for (const attributesKey in attributes) {
      searchFields.stringArgs['attributes.' + attributesKey] = attributes[attributesKey]
    }
  }

  // console.log('TICKET.CREATE --------- searchFields', searchFields)

  return axiosInstance
    .post(`/tickets`, {
      ticket: {
        searchFields
      }
    })
    .then((r) => r.data)
    .then(checkForApiErrorResponse)
    .then((response) => response as MatchTicketType)
}

function readStreamFirstData(stream: NodeJS.ReadableStream) {
  return new Promise((resolve, reject) => {
    stream.once('readable', () => {
      const chunk = stream.read()
      resolve(JSON.parse(chunk.toString()))
    })
    stream.once('error', reject)
  })
}

// TicketAssignmentsResponse
async function getTicketsAssignment(ticketId: string, timeout = 300): Promise<MatchTicketAssignmentType> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeout)

  let data
  try {
    const response = await fetch(`${FRONTEND_SERVICE_URL}/tickets/${ticketId}/assignments`, {
      signal: controller.signal
    })

    data = await readStreamFirstData(response.body!)
  } catch (error) {
    if (error.name === 'AbortError') {
      // no assignment yet
      return {
        connection: ''
      }
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
  checkForApiErrorResponse(data)

  return data.result.assignment
}

function getTicket(ticketId: string): Promise<MatchTicketType | void> {
  return axiosInstance
    .get(`/tickets/${ticketId}`)
    .then((r) => r.data)
    .then(checkForApiErrorResponse)
    .then((result) => {
      return result as MatchTicketType
    })
    .catch((e) => {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 404) {
          // we expect 404 if ticket not found, just return nothing
          return
        }
      }
      // otherwise throw further
      throw e
    })
}

function deleteTicket(ticketId: string): Promise<void> {
  return axiosInstance
    .delete(`/tickets/${ticketId}`)
    .then((r) => r.data)
    .then(checkForApiErrorResponse)
    .then((result) => {})
}

export { createTicket, deleteTicket, getTicket, getTicketsAssignment }
