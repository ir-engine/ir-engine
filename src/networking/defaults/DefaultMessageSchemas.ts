import { string16, uint8, int16, uint16, int64, string8, uint32 } from "../../common/types/DataTypes"
import SchemaMap from "../interfaces/SchemaMap"

const schema: SchemaMap = {
  clockData: {
    time: typeof int64,
    tick: typeof uint16
  },
  positionData: {
    entityId: typeof uint32,
    x: { type: typeof int16, digits: 3 },
    y: { type: typeof int16, digits: 3 },
    z: { type: typeof int16, digits: 3 }
  },
  velocityData: {
    entityId: typeof uint32,
    x: { type: typeof int16, digits: 3 },
    y: { type: typeof int16, digits: 3 },
    z: { type: typeof int16, digits: 3 }
  },
  spinData: {
    entityId: typeof uint32,
    x: { type: typeof int16, digits: 3 },
    y: { type: typeof int16, digits: 3 },
    z: { type: typeof int16, digits: 3 }
  },
  eotationData: {
    entityId: typeof uint32,
    x: { type: typeof int16, digits: 3 },
    y: { type: typeof int16, digits: 3 },
    z: { type: typeof int16, digits: 3 },
    w: { type: typeof int16, digits: 3 }
  },
  scaleData: {
    entityId: typeof uint32,
    x: { type: typeof int16, digits: 3 },
    y: { type: typeof int16, digits: 3 },
    z: { type: typeof int16, digits: 3 }
  },
  clientData: {
    networkId: typeof uint16,
    userId: { type: typeof string8, length: 16 },
    name: { type: typeof string8, length: 16 }
  },
  objectData: {
    networkId: typeof uint8,
    ownerId: { type: typeof string8, length: 16 }
  }
}

schema.worldData = {
  clock: schema.clockSchema,
  players: [schema.clientSchema],
  objects: [schema.objectSchema]
}

export default schema
