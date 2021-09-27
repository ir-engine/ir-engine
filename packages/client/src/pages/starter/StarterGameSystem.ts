/**
 * @author Mohsen Heydari <github.com/mohsenheydari>
 *
 * To run the starter game system you must use "npm run starter" in the root folder of the engine
 */

import { isClient } from '@xrengine/engine/src/common/functions/isClient'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery, getComponent, removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '@xrengine/engine/src/networking/components/NetworkObjectComponent'
import { dispatchFromServer } from '@xrengine/engine/src/networking/functions/dispatch'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { StarterAction, StarterActionType } from './StarterGameActions'
import { createState } from '@hookstate/core'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { CubeTagComponent, StarterGamePrefabs } from './prefabs/StarterGamePrefabs'
import { SpawnNetworkObjectComponent } from '@xrengine/engine/src/scene/components/SpawnNetworkObjectComponent'
import { initializeCube, spawnCube, updateCube } from './prefabs/CubePrefab'
import { Vector3 } from 'three'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { CubeComponent } from './components/CubeComponent'

// Game state object
export const StarterState = createState({
  players: [] as Array<{
    id: string
  }>,
  spawnedCubes: 0
})

function actionReceptor(action: StarterActionType) {
  // batch state updates together
  StarterState.batch((s) => {
    switch (action.type) {
      case 'starter.PLAYER_JOINED': {
        // this must happen on the server
        if (isClient) {
          return
        }

        // player left ?
        const player = Object.values(Network.instance.networkObjects).find((obj) => obj.uniqueId === action.playerId)
        if (!player) return

        const playerAlreadyExists = s.players.find((p) => p.value.id === action.playerId)

        if (playerAlreadyExists) {
          console.log(`player ${action.playerId} rejoined`)
        } else {
          s.players.merge([
            {
              id: action.playerId
            }
          ])

          console.log(`player ${action.playerId} joined`)
        }

        // Spawn cubes once player is joined
        if (s.spawnedCubes.value < 1) {
          for (let i = 1; i <= 10; i++) {
            setTimeout(() => {
              spawnCube(new Vector3(Math.random() * 50 - 25, 10, Math.random() * -50 + 25))
            }, 500 * i)

            s.spawnedCubes.set(s.spawnedCubes.value + 1)
          }
        }

        return
      }
    }
  })
}

export default async function StarterSystem(world: World) {
  const playerQuery = defineQuery([AvatarComponent, NetworkObjectComponent])
  const spawnCubeQuery = defineQuery([SpawnNetworkObjectComponent, CubeTagComponent])
  const cubeQuery = defineQuery([CubeComponent])

  if (isClient) {
    // pre-cache the assets we need for this game
    await AssetLoader.loadAsync({ url: Engine.publicPath + '/models/debug/cube.glb' })
  }

  // Add our prefabs
  Object.entries(StarterGamePrefabs).forEach(([prefabType, prefab]) => {
    Network.instance.schema.prefabs.set(prefabType, prefab)
  })

  // Register the action receptor
  world.receptors.add(actionReceptor)

  return () => {
    if (!isClient) {
      for (const entity of playerQuery.enter()) {
        const { uniqueId } = getComponent(entity, NetworkObjectComponent)

        // Dispatch player enter action on server
        dispatchFromServer(StarterAction.playerJoined(uniqueId))
      }
    }

    // Update cubes
    for (const entity of cubeQuery()) {
      updateCube(entity)
    }

    // Initialize cube prefab
    for (const entity of spawnCubeQuery.enter()) {
      const { parameters } = getComponent(entity, SpawnNetworkObjectComponent)
      removeComponent(entity, SpawnNetworkObjectComponent)
      initializeCube(entity, parameters)
    }

    return world
  }
}
