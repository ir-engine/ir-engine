import { string16, uint8, int16, uint16, int64, string8, uint32 } from "../types/DataTypes"
import { NetworkSystem } from "../systems/NetworkSystem"
import DefaultMessageTypes from "./DefaultMessageTypes"

// Clock
const clockData = {
  time: typeof int64,
  tick: typeof uint16
}

const clockSchema = NetworkSystem.addMessageSchema<typeof clockData>(DefaultMessageTypes.Clock, clockData)

// Position
const positionData = {
  entityId: typeof uint32,
  x: { type: typeof int16, digits: 3 },
  y: { type: typeof int16, digits: 3 },
  z: { type: typeof int16, digits: 3 }
}

const positionSchema = NetworkSystem.addMessageSchema<typeof positionData>(DefaultMessageTypes.Position, positionData)

// Position
const velocityData = {
  entityId: typeof uint32,
  x: { type: typeof int16, digits: 3 },
  y: { type: typeof int16, digits: 3 },
  z: { type: typeof int16, digits: 3 }
}

const velocitySchema = NetworkSystem.addMessageSchema<typeof velocityData>(DefaultMessageTypes.Position, velocityData)

// Position
const spinData = {
  entityId: typeof uint32,
  x: { type: typeof int16, digits: 3 },
  y: { type: typeof int16, digits: 3 },
  z: { type: typeof int16, digits: 3 }
}

const spinSchema = NetworkSystem.addMessageSchema<typeof spinData>(DefaultMessageTypes.Position, spinData)

// Rotation
const rotationData = {
  entityId: typeof uint32,
  x: { type: typeof int16, digits: 3 },
  y: { type: typeof int16, digits: 3 },
  z: { type: typeof int16, digits: 3 },
  w: { type: typeof int16, digits: 3 }
}

const rotationSchema = NetworkSystem.addMessageSchema<typeof rotationData>(DefaultMessageTypes.Rotation, rotationData)

// Scale
const scaleData = {
  entityId: typeof uint32,
  x: { type: typeof int16, digits: 3 },
  y: { type: typeof int16, digits: 3 },
  z: { type: typeof int16, digits: 3 }
}

const scaleSchema = NetworkSystem.addMessageSchema<typeof scaleData>(DefaultMessageTypes.Rotation, scaleData)

//Player
const playerData = {
  networkId: typeof uint16,
  userId: { type: typeof string8, length: 16 },
  name: { type: typeof string8, length: 16 }
}

const playerSchema = NetworkSystem.addMessageSchema<typeof playerData>(DefaultMessageTypes.Player, playerData)

//Object
const objectData = {
  networkId: typeof uint8,
  ownerId: { type: typeof string8, length: 16 },
  name: { type: typeof string8, length: 16 }
}

const objectSchema = NetworkSystem.addMessageSchema<typeof objectData>(DefaultMessageTypes.Player, objectData)

// World state
const worldData = {
  clock: clockSchema,
  players: [playerSchema],
  objects: [objectSchema]
}

const worldSync = NetworkSystem.addMessageSchema<typeof worldData>(DefaultMessageTypes.World, worldData)

const test = worldSync.struct.clock
