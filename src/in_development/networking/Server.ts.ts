import { createWorld } from "@javelin/ecs"
import { createHrtimeLoop } from "@javelin/hrtime-loop"
import { createMessageHandler, createMessageProducer, JavelinMessage, protocol } from "@javelin/net"
import { decode, encode } from "@msgpack/msgpack"
import { Connection } from "@web-udp/client"
import { Server } from "@web-udp/server"
import { createServer } from "http"
import { Position } from "../jav/src/common/components"
import { ConnectionType } from "../common/types"
import { Sleep, Velocity } from "../jav/src/server/components"
import { createJunk } from "../jav/src/server/entities"
import { spawn } from "../jav/src/server/systems"
import { Client, ConnectionMetadata } from "./types"

const PORT = 8000
const TICK_RATE = 60

const server = createServer()
const udp = new Server({ server })
const world = createWorld([spawn])
const handler = createMessageHandler(world)

world.registerComponentFactory(Position)
world.registerComponentFactory(Velocity)
world.registerComponentFactory(Sleep)

const clientMessageProducer = createMessageProducer({
  world,
  components: [{ type: Position, priority: 1 }],
  updateInterval: (1 / 20) * 1000,
  updateSize: 1000
})
const clients: Client[] = []

function isConnectionMetadata(obj: any): obj is ConnectionMetadata {
  return Object.values(ConnectionType).includes(obj.connectionType) && typeof obj.sessionId === "string"
}

function findOrCreateClient(sessionId: string) {
  let client = clients.find(c => c.sessionId === sessionId)

  if (!client) {
    console.log(`Client ${sessionId} connected`)
    client = { sessionId }
    clients.push(client)
  }

  return client
}

function sendClientMessages() {
  const metadata = clients.map(() => ({}))
  const reliable = clientMessageProducer.getReliableMessages()
  const unreliable = clientMessageProducer.getUnreliableMessages(metadata)

  for (let i = 0; i < clients.length; i++) {
    const client = clients[i]

    for (const message of reliable) {
      client.reliable?.send(encode(message))
    }

    const update = unreliable[i]

    if (update) {
      client.unreliable?.send(encode(update))
    }
  }
}

udp.connections.subscribe(connection => {
  if (!isConnectionMetadata(connection.metadata)) {
    console.error("Invalid connection metadata.")
    return
  }

  const { connectionType, sessionId } = connection.metadata
  const client = findOrCreateClient(sessionId)
  const removeClient = () => {
    console.log(`Client ${sessionId} disconnected`)
    clients.splice(clients.indexOf(client), 1)
  }

  console.log(`Client ${sessionId} established ${connectionType} channel`)

  if (connectionType === ConnectionType.Reliable) {
    client.reliable = connection
    setTimeout(() => {
      for (const message of clientMessageProducer.getInitialMessages()) {
        connection.send(encode(message))
      }
    }, 250)
  } else {
    client.unreliable = connection
  }

  connection.closed.subscribe(removeClient)
  connection.errors.subscribe(console.error)
})

const tickRateMs = 1000 / TICK_RATE

function tick(dt: number) {
  world.tick(dt)
  sendClientMessages()
}

const loop = createHrtimeLoop(tickRateMs, clock => tick(clock.dt))
loop.start()

for (let i = 0; i < 10; i++) {
  createJunk(world)
}

server.listen(PORT)
