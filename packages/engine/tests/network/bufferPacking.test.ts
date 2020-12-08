import { expect } from "@jest/globals";
import { int16, int64, string8, uint16, uint32, uint8 } from "@xr3ngine/engine/src/common/types/DataTypes";
import { Model } from "@xr3ngine/engine/src/networking/classes/Model";
import { createSchema } from "@xr3ngine/engine/src/networking/functions/createSchema";

const playerSchema = createSchema('player', {
    id: uint8,
    name: { type: string8, length: 3 },
    x: { type: int16, digits: 2 },
    y: { type: int16, digits: 2 }
})

const towerSchema = createSchema('tower', {
    id: uint8,
    health: uint8,
    team: uint8
})

const mainSchema = createSchema('gamestate', {
    time: int64,
    tick: uint32,
    players: [playerSchema],
    towers: [towerSchema]
})

test("compress/decompress", () => {
    const mainModel = new Model(mainSchema);
    console.log("Main model is", mainModel);

    const gameState = {
        time: new Date().getTime(),
        tick: 32580,
        players: [
            {
              id: 0,
              name: 'TTT',
              x: -14,
              y: 47
            },
            {
              id: 1,
              name: 'FFF',
              x: 21,
              y: -78
           }
        ],
        towers: [
            { id: 0, health: 100, team: 0 },
            { id: 1, health: 89, team: 0 },
            { id: 2, health: 45, team: 1 }
        ]
    }

    console.log("Game state is", gameState);

    const buffer = mainModel.toBuffer(gameState)
    const unpackedGameState = mainModel.fromBuffer(buffer);
    console.log(unpackedGameState);
    expect(unpackedGameState).toMatchObject(gameState);

    // const clientInputModel = new Model(inputsArraySchema);
    // const buffer = clientInputModel.toBuffer(inputs);
    // const unpackedInputs = clientInputModel.fromBuffer(buffer);

    // expect(unpackedInputs).toMatchObject(inputs);
})
