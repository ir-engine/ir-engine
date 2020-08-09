import { int16, int64, string8, uint16, uint32, uint8 } from "../../common/types/DataTypes"
import { SchemaMap } from "../interfaces/SchemaMap"

export const DefaultMessageSchema: SchemaMap = {
  Clock: {
    time: typeof int64,
    tick: typeof uint16 // increment by one each frame
  },
  Position: {
    entityId: typeof uint32,
    x: { type: typeof int16, digits: 3 },
    y: { type: typeof int16, digits: 3 },
    z: { type: typeof int16, digits: 3 }
  },
  Velocity: {
    entityId: typeof uint32,
    x: { type: typeof int16, digits: 3 },
    y: { type: typeof int16, digits: 3 },
    z: { type: typeof int16, digits: 3 }
  },
  Spin: {
    entityId: typeof uint32,
    x: { type: typeof int16, digits: 3 },
    y: { type: typeof int16, digits: 3 },
    z: { type: typeof int16, digits: 3 }
  },
  Rotation: {
    entityId: typeof uint32,
    x: { type: typeof int16, digits: 3 },
    y: { type: typeof int16, digits: 3 },
    z: { type: typeof int16, digits: 3 },
    w: { type: typeof int16, digits: 3 }
  },
  Scale: {
    entityId: typeof uint32,
    x: { type: typeof int16, digits: 3 },
    y: { type: typeof int16, digits: 3 },
    z: { type: typeof int16, digits: 3 }
  },
  Client: {
    networkId: typeof uint16,
    userId: { type: typeof string8, length: 16 },
    name: { type: typeof string8, length: 16 }
  },
  Object: {
    networkId: typeof uint8,
    ownerId: { type: typeof string8, length: 16 }
  }
}

DefaultMessageSchema.worldData = {
  Clock: DefaultMessageSchema.clockSchema,
  Players: [DefaultMessageSchema.clientSchema],
  Objects: [DefaultMessageSchema.objectSchema]
}
