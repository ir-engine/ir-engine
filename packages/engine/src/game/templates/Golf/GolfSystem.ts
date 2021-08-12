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

  const ballHitQuery = defineQuery([GolfBallComponent, Action.GameObjectCollisionTag])
  const ballHitAddQuery = enterQuery(ballHitQuery)

  const ballMovingQuery = defineQuery([GolfBallComponent, GolfState.BallMoving])

  const ballAlmostStoppedQuery = defineQuery([GolfBallComponent, GolfState.AlmostStopped])
  const ballAlmostStoppedAddQuery = enterQuery(ballAlmostStoppedQuery)

  const ballStoppedQuery = defineQuery([GolfBallComponent, GolfState.BallStopped])

  const checkCourseQuery = defineQuery([GolfBallComponent, GolfState.CheckCourse, GolfState.BallStopped])
  const checkCourseAddQuery = enterQuery(checkCourseQuery)

  const ballHiddenQuery = defineQuery([GolfBallComponent, GolfState.BallHidden])
  const ballHiddenAddQuery = enterQuery(ballHiddenQuery)

  const ballVisibleQuery = defineQuery([GolfBallComponent, GolfState.BallVisible])
  const ballVisibleAddQuery = enterQuery(ballVisibleQuery)

  const correctBallPositionQuery = defineQuery([GolfBallComponent, GolfState.CorrectBallPosition])
  const correctBallPositionAddQuery = enterQuery(correctBallPositionQuery)

  const hitQuery = defineQuery([GolfClubComponent, GolfState.Hit])
  const hitAddQuery = enterQuery(hitQuery)
  const hitRemoveQuery = exitQuery(hitQuery)

  const clubHitQuery = defineQuery([GolfClubComponent, Action.GameObjectCollisionTag])
  const clubHitAddQuery = enterQuery(clubHitQuery)

  const activeClubQuery = defineQuery([GolfClubComponent, State.Active])
  const activeClubAddQuery = enterQuery(activeClubQuery)

  const inctiveClubQuery = defineQuery([GolfClubComponent, State.Inactive])
  const inctiveClubAddQuery = enterQuery(inctiveClubQuery)

  const waitingQuery = defineQuery([GamePlayer, State.Waiting])
  const waitingAddQuery = enterQuery(waitingQuery)

  const yourTurnQuery = defineQuery([GamePlayer, State.YourTurn])
  const yourTurnAddQuery = enterQuery(yourTurnQuery)

  const waitTurnQuery = defineQuery([GamePlayer, State.WaitTurn])
  const waitTurnAddQuery = enterQuery(waitTurnQuery)

  const holeHitQuery = defineQuery([GolfHoleComponent, Action.GameObjectCollisionTag])
  const holeHitAddQuery = enterQuery(holeHitQuery)

  const goalQuery = defineQuery([GamePlayer, GolfState.Goal])
  const goalAddQuery = enterQuery(goalQuery)

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

    ///////////////////////////////////////////////////////////
    /////////////////// TURN STUFF ///////////////////////////
    ///////////////////////////////////////////////////////////
    // NEXT TURN
    for (const entity of waitingQuery(world)) {
      if (waitingAddQuery(world).some((addedEntity) => addedEntity === entity)) continue
      const playerComponent = getComponent(entity, GamePlayer)
      const ballEntity = playerComponent.ownedObjects['GolfBall']
      if (!ballEntity) continue
      if (hasComponent(ballEntity, GolfState.BallStopped) && hasComponent(ballEntity, State.Inactive)) {
        nextTurn(entity)
      }
    }

    // ADD WAITING
    for (const entity of yourTurnQuery(world)) {
      if (yourTurnAddQuery(world).some((addedEntity) => addedEntity === entity)) continue
      const playerComponent = getComponent(entity, GamePlayer)
      const ballEntity = playerComponent.ownedObjects['GolfBall']
      if (!ballEntity) continue
      if (hasComponent(ballEntity, GolfState.BallMoving) && hasComponent(entity, GolfState.AlreadyHit)) {
        removeStateComponent(entity, State.YourTurn)
        removeStateComponent(entity, GolfState.AlreadyHit)
        addStateComponent(entity, State.Waiting)
      }
    }

    ///////////////////////////////////////////////////////////
    /////////////////// BALL STUFF ///////////////////////////
    ///////////////////////////////////////////////////////////

    for (const entity of correctBallPositionAddQuery(world)) {
      updateColliderPosition(entity)
      removeComponent(entity, GolfState.CorrectBallPosition)
    }

    for (const entity of golfBallQuery(world)) {
      if (!hasComponent(entity, State.SpawnedObject)) continue
      updateBall(entity)
    }

    // CHECK If Ball drop out of GameArea
    for (const entity of ballMovingQuery(world)) {
      if (ifGetOut(entity, { area: 'GameArea' })) {
        teleportObject(entity, getPositionNextPoint(entity, 'GolfTee-'))
      }
    }

    // SWITCH STATE on ball start stopping
    for (const entity of ballMovingQuery(world)) {
      if (ifVelocity(entity, { less: 0.001 })) {
        removeStateComponent(entity, GolfState.BallMoving)
        addStateComponent(entity, GolfState.AlmostStopped)
      }
    }

    // Remove velocity for full stopped ball
    for (const entity of ballAlmostStoppedAddQuery(world)) {
      removeVelocity(entity)
    }

    // SWITCH STATE from middle of moviong to stop or still moving
    for (const entity of ballAlmostStoppedQuery(world)) {
      // This line not allow run this code if State was added in this frame.
      // if (for(const entity of ballAlmostStoppedAddQuery(world).some(addedEntity => addedEntity.id === entity.id)) continue;
      if (ifVelocity(entity, { more: 0.001 })) {
        removeStateComponent(entity, GolfState.AlmostStopped)
        addStateComponent(entity, GolfState.BallMoving)
      } else if (ifVelocity(entity, { less: 0.0001 })) {
        removeStateComponent(entity, GolfState.AlmostStopped)
        addStateComponent(entity, GolfState.BallStopped)
      }
    }

    // CHECK If Ball drop out of course
    for (const entity of checkCourseAddQuery(world)) {
      if (ifOutCourse(entity)) {
        removeComponent(entity, GolfState.CheckCourse)
        teleportObject(entity, getPositionNextPoint(entity, 'GolfTee-'))
      }
    }

    // SWITCH STATE on ball if he start moving
    for (const entity of ballStoppedQuery(world)) {
      if (ifVelocity(entity, { more: 0.001 })) {
        removeStateComponent(entity, GolfState.BallStopped)
        addStateComponent(entity, GolfState.BallMoving)
      }
    }

    //////////////////////////////////////////////////////////
    //////////////////////// HOLE ////////////////////////////
    //////////////////////////////////////////////////////////

    for (const holeEntity of holeHitAddQuery(world)) {
      for (const ballEntity of ballHitQuery(world)) {
        const entityPlayer =
          Network.instance.networkObjects[getComponent(ballEntity, NetworkObjectComponentOwner).networkId]?.entity
        const gameScore = getStorage(entityPlayer, { name: 'GameScore' })
        const game = getGame(entityPlayer)
        const currentHoleEntity = gameScore.score
          ? game.gameObjects['GolfHole'][gameScore.score.goal]
          : game.gameObjects['GolfHole'][0]
        if (currentHoleEntity) {
          addStateComponent(entityPlayer, GolfState.Goal)
          removeComponent(ballEntity, GolfState.CheckCourse)
          saveGoalScore(entityPlayer)
          removeComponent(holeEntity, Action.GameObjectCollisionTag)
          removeComponent(ballEntity, Action.GameObjectCollisionTag)
        }

        if (isClient) {
          const entityYourPlayer = Network.instance.networkObjects[Network.instance.localAvatarNetworkId]?.entity
          if (!hasComponent(entityYourPlayer, GolfState.Goal) && !hasComponent(entityYourPlayer, State.YourTurn)) {
            // this case when other player hit ball but you still waiting yours ball to stop
            // but you need waite because you use interpolation correction bevavior, other player not and server not

            removeStateComponent(entityYourPlayer, State.WaitTurn)
            addStateComponent(entityYourPlayer, State.YourTurn)

            //   removeStateComponent(entityPlayer, State.YourTurn)
            //   removeStateComponent(entityPlayer, State.Waiting)
            //   addStateComponent(entityPlayer, State.WaitTurn)
          }
        }
      }
    }

    for (const entity of goalAddQuery(world)) {
      const playerComponent = getComponent(entity, GamePlayer)
      const ballEntity = playerComponent.ownedObjects['GolfBall']
      teleportPlayer(entity, getPositionNextPoint(entity, 'GolfTee-'), new Quaternion())
      teleportObject(ballEntity, getPositionNextPoint(entity, 'GolfTee-'))
      removeStateComponent(entity, GolfState.Goal)
    }

    ///////////////////////////////////////////////////////////
    /////////////////////// CLUB //////////////////////////////
    ///////////////////////////////////////////////////////////

    for (const clubEntity of clubHitAddQuery(world)) {
      for (const ballEntity of ballHitAddQuery(world)) {
        if (hasComponent(ballEntity, GolfState.BallStopped) && hasComponent(ballEntity, State.Active)) {
          addStateComponent(clubEntity, GolfState.Hit)
          // sendVelocity(clubEntity)
        } else if (isClient) {
          // this case when other player hit ball but you still waiting yours ball to stop
          // but you need waite because you use interpolation correction bevavior, other player not and server not
          if (
            Network.instance.networkObjects[Network.instance.localAvatarNetworkId].ownerId !=
            Network.instance.networkObjects[getComponent(ballEntity, NetworkObjectComponentOwner).networkId].ownerId
          ) {
            const entityYourPlayer = Network.instance.networkObjects[Network.instance.localAvatarNetworkId]?.entity
            removeStateComponent(entityYourPlayer, State.Waiting)
            addStateComponent(entityYourPlayer, State.WaitTurn)
            const entityPlayer =
              Network.instance.networkObjects[getComponent(ballEntity, NetworkObjectComponentOwner).networkId]?.entity
            addStateComponent(entityPlayer, State.YourTurn)
            addStateComponent(clubEntity, GolfState.Hit)
          }
        }
      }
    }

    for (const clubEntity of hitAddQuery(world)) {
      const ballEntity = golfBallQuery(world).find((e) => ifOwned(clubEntity, e))
      hitBall(clubEntity, 5, 4, ballEntity)

      removeStateComponent(clubEntity, GolfState.Hit)
      // its needed to revome action if action added from network, in normal case thay remmoving in place where thay adding
      removeComponent(clubEntity, Action.GameObjectCollisionTag)
      removeComponent(ballEntity, Action.GameObjectCollisionTag)
    }

    for (const clubEntity of hitRemoveQuery(world)) {
      const playerEntity =
        Network.instance.networkObjects[getComponent(clubEntity, NetworkObjectComponentOwner).networkId]?.entity
      const ballEntity = golfBallQuery(world).find((e) => ifOwned(clubEntity, e))
      saveScore(playerEntity)
      addStateComponent(playerEntity, GolfState.AlreadyHit)
      if (!hasComponent(ballEntity, GolfState.CheckCourse)) {
        addStateComponent(ballEntity, GolfState.CheckCourse)
      }
    }
    for (const entity of golfClubQuery(world)) {
      if (!hasComponent(entity, State.SpawnedObject)) continue
      updateClub(entity)
    }
    ///////////////////////////////////////////////////////////
    ////////////////////    Turn reuired quary     ////////////
    ///////////////////////////////////////////////////////////

    // DO ALL ECS LOGIC HERE (added and removed queries)

    //
    // do ball Active on next Turn
    for (const entity of yourTurnAddQuery(world)) {
      const playerComponent = getComponent(entity, GamePlayer)
      const ballEntity = playerComponent.ownedObjects['GolfBall']
      removeStateComponent(ballEntity, State.Inactive)
      addStateComponent(ballEntity, State.Active)
    }

    // give Ball Inactive State for player cant hit Ball again in one game turn
    for (const entity of waitingAddQuery(world)) {
      const playerComponent = getComponent(entity, GamePlayer)
      const ballEntity = playerComponent.ownedObjects['GolfBall']
      removeStateComponent(ballEntity, State.Active)
      addStateComponent(ballEntity, State.Inactive)
    }

    // UnHide Ball on YourTurn
    for (const entity of yourTurnAddQuery(world)) {
      const playerComponent = getComponent(entity, GamePlayer)
      const ballEntity = playerComponent.ownedObjects['GolfBall']
      removeStateComponent(ballEntity, GolfState.BallHidden)
      addStateComponent(ballEntity, GolfState.BallVisible)
    }

    // Hide Ball on not YourTurn
    for (const entity of waitTurnAddQuery(world)) {
      const playerComponent = getComponent(entity, GamePlayer)
      const ballEntity = playerComponent.ownedObjects['GolfBall']
      removeStateComponent(ballEntity, GolfState.BallVisible)
      addStateComponent(ballEntity, GolfState.BallHidden)
    }

    for (const entity of ballHiddenAddQuery(world)) {
      if (isClient) {
        hideBall(entity)
      }
    }

    for (const entity of ballVisibleAddQuery(world)) {
      if (isClient) {
        unhideBall(entity)
      }
    }

    for (const entity of yourTurnAddQuery(world)) {
      const playerComponent = getComponent(entity, GamePlayer)
      const entityClub = playerComponent.ownedObjects['GolfClub']
      removeStateComponent(entityClub, State.Inactive)
      addStateComponent(entityClub, State.Active)
    }

    for (const entity of waitTurnAddQuery(world)) {
      const playerComponent = getComponent(entity, GamePlayer)
      const entityClub = playerComponent.ownedObjects['GolfClub']
      removeStateComponent(entityClub, State.Active)
      addStateComponent(entityClub, State.Inactive)
    }

    for (const entity of activeClubAddQuery(world)) {
      console.log('enable club')
      if (isClient) {
        enableClub(entity, true)
      }
    }

    for (const entity of inctiveClubAddQuery(world)) {
      console.log('disable club')
      if (isClient) {
        enableClub(entity, false)
      }
    }

    ///////////////////////////////////////////////////////////
    //////////////////////////////////////////    ////////////
    ///////////////////////////////////////////////////////////

    for (const entity of playerAddQuery(world)) {
      // set up client side stuff
      setupPlayerInput(entity)
      // createYourTurnPanel(entity) // TODO
      isClient && setupPlayerAvatar(entity)

      // set up game logic
      addRole(entity)
      addStateComponent(entity, State.Active)
      addStateComponent(entity, State.WaitTurn)

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
