/**
 * @author Mohsen Heydari <github.com/mohsenheydari>
 * @author Gheric Speiginer <github.com/speigg>
 *
 * To run the starter game system you must use "npm run starter" in the root folder of the engine
 */

import { isClient } from '@xrengine/engine/src/common/functions/isClient'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { dispatchFrom } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { StarterAction } from './StarterGameActions'
import { createState } from '@hookstate/core'
import { initializeCube, updateCube } from './prefabs/CubePrefab'
import { Vector3 } from 'three'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { CubeComponent } from './components/CubeComponent'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import matches from 'ts-matches'
import { NetworkWorldAction } from '@xrengine/engine/src/networking/functions/NetworkWorldAction'

// Game state object
export const StarterState = createState({
  players: [] as Array<{
    id: string
  }>,
  spawnedCubes: 0
})

function actionReceptor(action: unknown) {
  const world = useWorld()

  StarterState.batch((s) => {
    matches(action)
      .when(NetworkWorldAction.spawnAvatar.matches, (a) => {
        const playerAlreadyExists = s.players.find((p) => p.value.id === a.userId)
        if (playerAlreadyExists) {
          console.log(`player ${a.userId} rejoined`)
        } else {
          s.players.merge([
            {
              id: a.userId
            }
          ])
          console.log(`player ${a.userId} joined`)
        }
        // Spawn cubes once player is joined
        dispatchFrom(world.hostId, () => StarterAction.spawnCubes({}))
      })

      .when(StarterAction.spawnCubes.matches, () => {
        if (s.spawnedCubes.value < 1) {
          for (let i = 1; i <= 10; i++) {
            dispatchFrom(world.hostId, () =>
              StarterAction.spawnCube({
                userId: world.hostId,
                parameters: {
                  position: new Vector3(Math.random() * 50 - 25, 10, Math.random() * -50 + 25)
                }
              })
            ).delay(100 * i)
            s.spawnedCubes.set(s.spawnedCubes.value + 1)
          }
        }
      })

      .when(StarterAction.spawnCube.matches, (a) => {
        initializeCube(a)
      })
  })
}

export default async function StarterSystem(world: World) {
  // Register the action receptor (this should always be done first)
  world.receptors.add(actionReceptor)

  const cubeQuery = defineQuery([CubeComponent])

  if (isClient) {
    // pre-cache the assets we need for this game
    await AssetLoader.loadAsync({ url: Engine.publicPath + '/models/debug/cube.glb' })
  }

  return () => {
    // Update cubes
    for (const entity of cubeQuery()) {
      updateCube(entity)
    }
  }
}
