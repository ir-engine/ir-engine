import { int16, int32, int64, string8, uint16, uint32 } from '../../common/types/DataTypes';
import { SchemaMap } from '../../networking/interfaces/SchemaMap';

export const DefaultMessageSchema: SchemaMap = {
  Clock: {
    time: typeof int64,
    tick: typeof uint32 // increment by one each frame
  },
  Position: {
    networkId: typeof uint16,
    x: { type: typeof int32, digits: 4 },
    y: { type: typeof int32, digits: 4 },
    z: { type: typeof int32, digits: 4 }
  },
  DeltaPosition: {
    networkId: typeof uint16,
    x: { type: typeof int16, digits: 3 },
    y: { type: typeof int16, digits: 3 },
    z: { type: typeof int16, digits: 3 }
  },
  Velocity: {
    networkId: typeof uint16,
    x: { type: typeof int16, digits: 3 },
    y: { type: typeof int16, digits: 3 },
    z: { type: typeof int16, digits: 3 }
  },
  Spin: {
    networkId: typeof uint16,
    x: { type: typeof int16, digits: 3 },
    y: { type: typeof int16, digits: 3 },
    z: { type: typeof int16, digits: 3 }
  },
  Rotation: {
    networkId: typeof uint16,
    x: { type: typeof int32, digits: 4 },
    y: { type: typeof int32, digits: 4 },
    z: { type: typeof int32, digits: 4 },
    w: { type: typeof int32, digits: 4 }
  },
  DeltaRotation: {
    networkId: typeof uint16,
    x: { type: typeof int16, digits: 3 },
    y: { type: typeof int16, digits: 3 },
    z: { type: typeof int16, digits: 3 },
    w: { type: typeof int16, digits: 3 }
  },
  Scale: {
    networkId: typeof uint16,
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
    networkId: typeof uint16
  }
};
