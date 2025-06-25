import { ws } from 'msw'

const primus = ws.link(/primus/g)

// Keys should be shaped like `scope.find`, etc..
type MockCollection = Record<string, (input: object) => object>

export const handleMocks = (handlers: MockCollection) => {
  return [
    primus.addEventListener('connection', ({ client }) => {
      client.addEventListener('message', (message) => {
        const messageData = JSON.parse(message.data.toString())
        const { id, data } = messageData
        const [method, path, input] = data
        const handler = handlers[`${path}.${method}`]
        if (!handler) return
        const responseData = handler(input)
        const response = {
          id,
          type: 1,
          data: [null, responseData]
        }
        client.send(JSON.stringify(response))
      })
    })
  ]
}
