import { string16, uint8, int16, uint16, int64, string8, uint32 } from "../types/DataTypes"
import { NetworkSystem } from "../systems/NetworkSystem"
import DefaultMessageTypes from "./DefaultMessageTypes"

// Clock
const clockData = {
  time: typeof int64,
  tick: typeof uint16
}

const clockSchema = NetworkSystem.instance.addMessageSchema<typeof clockData>(DefaultMessageTypes.Clock, clockData)

// Position
const positionData = {
  entityId: typeof uint32,
  x: { type: typeof int16, digits: 3 },
  y: { type: typeof int16, digits: 3 },
  z: { type: typeof int16, digits: 3 }
}

const positionSchema = NetworkSystem.instance.addMessageSchema<typeof positionData>(DefaultMessageTypes.Position, positionData)

// Velocity
const velocityData = {
  entityId: typeof uint32,
  x: { type: typeof int16, digits: 3 },
  y: { type: typeof int16, digits: 3 },
  z: { type: typeof int16, digits: 3 }
}

const velocitySchema = NetworkSystem.instance.addMessageSchema<typeof velocityData>(DefaultMessageTypes.Velocity, velocityData)

// Spin
const spinData = {
  entityId: typeof uint32,
  x: { type: typeof int16, digits: 3 },
  y: { type: typeof int16, digits: 3 },
  z: { type: typeof int16, digits: 3 }
}

const spinSchema = NetworkSystem.instance.addMessageSchema<typeof spinData>(DefaultMessageTypes.Spin, spinData)

// Rotation
const rotationData = {
  entityId: typeof uint32,
  x: { type: typeof int16, digits: 3 },
  y: { type: typeof int16, digits: 3 },
  z: { type: typeof int16, digits: 3 },
  w: { type: typeof int16, digits: 3 }
}

const rotationSchema = NetworkSystem.instance.addMessageSchema<typeof rotationData>(DefaultMessageTypes.Rotation, rotationData)

// Scale
const scaleData = {
  entityId: typeof uint32,
  x: { type: typeof int16, digits: 3 },
  y: { type: typeof int16, digits: 3 },
  z: { type: typeof int16, digits: 3 }
}

const scaleSchema = NetworkSystem.instance.addMessageSchema<typeof scaleData>(DefaultMessageTypes.Scale, scaleData)

//Player
const clientData = {
  networkId: typeof uint16,
  userId: { type: typeof string8, length: 16 },
  name: { type: typeof string8, length: 16 }
}

const clientSchema = NetworkSystem.instance.addMessageSchema<typeof clientData>(DefaultMessageTypes.Client, clientData)

//Object
const objectData = {
  networkId: typeof uint8,
  ownerId: { type: typeof string8, length: 16 }
}

const objectSchema = NetworkSystem.instance.addMessageSchema<typeof objectData>(DefaultMessageTypes.Object, objectData)

// World state
const worldData = {
  clock: clockSchema,
  players: [clientSchema],
  objects: [objectSchema]
}

const worldSync = NetworkSystem.instance.addMessageSchema<typeof worldData>(DefaultMessageTypes.World, worldData)
