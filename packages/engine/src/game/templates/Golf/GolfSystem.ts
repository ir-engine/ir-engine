import { isClient } from '../../../common/functions/isClient'
import { System, SystemAttributes } from '../../../ecs/classes/System'
import {
  addComponent,
  getComponent,
  hasComponent,
  removeComponent,
  getMutableComponent
} from '../../../ecs/functions/EntityFunctions'
import { SystemUpdateType } from '../../../ecs/functions/SystemUpdateType'
import { Network } from '../../../networking/classes/Network'
import { NetworkObject } from '../../../networking/components/NetworkObject'
import { NetworkObjectOwner } from '../../../networking/components/NetworkObjectOwner'
import { GameObject } from '../../components/GameObject'
import { GamePlayer } from '../../components/GamePlayer'
import { getGame, getRole, getUuid } from '../../functions/functions'
import { addStateComponent, removeStateComponent } from '../../functions/functionsState'
import { getStorage, initStorage, setStorage } from '../../functions/functionsStorage'
import { Action, State } from '../../types/GameComponents'
import { ifGetOut } from '../gameDefault/checkers/ifGetOut'
import { ifOwned } from '../gameDefault/checkers/ifOwned'
import { ifVelocity } from '../gameDefault/checkers/ifVelocity'
import { addHole } from './behaviors/addHole'
import { addRole } from './behaviors/addRole'
import { addTurn } from './behaviors/addTurn'
import { createYourTurnPanel } from './behaviors/createYourTurnPanel'
import { saveGoalScore } from './behaviors/displayScore'
import { getPositionNextPoint } from './behaviors/getPositionNextPoint'
import { hitBall } from './behaviors/hitBall'
import { nextTurn } from './behaviors/nextTurn'
import { initScore, saveScore } from './behaviors/saveScore'
import { setupOfflineDebug } from './behaviors/setupOfflineDebug'
import { setupPlayerAvatar, setupPlayerAvatarNotInVR, setupPlayerAvatarVR } from './behaviors/setupPlayerAvatar'
import { setupPlayerInput } from './behaviors/setupPlayerInput'
import { removeVelocity, teleportObject } from './behaviors/teleportObject'
import { teleportPlayerBehavior } from './behaviors/teleportPlayer'
import { GolfBallComponent } from './components/GolfBallComponent'
import { GolfClubComponent } from './components/GolfClubComponent'
import { GolfHoleComponent } from './components/GolfHoleComponent'
import { YourTurn } from './components/YourTurnTagComponent'
import { NewPlayerTagComponent } from './components/GolfTagComponents'
import { GolfTeeComponent } from './components/GolfTeeComponent'
import { initializeGolfBall, spawnBall, updateBall } from './prefab/GolfBallPrefab'
import { initializeGolfClub, spawnClub, updateClub, hideClub, enableClub } from './prefab/GolfClubPrefab'
import { initBallRaycast } from './behaviors/initBallRaycast'
import { ifFirstHit, ifOutCourse } from '../gameDefault/checkers/ifOutCourse'
import { registerGolfBotHooks } from './functions/registerGolfBotHooks'
import { XRInputSourceComponent } from '../../../character/components/XRInputSourceComponent'
import { hideBall, unhideBall } from './behaviors/hideUnhideBall'
import { LOGIN_USER_BY_GOOGLE_SUCCESS } from '../../../../../client-core'
/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/hexafield>
 */

export class GolfSystem extends System {
  static instance: GolfSystem
  updateType = SystemUpdateType.Fixed

  constructor(attributes: SystemAttributes = {}) {
    super(attributes)
    GolfSystem.instance = this

    if (isClient) registerGolfBotHooks()
  }

  /**
   * Executes the system. Called each frame by default from the Engine.
   * @param delta Time since last frame.
   */
  execute(delta: number, time: number): void {

    // DO ALL STATE LOGIC HERE (all queries)

    this.queryResults.player.all.forEach((entity) => {
      if (!hasComponent(entity, State.Active)) return

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
          initializeGolfClub(club)
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
          initializeGolfBall(ball)
          addStateComponent(ball, State.SpawnedObject)
        }
        if (getComponent(entity, GamePlayer).role === '1-Player') {
          addTurn(entity)
        }
      }
      
    })
    
    ///////////////////////////////////////////////////////////
    /////////////////// TURN STUFF ///////////////////////////
    ///////////////////////////////////////////////////////////
    // NEXT TURN
    this.queryResults.waiting.all.forEach((entity) => {
      if (this.queryResults.waiting.added.some(addedEntity => addedEntity.id === entity.id)) return;
      const playerComponent = getComponent(entity, GamePlayer);
      const ballEntity = playerComponent.ownedObjects['GolfBall'];
      if(!ballEntity) return;
      if (hasComponent(ballEntity, State.BallStopped) && hasComponent(ballEntity, State.Inactive)) {
        nextTurn(entity)
      }
    })
    // ADD WAITING
    this.queryResults.yourTurn.all.forEach((entity) => {
      if (this.queryResults.yourTurn.added.some(addedEntity => addedEntity.id === entity.id)) return;
      const playerComponent = getComponent(entity, GamePlayer);
      const ballEntity = playerComponent.ownedObjects['GolfBall'];
      if(!ballEntity) return;
      if (hasComponent(ballEntity, State.BallMoving) && hasComponent(entity, State.alreadyHit)) {
        removeStateComponent(entity, State.YourTurn);
        removeStateComponent(entity, State.alreadyHit);
        addStateComponent(entity, State.Waiting);
      }
    })

    ///////////////////////////////////////////////////////////
    /////////////////// BALL STUFF ///////////////////////////
    ///////////////////////////////////////////////////////////
    

    this.queryResults.golfBall.all.forEach((entity) => {
      if (!hasComponent(entity, State.SpawnedObject)) return;
      updateBall(entity, {}, delta)
    })
    // CHECK If Ball drop out of GameArea
    this.queryResults.ballMoving.all.forEach((entity) => {
      if (ifGetOut(entity, { area: 'GameArea' })) {
        teleportObject( entity, getPositionNextPoint(entity, { positionCopyFromRole: 'GolfTee-' }))
      }
    })
    // SWITCH STATE on ball start stopping
    this.queryResults.ballMoving.all.forEach((entity) => {
      if (ifVelocity(entity, { less: 0.001 })) {
        removeStateComponent(entity, State.BallMoving); addStateComponent(entity, State.AlmostStopped)
      }
    })
    // Remove velocity for full stopped ball
    this.queryResults.ballAlmostStopped.added.forEach((entity) => {
      removeVelocity(entity)
    })
    // SWITCH STATE from middle of moviong to stop or still moving
    this.queryResults.ballAlmostStopped.all.forEach((entity) => { 
     // This line not allow run this code if State was added in this frame.
     // if (this.queryResults.ballAlmostStopped.added.some(addedEntity => addedEntity.id === entity.id)) return;
      if (ifVelocity(entity, { more: 0.001 })) {
          removeStateComponent(entity, State.AlmostStopped); addStateComponent(entity, State.BallMoving)
      } else 
      if (ifVelocity(entity, { less: 0.0001 })) {
        removeStateComponent(entity, State.AlmostStopped); addStateComponent(entity, State.BallStopped);
      }
    })
    // CHECK If Ball drop out of course
    this.queryResults.ballStopped.added.forEach((entity) => {
      if (ifOutCourse(entity)) {
        teleportObject(entity, getPositionNextPoint(entity, { positionCopyFromRole: 'GolfTee-' }))

      }
    })
    // SWITCH STATE on ball if he start moving
    this.queryResults.ballStopped.all.forEach((entity) => {
      if (ifVelocity(entity, { more: 0.001 })) {
        removeStateComponent(entity, State.BallStopped); addStateComponent(entity, State.BallMoving)
      }
    })
 //
    // do ball Active on next Turn
    this.queryResults.yourTurn.added.forEach((entity) => {
      const playerComponent = getComponent(entity, GamePlayer);
      const ballEntity = playerComponent.ownedObjects['GolfBall'];
      removeStateComponent(ballEntity, State.Inactive)
      addStateComponent(ballEntity, State.Active)
    })
    
    // give Ball Inactive State for player cant hit Ball again in one game turn
    this.queryResults.waiting.added.forEach((entity) => {
      const playerComponent = getComponent(entity, GamePlayer);
      const ballEntity = playerComponent.ownedObjects['GolfBall'];
      removeStateComponent(ballEntity, State.Active)
      addStateComponent(ballEntity, State.Inactive)
    })

    // UnHide Ball on YourTurn
    this.queryResults.yourTurn.added.forEach((entity) => {
      const playerComponent = getComponent(entity, GamePlayer);
      const ballEntity = playerComponent.ownedObjects['GolfBall'];
      removeStateComponent(ballEntity, State.BallHidden);
      addStateComponent(ballEntity, State.BallVisible);
    })

    // Hide Ball on not YourTurn
    this.queryResults.waitTurn.added.forEach((entity) => {
      const playerComponent = getComponent(entity, GamePlayer);
      const ballEntity = playerComponent.ownedObjects['GolfBall'];
      removeStateComponent(ballEntity, State.BallVisible);
      addStateComponent(ballEntity, State.BallHidden);
    })

    this.queryResults.ballHidden.added.forEach((entity) => {
      if (isClient) {
        hideBall(entity)
      }
    })

    this.queryResults.ballVisible.added.forEach((entity) => {
      if (isClient) {
        unhideBall(entity)

      }
    })

    //////////////////////////////////////////////////////////
    //////////////////////// HOLE ////////////////////////////
    //////////////////////////////////////////////////////////

    this.queryResults.holeHit.added.forEach((holeEntity) => {
      this.queryResults.ballHit.all.forEach((ballEntity) => {
        const entityPlayer =
        Network.instance.networkObjects[getComponent(ballEntity, NetworkObjectOwner).networkId]?.component.entity
        const gameScore = getStorage(entityPlayer, { name: 'GameScore' });
        const game = getGame(entityPlayer)
        const currentHoleEntity = gameScore.score
              ? game.gameObjects['GolfHole'][gameScore.score.goal]
              : game.gameObjects['GolfHole'][0]
        if (currentHoleEntity) {
          addStateComponent(entityPlayer, State.Goal)
          saveGoalScore(entityPlayer)
          // its needed to revome action if action added from network, in normal case thay remmoving in place where thay adding
          removeComponent(holeEntity, Action.GameObjectCollisionTag)
          removeComponent(ballEntity, Action.GameObjectCollisionTag)
        }
     })
    })

    this.queryResults.goal.added.forEach((entity) => {
      const playerComponent = getComponent(entity, GamePlayer);
      const ballEntity = playerComponent.ownedObjects['GolfBall'];
      teleportPlayerBehavior(
        entity,
        getPositionNextPoint(entity, { positionCopyFromRole: 'GolfTee-' })
      )
      teleportObject(
        ballEntity,
        getPositionNextPoint(entity, { positionCopyFromRole: 'GolfTee-' })
      )
      removeStateComponent(entity, State.Goal);
    })
    ///////////////////////////////////////////////////////////
    /////////////////////// CLUB //////////////////////////////
    ///////////////////////////////////////////////////////////
    this.queryResults.golfClub.all.forEach((entity) => {
      if (!hasComponent(entity, State.SpawnedObject)) return;
      updateClub(entity, null, delta)
    })

    this.queryResults.clubHit.added.forEach((clubEntity) => {
      this.queryResults.ballHit.added.forEach((ballEntity) => {
        if (hasComponent(ballEntity, State.BallStopped) && hasComponent(ballEntity, State.Active)) {
          addStateComponent(clubEntity, State.Hit)
        }
     })
    })
 
    this.queryResults.hit.added.forEach((clubEntity) => {
      const ballEntity = this.queryResults.golfBall.all.find((e) => ifOwned(clubEntity, null, e))
      hitBall(clubEntity, { clubPowerMultiplier: 5, hitAdvanceFactor: 4 }, delta, ballEntity);
      removeStateComponent(clubEntity, State.Hit);
      // its needed to revome action if action added from network, in normal case thay remmoving in place where thay adding
      removeComponent(clubEntity, Action.GameObjectCollisionTag)
      removeComponent(ballEntity, Action.GameObjectCollisionTag)

    })

    this.queryResults.hit.removed.forEach((clubEntity) => {
      const playerEntity =
        Network.instance.networkObjects[getComponent(clubEntity, NetworkObjectOwner).networkId]?.component.entity
      saveScore(playerEntity);
      addStateComponent(playerEntity, State.alreadyHit); 
    })

    this.queryResults.yourTurn.added.forEach((entity) => {
      const playerComponent = getComponent(entity, GamePlayer);
      const entityClub = playerComponent.ownedObjects['GolfClub'];
      removeStateComponent(entityClub, State.Inactive);
      addStateComponent(entityClub, State.Active);
    })

    this.queryResults.waitTurn.added.forEach((entity) => {
      const playerComponent = getComponent(entity, GamePlayer);
      const entityClub = playerComponent.ownedObjects['GolfClub'];
      removeStateComponent(entityClub, State.Active);
      addStateComponent(entityClub, State.Inactive);
    })

    this.queryResults.activeClub.added.forEach((entity) => {
      if (isClient) {
        enableClub(entity, true )
      }
    })

    this.queryResults.inctiveClub.added.forEach((entity) => {
      if (isClient) {
        enableClub(entity, false)
      }
    })
    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////

    
    // DO ALL ECS LOGIC HERE (added and removed queries)
   
    this.queryResults.player.added.forEach((entity) => {
      // set up client side stuff
      setupPlayerInput(entity)
      createYourTurnPanel(entity)
      isClient && setupPlayerAvatar(entity)
      setupOfflineDebug(entity)
      
      // set up game logic
      addRole(entity)
      addStateComponent(entity, State.WaitTurn)
      addStateComponent(entity, State.Active)
      
      setStorage(entity, { name: 'GameScore' }, { score: { hits: 0, goal: 0 } })

      if (!isClient) {
        spawnClub(entity)
        spawnBall(entity, { positionCopyFromRole: 'GolfTee-0', offsetY: 0.3 })
      }
    })

    this.queryResults.gameObject.added.forEach((entity) => {
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
    })

    this.queryResults.golfClub.added.forEach((entity) => {
      addStateComponent(entity, State.Inactive)
    })

    this.queryResults.golfBall.added.forEach((entity) => {
      addStateComponent(entity, State.Active)
      addStateComponent(entity, State.AlmostStopped)
      addStateComponent(entity, State.BallHidden)
    })

    this.queryResults.golfHole.added.forEach((entity) => {
      addHole(entity)
    })

    if (isClient) {
      this.queryResults.playerVR.added.forEach((entity) => {
        setupPlayerAvatarVR(entity)
      })

      this.queryResults.playerVR.removed.forEach((entity) => {
        setupPlayerAvatarNotInVR(entity)
      })
    }
  }

  static queries = {
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
      components: [GolfBallComponent, Action.GameObjectCollisionTag ],
      listen: {
        added: true,
        removed: true
      }
    },

    ballMoving: {
      components: [GolfBallComponent, State.BallMoving],
      listen: {
        added: true,
        removed: true
      }
    },
    ballAlmostStopped: {
      components: [GolfBallComponent, State.AlmostStopped],
      listen: {
        added: true,
        removed: true
      }
    },
    ballStopped: {
      components: [GolfBallComponent, State.BallStopped],
      listen: {
        added: true,
        removed: true
      }
    },
    ballHidden: {
      components: [GolfBallComponent, State.BallHidden],
      listen: {
        added: true,
        removed: true
      }
    },
    ballVisible: {
      components: [GolfBallComponent, State.BallVisible],
      listen: {
        added: true,
        removed: true
      }
    },
    //
    // Club States
    //
    hit: {
      components: [GolfClubComponent, State.Hit],
      listen: {
        added: true,
        removed: true
      }
    },
    clubHit: {
      components: [GolfClubComponent, Action.GameObjectCollisionTag ],
      listen: {
        added: true,
        removed: true
      }
    },
    activeClub: {
      components: [GolfClubComponent, State.Active ],
      listen: {
        added: true,
        removed: true
      }
    },
    inctiveClub: {
      components: [GolfClubComponent, State.Inactive ],
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
      components: [GamePlayer, State.Goal],
      listen: {
        added: true,
        removed: true
      }
    },
    hitBallOnThisTurn: {
      components: [GamePlayer, State.alreadyHit],
      listen: {
        added: true,
        removed: true
      }
    }
  }
}
