import { expect } from "@jest/globals";
import {Schema, Model, ExtractSchemaObject} from "superbuffer";
import {int16, int32, uint8, uint32, float32, boolean, string} from "superbuffer";
//import { inputKeyArraySchema } from "@xrengine/engine/src/networking/schema/networkSchema";

const inputKeySchema = new Schema({
  input: uint8,
  value: uint8, // float32
  lifecycleState: uint8
});

const inputAxis1DSchema = new Schema({
  input: uint8,
  valueX: float32,
  valueY: float32,
  lifecycleState: uint8
});

const inputAxis2DSchema = new Schema({
  input: uint8,
  valueX: float32,
  valueY: float32,
  lifecycleState: uint8
});

const viewVectorSchema = new Schema({
  x: float32,
  y: float32,
  z: float32
});


const inputKeyArraySchema = new Schema({
  networkId: uint32,
  axes1d: [inputAxis1DSchema],
  axes2d: [inputAxis2DSchema],
  buttons: [inputKeySchema],
  viewVector: viewVectorSchema
});

/*

const clientConnectedSchema = new Schema({
    userId: string
});

const clientDisconnectedSchema = new Schema({
    userId: string
});

const transformSchema = new Schema({
    networkId: uint32,
    x: float32,
    y: float32,
    z: float32,
    qX: float32,
    qY: float32,
    qZ: float32,
    qW: float32
});

const snapshotSchema = new Schema({
  id: string,
  time: uint32
})

const createNetworkObjectSchema = new Schema({
    networkId: uint32,
    ownerId: string,
    prefabType: uint8,
    x: float32,
    y: float32,
    z: float32,
    qX: float32,
    qY: float32,
    qZ: float32,
    qW: float32
});


const destroyNetworkObjectSchema = new Schema({
    networkId: uint32
});

const worldStateSchema = new Schema({
    clientsConnected: [clientConnectedSchema],
    clientsDisconnected: [clientDisconnectedSchema],
    createObjects: [createNetworkObjectSchema],
    destroyObjects: [destroyNetworkObjectSchema],
    inputs: [inputKeyArraySchema],
    snapshot: snapshotSchema,
    tick: uint32,
    transforms: [transformSchema]
});
*/


/*
const nameSchema = new Schema({
  first: uint8,
  second: uint8
})

const playerSchema = new Schema({
    id: uint8,
    name: [nameSchema],
    x: int16,
    y: int16
})

const towerSchema = new Schema({
    id: uint8,
    health: uint8,
    team: uint8
})

const mainModel = new Schema({
    time: uint32,
    tick: uint32,
    players: [playerSchema],
    towers: [towerSchema]
})

const dataModel = new Model(mainModel)
console.log(Date.now());
*/
test("compress/decompress", () => {

  const gameState = {
    networkId: 1,
    viewVector: { x: 0.6531652, y: -0.4165249, z: 0.6323624 },
    axes1d: [],
    axes2d: [
      {
        input: 15,
        lifecycleState: 4,
        valueX: 0.9144216,
        valueY: -0.7661538
      },
      { input: 16, lifecycleState: 2, valueX: 0, valueY: 0 },
      { input: 17, lifecycleState: 2, valueX: 0, valueY: 0 },
      { input: 19, lifecycleState: 4, valueX: 0.003169572, valueY: 0 },
      {
        input: 23,
        lifecycleState: 4,
        valueX: 0.177496,
        valueY: -0.2707692
      }
    ],
    buttons: [
      { input: 0, lifecycleState: 2, value: 0 },
      { input: 1, lifecycleState: 2, value: 0 },
      { input: 2, lifecycleState: 2, value: 0 }
    ]
  }

  console.log("Game state is", gameState);

  const worldStateModel = new Model(inputKeyArraySchema);
  const buffer = worldStateModel.toBuffer(gameState)


  const result = worldStateModel.fromBuffer(buffer);
  console.log(result);
  expect(result).toMatchObject(gameState);

  // const clientInputModel = new Model(inputsArraySchema);
  // const buffer = clientInputModel.toBuffer(inputs);
  // const unpackedInputs = clientInputModel.fromBuffer(buffer);

  // expect(unpackedInputs).toMatchObject(inputs);
})
