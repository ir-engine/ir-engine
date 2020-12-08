import { expect } from "@jest/globals";
import {Schema, Model, views, ExtractSchemaObject} from "@xr3ngine/engine/src/networking/classes/index"//"superbuffer"

const {int16, int32, uint8, uint32, uint64, int64, float32, boolean, string} = views;

//import { inputKeyArraySchema } from "@xr3ngine/engine/src/networking/schema/clientInputSchema";



const inputKeySchema = new Schema({
  input: uint8,
  value: uint8, // float32
  lifecycleState: uint8
});

const inputAxis1DSchema = new Schema({
  input: uint8,
  value: float32,
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
  time: uint64
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
    tick: uint64,
    transforms: [transformSchema]
});



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
    time: uint64,
    tick: uint32,
    players: [playerSchema],
    towers: [towerSchema]
})

const dataModel = new Model(mainModel)
console.log(Date.now());
*/
test("compress/decompress", () => {

    const gameState = {
      clientsConnected: [],
      clientsDisconnected: [],
      createObjects: [],
      destroyObjects: [],
      inputs: [
        {
          networkId: 8,
          axes1d: [],
          axes2d: [{
            input: 15,
            valueX: 0.3455443,
            valueY: 0.3456554,
            lifecycleState: 1
          }],
          buttons: [],
          viewVector: {x: 0.34534,y:0.4343,z:0.34534}
        },
        {
          networkId: 9,
          axes1d: [],
          axes2d: [{
            input: 17,
            valueX: 0.3455443,
            valueY: 0.3456554,
            lifecycleState: 1
          }],
          buttons: [],
          viewVector: {x: 0.34534,y:0.4343,z:0.34534}
        }
      ],
      snapshot: {
        id:"f5huik",
        time: BigInt(1607096225814)
      },
      tick: BigInt(77081),
      transforms: []
    }

    console.log("Game state is", gameState);

    const worldStateModel = new Model(worldStateSchema);
    const buffer = worldStateModel.toBuffer(gameState)


   const result = worldStateModel.fromBuffer(buffer);
   console.log(result);
   expect(result).toMatchObject(gameState);




    // const clientInputModel = new Model(inputsArraySchema);
    // const buffer = clientInputModel.toBuffer(inputs);
    // const unpackedInputs = clientInputModel.fromBuffer(buffer);

    // expect(unpackedInputs).toMatchObject(inputs);
})
