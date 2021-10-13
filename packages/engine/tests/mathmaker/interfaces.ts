interface OpenMatchTicket {
  id?: 'string'
  assignment?: OpenMatchTicketAssignment
  search_fields?: OpenMatchSearchFields
  extensions?: OpenMatchExtensions
  create_time?: string
}

type OpenMatchExtensions = Record<string, { type_url: string; value: string }>

interface OpenMatchSearchFields {
  double_args?: Record<string, number>
  string_args?: Record<string, string>
  tags: string[]
}

interface OpenAPIErrorResponse {
  code: number
  message: string
  details?: [
    {
      type_url: string
      value: string
    }
  ]
}

function isOpenAPIError(response: unknown | OpenAPIErrorResponse): response is OpenAPIErrorResponse {
  const error = response as OpenAPIErrorResponse
  return typeof error.code !== 'undefined' && typeof error.message !== 'undefined'
}

interface OpenMatchTicketAssignment {
  connection: string
  extensions?: OpenMatchExtensions
}

interface OpenMatchTicketAssignmentResponse {
  result: {
    assignment: OpenMatchTicketAssignment
  }
}

export {
  OpenMatchTicket,
  OpenMatchTicketAssignment,
  OpenMatchTicketAssignmentResponse,
  OpenAPIErrorResponse,
  isOpenAPIError
}
