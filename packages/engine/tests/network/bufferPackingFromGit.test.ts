import {BufferSchema, int16, int64, Model, string8, uint16} from '@geckos.io/typed-array-buffer-schema'
import { uint8, uint32, float32 } from '@geckos.io/typed-array-buffer-schema'
import {DefaultInput} from "../../src/templates/shared/DefaultInput";
import {LifecycleValue} from "../../src/common/enums/LifecycleValue";
import {BinaryValue} from "../../src/common/enums/BinaryValue";
import {expect} from "@jest/globals";

const inputKeySchema = BufferSchema.schema('button', {
    input: uint8,
    value: float32,
    lifecycleValue: uint8
});

const inputKeyArraySchema = BufferSchema.schema('main', {
    networkId: uint32,
    buttons: [inputKeySchema],
});

const inputsArraySchema = BufferSchema.schema('inputs', {
    inputs: [inputKeyArraySchema],
});

const networkId = 13;
const button = DefaultInput.FORWARD;
const lifecycleState = LifecycleValue.CONTINUED;
const value = BinaryValue.ON;
const inputs = [
    {
        networkId: networkId,
        buttons: [
            {
                input: button,
                lifecycleState,
                value
            }
        ]
    }
];
const nameSchema = BufferSchema.schema('name', {
    first: { type: string8, length: 6 },
    second: { type: string8, length: 6 }
})
const playerSchema = BufferSchema.schema('player', {
    id: uint8,
    name: [nameSchema],
    x: { type: int16, digits: 2 },
    y: { type: int16, digits: 2 }
})

const towerSchema = BufferSchema.schema('tower', {
    id: uint8,
    health: uint8,
    team: uint8
})

const mainSchema = BufferSchema.schema('main', {
    time: int64,
    tick: uint16,
    players: [playerSchema],
    towers: [towerSchema]
})

test("compress/decompress", () => {
    const mainModel = new Model(mainSchema)

    const gameState = {
        time: new Date().getTime(),
        tick: 32580,
        players: [
            {
              id: 0,
              name: [{
                first: 'TTT' ,
                second: 'FFF'
              }],
              x: -14.43,
              y: 47.78
            },
            {
              id: 1,
              name:[
              {
                first: 'TTT' ,
                second: 'FFF'
              }],
              x: 21.85,
              y: -78.48
           }
        ],
        towers: [
            { id: 0, health: 100, team: 0 },
            { id: 1, health: 89, team: 0 },
            { id: 2, health: 45, team: 1 }
        ]
    }

    const buffer = mainModel.toBuffer(gameState)
    const unpackedGameState = mainModel.fromBuffer(buffer);
    console.log(unpackedGameState.players);
    expect(unpackedGameState).toMatchObject(gameState);

    // const clientInputModel = new Model(inputsArraySchema);
    // const buffer = clientInputModel.toBuffer(inputs);
    // const unpackedInputs = clientInputModel.fromBuffer(buffer);

    // expect(unpackedInputs).toMatchObject(inputs);
})
