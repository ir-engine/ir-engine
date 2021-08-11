import { Quaternion } from 'three'
import { XRInputSourceComponent } from '../../../avatar/components/XRInputSourceComponent'
import { teleportPlayer } from '../../../avatar/functions/teleportPlayer'
import { isClient } from '../../../common/functions/isClient'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../../ecs/functions/EntityFunctions'
import { Network } from '../../../networking/classes/Network'
import { NetworkObjectComponent } from '../../../networking/components/NetworkObjectComponent'
import { NetworkObjectComponentOwner } from '../../../networking/components/NetworkObjectComponentOwner'
import { GameObject } from '../../components/GameObject'
import { GamePlayer } from '../../components/GamePlayer'
import { getGame, getUuid } from '../../functions/functions'
import { addStateComponent, removeStateComponent, sendVelocity } from '../../functions/functionsState'
import { getStorage, setStorage } from '../../functions/functionsStorage'
import { Action, State } from '../../types/GameComponents'
import { ifGetOut } from '../../functions/ifGetOut'
import { ifOwned } from '../../functions/ifOwned'
import { GolfGameMode } from '../GolfGameMode'
import { addHole } from './behaviors/addHole'
import { addRole } from './behaviors/addRole'
import { addTurn } from './behaviors/addTurn'
import { createYourTurnPanel } from './behaviors/createYourTurnPanel'
import { saveGoalScore } from './behaviors/displayScore'
import { getPositionNextPoint } from './behaviors/getPositionNextPoint'
import { hideBall, unhideBall } from './behaviors/hideUnhideBall'
import { hitBall } from './behaviors/hitBall'
import { nextTurn } from './behaviors/nextTurn'
import { saveScore } from './behaviors/saveScore'
import { setupPlayerAvatar, setupPlayerAvatarNotInVR, setupPlayerAvatarVR } from './behaviors/setupPlayerAvatar'
import { setupPlayerInput } from './behaviors/setupPlayerInput'
import { removeVelocity, teleportObject, updateColliderPosition } from './behaviors/teleportObject'
import { GolfBallComponent } from './components/GolfBallComponent'
import { GolfClubComponent } from './components/GolfClubComponent'
import { GolfHoleComponent } from './components/GolfHoleComponent'
import { GolfTeeComponent } from './components/GolfTeeComponent'
import { ifOutCourse } from './functions/ifOutCourse'
import { ifVelocity } from './functions/ifVelocity'
import { GolfState } from './GolfGameComponents'
import { initializeGolfBall, spawnBall, updateBall } from './prefab/GolfBallPrefab'
import { enableClub, initializeGolfClub, spawnClub, updateClub } from './prefab/GolfClubPrefab'
import { GolfBallTagComponent, GolfClubTagComponent, GolfPrefabs } from './prefab/GolfGamePrefabs'
import { SpawnNetworkObjectComponent } from '../../../scene/components/SpawnNetworkObjectComponent'
import { Engine } from '../../../ecs/classes/Engine'
import { defineQuery, defineSystem, enterQuery, exitQuery, System } from '../../../ecs/bitecs'
import { ECSWorld } from '../../../ecs/classes/World'
import { AssetLoader } from '../../../assets/classes/AssetLoader'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/hexafield>
 */

export const GolfSystem = async (): Promise<System> => {
  if (isClient) {
    await AssetLoader.loadAsync({ url: Engine.publicPath + '/models/golf/avatars/avatar_head.glb' })
    await AssetLoader.loadAsync({ url: Engine.publicPath + '/models/golf/avatars/avatar_hands.glb' })
    await AssetLoader.loadAsync({ url: Engine.publicPath + '/models/golf/avatars/avatar_torso.glb' })
  }
  Engine.gameModes.set(GolfGameMode.name, GolfGameMode)

  // add our prefabs - TODO: find a better way of doing this that doesn't pollute prefab namespace
  Object.entries(GolfPrefabs).forEach(([prefabType, prefab]) => {
    Network.instance.schema.prefabs.set(Number(prefabType), prefab)
  })

  const spawnGolfBallQuery = defineQuery([SpawnNetworkObjectComponent, GolfBallTagComponent])

  const spawnGolfClubQuery = defineQuery([SpawnNetworkObjectComponent, GolfClubTagComponent])

  const playerQuery = defineQuery([GamePlayer])
  const playerAddQuery = enterQuery(playerQuery)

  const playerVRQuery = defineQuery([GamePlayer, XRInputSourceComponent])
  const playerVRAddQuery = enterQuery(playerVRQuery)
  const playerVRRemoveQuery = exitQuery(playerVRQuery)

  const gameObjectQuery = defineQuery([GameObject])
  const gameObjectAddQuery = enterQuery(gameObjectQuery)

  const golfClubQuery = defineQuery([GolfClubComponent])
  const golfClubAddQuery = enterQuery(golfClubQuery)

  const golfBallQuery = defineQuery([GolfBallComponent])
  const golfBallAddQuery = enterQuery(golfBallQuery)

  const golfHoleQuery = defineQuery([GolfHoleComponent])
  const golfHoleAddQuery = enterQuery(golfHoleQuery)

  return defineSystem((world: ECSWorld) => {
    const { delta } = world

    for (const entity of spawnGolfBallQuery(world)) {
      const { ownerId } = getComponent(entity, NetworkObjectComponent)
      const ownerEntity = playerQuery(world).find((player) => {
        return getComponent(player, NetworkObjectComponent).uniqueId === ownerId
      })
      if (ownerEntity) {
        const { parameters } = removeComponent(entity, SpawnNetworkObjectComponent)
        removeComponent(entity, GolfBallTagComponent)
        initializeGolfBall(entity, parameters)
      }
    }

    for (const entity of spawnGolfClubQuery(world)) {
      const { ownerId } = getComponent(entity, NetworkObjectComponent)
      const ownerEntity = playerQuery(world).find((player) => {
        return getComponent(player, NetworkObjectComponent).uniqueId === ownerId
      })
      if (ownerEntity) {
        const { parameters } = removeComponent(entity, SpawnNetworkObjectComponent)
        removeComponent(entity, GolfClubTagComponent)
        initializeGolfClub(entity, parameters)
      }
    }

    for (const entity of playerQuery(world)) {
      if (!hasComponent(entity, State.Active)) continue

      const game = getGame(entity)
      const playerComponent = getComponent(entity, GamePlayer)
      const ownerId = getUuid(entity)

      if (!playerComponent.ownedObjects['GolfClub']) {
        const club = game.gameObjects['GolfClub'].find(
          (entity) => getComponent(entity, NetworkObjectComponent)?.ownerId === ownerId
        )
        if (club) {
          console.log('club')
          playerComponent.ownedObjects['GolfClub'] = club
          addStateComponent(club, State.SpawnedObject)
        }
      }

      if (!playerComponent.ownedObjects['GolfBall']) {
        const ball = game.gameObjects['GolfBall'].find(
          (entity) => getComponent(entity, NetworkObjectComponent)?.ownerId === ownerId
        )
        if (ball) {
          console.log('ball')
          playerComponent.ownedObjects['GolfBall'] = ball
          addStateComponent(ball, State.SpawnedObject)
          if (getComponent(entity, GamePlayer).role === '1-Player') {
            addTurn(entity)
          }
        }
      }
    }

    for (const entity of playerAddQuery(world)) {

      setupPlayerInput(entity)
      isClient && setupPlayerAvatar(entity)

      // set up game logic
      addRole(entity)

      setStorage(entity, { name: 'GameScore' }, { score: { hits: 0, goal: 0 } })

      if (!isClient) {
        spawnClub(entity)
        spawnBall(entity, 'GolfTee-0', 0.3)
      }
    }

    for (const entity of gameObjectAddQuery(world)) {
      const gameObject = getComponent(entity, GameObject)
      const role = gameObject.role.split('-')[0]
      switch (role) {
        case 'GolfTee':
          addComponent(entity, GolfTeeComponent, {})
          break
        case 'GolfHole':
          addComponent(entity, GolfHoleComponent, {})
          break
      }
    }

    for (const entity of golfClubAddQuery(world)) {
      addStateComponent(entity, State.Inactive)
    }

    for (const entity of golfBallAddQuery(world)) {
      addStateComponent(entity, State.Active)
      addStateComponent(entity, GolfState.AlmostStopped)
      addStateComponent(entity, GolfState.BallHidden)
    }

    for (const entity of golfHoleAddQuery(world)) {
      addHole(entity)
    }

    if (isClient) {
      for (const entity of playerVRAddQuery(world)) {
        setupPlayerAvatarVR(entity)
      }

      for (const entity of playerVRRemoveQuery(world)) {
        setupPlayerAvatarNotInVR(entity)
      }
    }

    return world
  })
}
