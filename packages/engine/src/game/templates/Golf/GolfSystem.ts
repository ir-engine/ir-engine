import { isClient } from '../../../common/functions/isClient'
import { System } from '../../../ecs/classes/System'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../../ecs/functions/EntityFunctions'
import { Network } from '../../../networking/classes/Network'
import { NetworkObject } from '../../../networking/components/NetworkObject'
import { NetworkObjectOwner } from '../../../networking/components/NetworkObjectOwner'
import { GameObject } from '../../components/GameObject'
import { GamePlayer } from '../../components/GamePlayer'
import { getGame, getUuid } from '../../functions/functions'
import { addStateComponent, removeStateComponent, sendVelocity } from '../../functions/functionsState'
import { getStorage, setStorage } from '../../functions/functionsStorage'
import { Action, State } from '../../types/GameComponents'
import { ifGetOut } from '../gameDefault/checkers/ifGetOut'
import { ifOwned } from '../gameDefault/checkers/ifOwned'
import { ifVelocity } from './functions/ifVelocity'
import { addHole } from './behaviors/addHole'
import { addRole } from './behaviors/addRole'
import { addTurn } from './behaviors/addTurn'
import { createYourTurnPanel } from './behaviors/createYourTurnPanel'
import { saveGoalScore } from './behaviors/displayScore'
import { getPositionNextPoint } from './behaviors/getPositionNextPoint'
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
import { initializeGolfBall, spawnBall, updateBall } from './prefab/GolfBallPrefab'
import { initializeGolfClub, spawnClub, updateClub, hideClub, enableClub } from './prefab/GolfClubPrefab'
import { ifOutCourse } from './functions/ifOutCourse'
import { XRInputSourceComponent } from '../../../avatar/components/XRInputSourceComponent'
import { hideBall, unhideBall } from './behaviors/hideUnhideBall'
import { GolfState } from './GolfGameComponents'
import { Quaternion } from 'three'
import { teleportPlayer } from '../../../avatar/functions/teleportPlayer'
import { GolfBallTagComponent, GolfClubTagComponent, GolfPrefabs } from './prefab/GolfGamePrefabs'
import { SpawnNetworkObjectComponent } from '../../../scene/components/SpawnNetworkObjectComponent'
import { Engine } from '../../../ecs/classes/Engine'
import { GolfGameMode } from '../GolfGameMode'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/hexafield>
 */

export class GolfSystem extends System {
  /**
   * Executes the system. Called each frame by default from the Engine.
   * @param delta Time since last frame.
   */
  constructor() {
    super()
    Engine.gameModes.set(GolfGameMode.name, GolfGameMode)

    // add our prefabs - TODO: find a better way of doing this that doesn't pollute prefab namespace
    Object.entries(GolfPrefabs).forEach(([prefabType, prefab]) => {
      Network.instance.schema.prefabs.set(Number(prefabType), prefab)
    })
  }

  execute(delta: number, time: number): void {
    // DO ALL STATE LOGIC HERE (all queries)

    for (const entity of this.queryResults.spawnGolfBall.all) {
      const { ownerId } = getComponent(entity, NetworkObject)
      const ownerEntity = this.queryResults.player.all.find((player) => {
        return getComponent(player, NetworkObject).uniqueId === ownerId
      })
      if (ownerEntity) {
        const { parameters } = removeComponent(entity, SpawnNetworkObjectComponent)
        removeComponent(entity, GolfBallTagComponent)
        initializeGolfBall(entity, parameters)
      }
    }

    for (const entity of this.queryResults.spawnGolfClub.all) {
      const { ownerId } = getComponent(entity, NetworkObject)
      const ownerEntity = this.queryResults.player.all.find((player) => {
        return getComponent(player, NetworkObject).uniqueId === ownerId
      })
      if (ownerEntity) {
        const { parameters } = removeComponent(entity, SpawnNetworkObjectComponent)
        removeComponent(entity, GolfClubTagComponent)
        initializeGolfClub(entity, parameters)
      }
    }

    for (const entity of this.queryResults.player.all) {
      if (!hasComponent(entity, State.Active)) continue

      const game = getGame(entity)
      const playerComponent = getComponent(entity, GamePlayer)
      const ownerId = getUuid(entity)

      if (!playerComponent.ownedObjects['GolfClub']) {
        const club = game.gameObjects['GolfClub'].find(
          (entity) => getComponent(entity, NetworkObject)?.ownerId === ownerId
        )
        if (club) {
          console.log('club')
          playerComponent.ownedObjects['GolfClub'] = club
          addStateComponent(club, State.SpawnedObject)
        }
      }

      if (!playerComponent.ownedObjects['GolfBall']) {
        const ball = game.gameObjects['GolfBall'].find(
          (entity) => getComponent(entity, NetworkObject)?.ownerId === ownerId
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
    for (const entity of this.queryResults.waiting.all) {
      if (this.queryResults.waiting.added.some((addedEntity) => addedEntity.id === entity.id)) continue
      const playerComponent = getComponent(entity, GamePlayer)
      const ballEntity = playerComponent.ownedObjects['GolfBall']
      if (!ballEntity) continue
      if (hasComponent(ballEntity, GolfState.BallStopped) && hasComponent(ballEntity, State.Inactive)) {
        nextTurn(entity)
      }
    }

    // ADD WAITING
    for (const entity of this.queryResults.yourTurn.all) {
      if (this.queryResults.yourTurn.added.some((addedEntity) => addedEntity.id === entity.id)) continue
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

    for (const entity of this.queryResults.correctBallPosition.added) {
      updateColliderPosition(entity)
      removeComponent(entity, GolfState.CorrectBallPosition)
    }

    for (const entity of this.queryResults.golfBall.all) {
      if (!hasComponent(entity, State.SpawnedObject)) continue
      updateBall(entity, {}, delta)
    }

    // CHECK If Ball drop out of GameArea
    for (const entity of this.queryResults.ballMoving.all) {
      if (ifGetOut(entity, { area: 'GameArea' })) {
        teleportObject(entity, getPositionNextPoint(entity, { positionCopyFromRole: 'GolfTee-' }))
      }
    }

    // SWITCH STATE on ball start stopping
    for (const entity of this.queryResults.ballMoving.all) {
      if (ifVelocity(entity, { less: 0.001 })) {
        removeStateComponent(entity, GolfState.BallMoving)
        addStateComponent(entity, GolfState.AlmostStopped)
      }
    }

    // Remove velocity for full stopped ball
    for (const entity of this.queryResults.ballAlmostStopped.added) {
      removeVelocity(entity)
    }

    // SWITCH STATE from middle of moviong to stop or still moving
    for (const entity of this.queryResults.ballAlmostStopped.all) {
      // This line not allow run this code if State was added in this frame.
      // if (for(const entity of this.queryResults.ballAlmostStopped.added.some(addedEntity => addedEntity.id === entity.id)) continue;
      if (ifVelocity(entity, { more: 0.001 })) {
        removeStateComponent(entity, GolfState.AlmostStopped)
        addStateComponent(entity, GolfState.BallMoving)
      } else if (ifVelocity(entity, { less: 0.0001 })) {
        removeStateComponent(entity, GolfState.AlmostStopped)
        addStateComponent(entity, GolfState.BallStopped)
      }
    }

    // CHECK If Ball drop out of course
    for (const entity of this.queryResults.checkCourse.added) {
      if (ifOutCourse(entity)) {
        removeComponent(entity, GolfState.CheckCourse)
        teleportObject(entity, getPositionNextPoint(entity, { positionCopyFromRole: 'GolfTee-' }))
      }
    }

    // SWITCH STATE on ball if he start moving
    for (const entity of this.queryResults.ballStopped.all) {
      if (ifVelocity(entity, { more: 0.001 })) {
        removeStateComponent(entity, GolfState.BallStopped)
        addStateComponent(entity, GolfState.BallMoving)
      }
    }

    //////////////////////////////////////////////////////////
    //////////////////////// HOLE ////////////////////////////
    //////////////////////////////////////////////////////////

    for (const holeEntity of this.queryResults.holeHit.added) {
      for (const ballEntity of this.queryResults.ballHit.all) {
        const entityPlayer =
          Network.instance.networkObjects[getComponent(ballEntity, NetworkObjectOwner).networkId]?.component.entity
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
          const entityYourPlayer =
            Network.instance.networkObjects[Network.instance.localAvatarNetworkId]?.component.entity
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

    for (const entity of this.queryResults.goal.added) {
      const playerComponent = getComponent(entity, GamePlayer)
      const ballEntity = playerComponent.ownedObjects['GolfBall']
      teleportPlayer(entity, getPositionNextPoint(entity, { positionCopyFromRole: 'GolfTee-' }), new Quaternion())
      teleportObject(ballEntity, getPositionNextPoint(entity, { positionCopyFromRole: 'GolfTee-' }))
      removeStateComponent(entity, GolfState.Goal)
    }

    ///////////////////////////////////////////////////////////
    /////////////////////// CLUB //////////////////////////////
    ///////////////////////////////////////////////////////////

    for (const clubEntity of this.queryResults.clubHit.added) {
      for (const ballEntity of this.queryResults.ballHit.added) {
        if (hasComponent(ballEntity, GolfState.BallStopped) && hasComponent(ballEntity, State.Active)) {
          addStateComponent(clubEntity, GolfState.Hit)
          sendVelocity(clubEntity)
        } else if (isClient) {
          // this case when other player hit ball but you still waiting yours ball to stop
          // but you need waite because you use interpolation correction bevavior, other player not and server not
          if (
            Network.instance.networkObjects[Network.instance.localAvatarNetworkId].ownerId !=
            Network.instance.networkObjects[getComponent(ballEntity, NetworkObjectOwner).networkId].ownerId
          ) {
            const entityYourPlayer =
              Network.instance.networkObjects[Network.instance.localAvatarNetworkId]?.component.entity
            removeStateComponent(entityYourPlayer, State.Waiting)
            addStateComponent(entityYourPlayer, State.WaitTurn)
            const entityPlayer =
              Network.instance.networkObjects[getComponent(ballEntity, NetworkObjectOwner).networkId]?.component.entity
            addStateComponent(entityPlayer, State.YourTurn)
            addStateComponent(clubEntity, GolfState.Hit)
          }
        }
      }
    }

    for (const clubEntity of this.queryResults.hit.added) {
      const ballEntity = this.queryResults.golfBall.all.find((e) => ifOwned(clubEntity, null, e))
      hitBall(clubEntity, { clubPowerMultiplier: 5, hitAdvanceFactor: 4 }, delta, ballEntity)
      removeStateComponent(clubEntity, GolfState.Hit)
      // its needed to revome action if action added from network, in normal case thay remmoving in place where thay adding
      removeComponent(clubEntity, Action.GameObjectCollisionTag)
      removeComponent(ballEntity, Action.GameObjectCollisionTag)
    }

    for (const clubEntity of this.queryResults.hit.removed) {
      const playerEntity =
        Network.instance.networkObjects[getComponent(clubEntity, NetworkObjectOwner).networkId]?.component.entity
      const ballEntity = this.queryResults.golfBall.all.find((e) => ifOwned(clubEntity, null, e))
      saveScore(playerEntity)
      addStateComponent(playerEntity, GolfState.AlreadyHit)
      if (!hasComponent(ballEntity, GolfState.CheckCourse)) {
        addStateComponent(ballEntity, GolfState.CheckCourse)
      }
    }
    for (const entity of this.queryResults.golfClub.all) {
      if (!hasComponent(entity, State.SpawnedObject)) continue
      updateClub(entity, null, delta)
    }
    ///////////////////////////////////////////////////////////
    ////////////////////    Turn reuired quary     ////////////
    ///////////////////////////////////////////////////////////

    // DO ALL ECS LOGIC HERE (added and removed queries)

    //
    // do ball Active on next Turn
    for (const entity of this.queryResults.yourTurn.added) {
      const playerComponent = getComponent(entity, GamePlayer)
      const ballEntity = playerComponent.ownedObjects['GolfBall']
      removeStateComponent(ballEntity, State.Inactive)
      addStateComponent(ballEntity, State.Active)
    }

    // give Ball Inactive State for player cant hit Ball again in one game turn
    for (const entity of this.queryResults.waiting.added) {
      const playerComponent = getComponent(entity, GamePlayer)
      const ballEntity = playerComponent.ownedObjects['GolfBall']
      removeStateComponent(ballEntity, State.Active)
      addStateComponent(ballEntity, State.Inactive)
    }

    // UnHide Ball on YourTurn
    for (const entity of this.queryResults.yourTurn.added) {
      const playerComponent = getComponent(entity, GamePlayer)
      const ballEntity = playerComponent.ownedObjects['GolfBall']
      removeStateComponent(ballEntity, GolfState.BallHidden)
      addStateComponent(ballEntity, GolfState.BallVisible)
    }

    // Hide Ball on not YourTurn
    for (const entity of this.queryResults.waitTurn.added) {
      const playerComponent = getComponent(entity, GamePlayer)
      const ballEntity = playerComponent.ownedObjects['GolfBall']
      removeStateComponent(ballEntity, GolfState.BallVisible)
      addStateComponent(ballEntity, GolfState.BallHidden)
    }

    for (const entity of this.queryResults.ballHidden.added) {
      if (isClient) {
        hideBall(entity)
      }
    }

    for (const entity of this.queryResults.ballVisible.added) {
      if (isClient) {
        unhideBall(entity)
      }
    }

    for (const entity of this.queryResults.yourTurn.added) {
      const playerComponent = getComponent(entity, GamePlayer)
      const entityClub = playerComponent.ownedObjects['GolfClub']
      removeStateComponent(entityClub, State.Inactive)
      addStateComponent(entityClub, State.Active)
    }

    for (const entity of this.queryResults.waitTurn.added) {
      const playerComponent = getComponent(entity, GamePlayer)
      const entityClub = playerComponent.ownedObjects['GolfClub']
      removeStateComponent(entityClub, State.Active)
      addStateComponent(entityClub, State.Inactive)
    }

    for (const entity of this.queryResults.activeClub.added) {
      if (isClient) {
        enableClub(entity, true)
      }
    }

    for (const entity of this.queryResults.inctiveClub.added) {
      if (isClient) {
        enableClub(entity, false)
      }
    }

    ///////////////////////////////////////////////////////////
    //////////////////////////////////////////    ////////////
    ///////////////////////////////////////////////////////////

    for (const entity of this.queryResults.player.added) {
      // set up client side stuff
      setupPlayerInput(entity)
      createYourTurnPanel(entity)
      isClient && setupPlayerAvatar(entity)

      // set up game logic
      addRole(entity)
      addStateComponent(entity, State.WaitTurn)
      addStateComponent(entity, State.Active)

      setStorage(entity, { name: 'GameScore' }, { score: { hits: 0, goal: 0 } })

      if (!isClient) {
        spawnClub(entity)
        spawnBall(entity, { positionCopyFromRole: 'GolfTee-0', offsetY: 0.3 })
      }
    }

    for (const entity of this.queryResults.gameObject.added) {
      const gameObject = getComponent(entity, GameObject)
      const role = gameObject.role.split('-')[0]
      switch (role) {
        case 'GolfTee':
          addComponent(entity, GolfTeeComponent)
          break
        case 'GolfHole':
          addComponent(entity, GolfHoleComponent)
          break
      }
    }

    for (const entity of this.queryResults.golfClub.added) {
      addStateComponent(entity, State.Inactive)
    }

    for (const entity of this.queryResults.golfBall.added) {
      addStateComponent(entity, State.Active)
      addStateComponent(entity, GolfState.AlmostStopped)
      addStateComponent(entity, GolfState.BallHidden)
    }

    for (const entity of this.queryResults.golfHole.added) {
      addHole(entity)
    }

    if (isClient) {
      for (const entity of this.queryResults.playerVR.added) {
        setupPlayerAvatarVR(entity)
      }

      for (const entity of this.queryResults.playerVR.removed) {
        setupPlayerAvatarNotInVR(entity)
      }
    }
  }

  static queries = {
    spawnGolfBall: {
      components: [SpawnNetworkObjectComponent, GolfBallTagComponent],
      listen: {
        added: true,
        removed: true
      }
    },
    spawnGolfClub: {
      components: [SpawnNetworkObjectComponent, GolfClubTagComponent],
      listen: {
        added: true,
        removed: true
      }
    },
    player: {
      components: [GamePlayer],
      listen: {
        added: true,
        removed: true
      }
    },
    playerVR: {
      components: [GamePlayer, XRInputSourceComponent],
      listen: {
        added: true,
        removed: true
      }
    },
    gameObject: {
      components: [GameObject],
      listen: {
        added: true,
        removed: true
      }
    },
    golfClub: {
      components: [GolfClubComponent],
      listen: {
        added: true,
        removed: true
      }
    },
    golfBall: {
      components: [GolfBallComponent],
      listen: {
        added: true,
        removed: true
      }
    },
    golfHole: {
      components: [GolfHoleComponent],
      listen: {
        added: true,
        removed: true
      }
    },
    golfTee: {
      components: [GolfTeeComponent],
      listen: {
        added: true,
        removed: true
      }
    },
    //
    // Ball States
    //

    ballHit: {
      components: [GolfBallComponent, Action.GameObjectCollisionTag],
      listen: {
        added: true,
        removed: true
      }
    },

    ballMoving: {
      components: [GolfBallComponent, GolfState.BallMoving],
      listen: {
        added: true,
        removed: true
      }
    },
    ballAlmostStopped: {
      components: [GolfBallComponent, GolfState.AlmostStopped],
      listen: {
        added: true,
        removed: true
      }
    },
    ballStopped: {
      components: [GolfBallComponent, GolfState.BallStopped],
      listen: {
        added: true,
        removed: true
      }
    },
    checkCourse: {
      components: [GolfBallComponent, GolfState.CheckCourse, GolfState.BallStopped],
      listen: {
        added: true,
        removed: true
      }
    },
    ballHidden: {
      components: [GolfBallComponent, GolfState.BallHidden],
      listen: {
        added: true,
        removed: true
      }
    },
    ballVisible: {
      components: [GolfBallComponent, GolfState.BallVisible],
      listen: {
        added: true,
        removed: true
      }
    },
    correctBallPosition: {
      components: [GolfBallComponent, GolfState.CorrectBallPosition],
      listen: {
        added: true,
        removed: true
      }
    },

    //
    // Club States
    //
    hit: {
      components: [GolfClubComponent, GolfState.Hit],
      listen: {
        added: true,
        removed: true
      }
    },
    clubHit: {
      components: [GolfClubComponent, Action.GameObjectCollisionTag],
      listen: {
        added: true,
        removed: true
      }
    },
    activeClub: {
      components: [GolfClubComponent, State.Active],
      listen: {
        added: true,
        removed: true
      }
    },
    inctiveClub: {
      components: [GolfClubComponent, State.Inactive],
      listen: {
        added: true,
        removed: true
      }
    },
    //
    // Turn States
    //
    waiting: {
      components: [GamePlayer, State.Waiting],
      listen: {
        added: true,
        removed: true
      }
    },
    yourTurn: {
      components: [GamePlayer, State.YourTurn],
      listen: {
        added: true,
        removed: true
      }
    },
    waitTurn: {
      components: [GamePlayer, State.WaitTurn],
      listen: {
        added: true,
        removed: true
      }
    },
    //
    // Hole States
    //
    holeHit: {
      components: [GolfHoleComponent, Action.GameObjectCollisionTag],
      listen: {
        added: true,
        removed: true
      }
    },
    goal: {
      components: [GamePlayer, GolfState.Goal],
      listen: {
        added: true,
        removed: true
      }
    },
    hitBallOnThisTurn: {
      components: [GamePlayer, GolfState.AlreadyHit],
      listen: {
        added: true,
        removed: true
      }
    }
  }
}
