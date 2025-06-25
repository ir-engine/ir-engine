import { ws } from 'msw'

type MockServiceHandler = (method: string, path: string, input: any) => any

interface MockServiceOptions {
  /**
   * Custom handler function to process incoming websocket messages
   * @param method - The service method (e.g., 'find', 'get', 'create')
   * @param path - The service path (e.g., 'scope', 'user')
   * @param input - The input parameters for the service call
   * @returns The mock response data
   */
  handler?: MockServiceHandler
  /**
   * Default mock data to return if no custom handler is provided
   */
  defaultData?: any
  /**
   * Whether to log incoming messages for debugging
   */
  debug?: boolean
}

/**
 * Creates a websocket mock handler for Storybook MSW integration
 * Abstracts away the websocket connection and message parsing logic
 *
 * @param options - Configuration options for the mock service
 * @returns MSW websocket handler that can be used in Storybook parameters
 */
export const createWebsocketMockHandler = (options: MockServiceOptions = {}) => {
  const { handler, defaultData, debug = false } = options
  const primus = ws.link(/primus/g)

  return primus.addEventListener('connection', ({ client }) => {
    client.addEventListener('message', (message) => {
      const messageData = JSON.parse(message.data.toString())
      const { id, data } = messageData
      const [method, path, input] = data

      if (debug) {
        console.log('Websocket message received:', { method, path, input })
      }

      let responseData: any

      if (handler) {
        // Use custom handler if provided
        responseData = handler(method, path, input)
      } else if (defaultData) {
        // Use default data if provided
        responseData = defaultData
      } else {
        // Fallback to empty response
        responseData = {
          total: 0,
          limit: 10,
          skip: 0,
          data: []
        }
      }

      const response = {
        id,
        type: 1,
        data: [null, responseData]
      }

      client.send(JSON.stringify(response))
    })
  })
}

/**
 * Helper function to create a simple find service mock with predefined data
 *
 * @param mockData - Array of mock data items to return
 * @param total - Total count (defaults to mockData.length)
 * @returns MSW websocket handler
 */
export const createFindServiceMock = (mockData: any[], total?: number) => {
  return createWebsocketMockHandler({
    handler: (method, _path, input) => {
      if (method === 'find') {
        return {
          total: total ?? mockData.length,
          limit: input?.limit || 10,
          skip: input?.skip || 0,
          data: mockData
        }
      }
      return { data: [] }
    }
  })
}

/**
 * Helper function to create a scope service mock (commonly used pattern)
 *
 * @param scopeData - Optional custom scope data
 * @returns MSW websocket handler for scope service
 */
export const createScopeMock = (scopeData?: any) => {
  const defaultScopeData = {
    id: '5bfb0678-7bda-4381-8eff-8e27c6cf6bad',
    userId: 'a3561f56-175d-4049-a2ba-057c4231b6f4',
    type: 'admin:admin',
    accountId: null,
    createdAt: '2025-06-24T20:20:28.000Z',
    updatedAt: '2025-06-24T20:20:28.000Z'
  }

  return createFindServiceMock([scopeData || defaultScopeData])
}
