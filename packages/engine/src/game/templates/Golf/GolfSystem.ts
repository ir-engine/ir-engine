import { isClient } from '../../../common/functions/isClient'
import { System, SystemAttributes } from '../../../ecs/classes/System'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../../ecs/functions/EntityFunctions'
import { SystemUpdateType } from '../../../ecs/functions/SystemUpdateType'
import { Network } from '../../../networking/classes/Network'
import { NetworkObject } from '../../../networking/components/NetworkObject'
import { NetworkObjectOwner } from '../../../networking/components/NetworkObjectOwner'
import { Game } from '../../components/Game'
import { GameObject } from '../../components/GameObject'
import { GamePlayer } from '../../components/GamePlayer'
import { getGame } from '../../functions/functions'
import { addStateComponent, removeStateComponent, sendState } from '../../functions/functionsState'
import { getStorage } from '../../functions/functionsStorage'
import { Action, State } from '../../types/GameComponents'
import { doesPlayerHaveGameObject } from '../gameDefault/checkers/doesPlayerHaveGameObject'
import { dontHasState } from '../gameDefault/checkers/dontHasState'
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
import { NewPlayerTagComponent } from './components/GolfTagComponents'
import { GolfTeeComponent } from './components/GolfTeeComponent'
import { spawnBall, updateBall } from './prefab/GolfBallPrefab'
import { spawnClub, updateClub } from './prefab/GolfClubPrefab'
import { initBallRaycast } from './behaviors/initBallRaycast'
import { ifFirstHit, ifOutCourse } from '../gameDefault/checkers/ifOutCourse'
import { registerGolfBotHooks } from './functions/registerGolfBotHooks'
import { XRInputSourceComponent } from '../../../character/components/XRInputSourceComponent'
/**
 *
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
    const behaviorsToExecute: (() => void)[] = []

    // DO ALL STATE LOGIC HERE (all queries)

    this.queryResults.player.all.forEach((entity) => {
      const playerComponent = getComponent(entity, GamePlayer)

      const clubEntity = playerComponent.ownedObjects['GolfClub']
      const ballEntity = playerComponent.ownedObjects['GolfBall']

      // not initialised yet
      if (!clubEntity) return

      const gameScore = getStorage(entity, { name: 'GameScore' })
      const game = getGame(entity)

      if (hasComponent(entity, State.YourTurn)) {
        // If the player does not have a ball, spawn one
        // TODO: refactor, we shouldn't have to check this each frame

        if (doesPlayerHaveGameObject(entity, { on: 'self', objectRoleName: 'GolfBall', invert: true })) {
          behaviorsToExecute.push(() => {
            spawnBall(entity, { positionCopyFromRole: 'GolfTee-0', offsetY: 1 })
          })
        }

        // If the ball and the club have collided, add the hit state

        if (clubEntity && ballEntity) {
          if (hasComponent(clubEntity, Action.GameObjectCollisionTag)) {
            if (!hasComponent(clubEntity, State.Hit)) {
              if (ifVelocity(clubEntity, { component: GolfClubComponent, more: 0.01, less: 1 })) {
                if (
                  hasComponent(ballEntity, Action.GameObjectCollisionTag) &&
                  hasComponent(ballEntity, State.BallStopped) &&
                  hasComponent(ballEntity, State.Ready) &&
                  hasComponent(ballEntity, State.Active)
                ) {
                  behaviorsToExecute.push(() => {
                    removeComponent(ballEntity, Action.GameObjectCollisionTag)
                    removeComponent(clubEntity, Action.GameObjectCollisionTag)
                    addStateComponent(clubEntity, State.addedHit)
                  })
                }
              }
            }
          }
        }
      }

      // If the ball and the hole have collided, add the goal state
      if (ballEntity) {
        if (hasComponent(entity, State.Waiting)) {
          if (!hasComponent(entity, State.Goal)) {
            if (hasComponent(ballEntity, Action.GameObjectCollisionTag) && hasComponent(ballEntity, State.Ready)) {
              const currentHoleEntity = gameScore.score
                ? game.gameObjects['GolfHole'][gameScore.score.goal]
                : game.gameObjects['GolfHole'][0]
              if (currentHoleEntity && hasComponent(currentHoleEntity, Action.GameObjectCollisionTag)) {
                behaviorsToExecute.push(() => {
                  removeComponent(ballEntity, Action.GameObjectCollisionTag)
                  removeComponent(currentHoleEntity, Action.GameObjectCollisionTag)
                  addStateComponent(entity, State.addedGoal)
                })
              }
            }
          }
        }

        if (hasComponent(entity, State.addedGoal)) {
          behaviorsToExecute.push(() => {
            saveGoalScore(entity)

            removeStateComponent(entity, State.addedGoal)
            addStateComponent(entity, State.Goal)

            removeStateComponent(ballEntity, State.Ready)
            addStateComponent(ballEntity, State.NotReady)
          })
        }

        if (hasComponent(entity, State.Goal)) {
          behaviorsToExecute.push(() => {
            teleportPlayerBehavior(
              entity,
              getPositionNextPoint(entity, { positionCopyFromRole: 'GolfTee-', position: null })
            )
            teleportObject(
              ballEntity,
              getPositionNextPoint(entity, { positionCopyFromRole: 'GolfTee-', position: null })
            )
            removeStateComponent(entity, State.Goal)
          })
        }

        // give Ball Inactive State for player cant hit Ball again in one game turn
        if (hasComponent(entity, State.Waiting)) {
          if (hasComponent(ballEntity, State.Active) && hasComponent(ballEntity, State.BallMoving)) {
            behaviorsToExecute.push(() => {
              removeStateComponent(ballEntity, State.Active)
              addStateComponent(ballEntity, State.Inactive)
            })
          }

          if (hasComponent(ballEntity, State.Inactive) && hasComponent(ballEntity, State.BallStopped)) {
            behaviorsToExecute.push(() => {
              nextTurn(entity)
            })
          }
        }

        // do ball Active on next Turn
        if (hasComponent(entity, State.YourTurn)) {
          if (hasComponent(clubEntity, State.addedHit)) {
            behaviorsToExecute.push(() => {
              removeStateComponent(entity, State.YourTurn)
              addStateComponent(entity, State.Waiting)
            })
          }

          if (hasComponent(ballEntity, State.BallStopped) && hasComponent(ballEntity, State.Inactive)) {
            behaviorsToExecute.push(() => {
              removeStateComponent(ballEntity, State.Inactive)
              addStateComponent(ballEntity, State.Active)
            })
          }
        }
      }
    })

    this.queryResults.golfBall.all.forEach((entity) => {
      behaviorsToExecute.push(() => {
        updateBall(entity, {}, delta)
      })
      if (ifGetOut(entity, { area: 'GameArea' })) {
        behaviorsToExecute.push(() => {
          const ownerEntity =
            Network.instance.networkObjects[getComponent(entity, NetworkObjectOwner).networkId].component.entity
          teleportObject(
            entity,
            getPositionNextPoint(ownerEntity, { positionCopyFromRole: 'GolfTee-', position: null })
          )
        })
      }
      if (hasComponent(entity, State.BallStopped) && ifVelocity(entity, { less: 0.001 }) && ifOutCourse(entity)) {
        const ownerEntity =
          Network.instance.networkObjects[getComponent(entity, NetworkObjectOwner).networkId].component.entity
        teleportObject(entity, getPositionNextPoint(ownerEntity, { positionCopyFromRole: 'GolfTee-', position: null }))
      }
      if (ifVelocity(entity, { more: 0.01 })) {
        if (hasComponent(entity, State.Ready)) {
          behaviorsToExecute.push(() => {
            removeStateComponent(entity, State.BallStopped)
            addStateComponent(entity, State.BallMoving)
          })
        }
      }

      if (ifVelocity(entity, { less: 0.001 })) {
        behaviorsToExecute.push(() => {
          removeStateComponent(entity, State.BallMoving)
          addStateComponent(entity, State.BallStopped)
        })
      }

      if (ifVelocity(entity, { more: 0.001 })) {
        if (hasComponent(entity, State.BallStopped) && hasComponent(entity, State.Inactive)) {
          behaviorsToExecute.push(() => {
            removeVelocity(entity)
          })
        }
      }
      if (ifVelocity(entity, { less: 0.0001 })) {
        if (hasComponent(entity, State.BallStopped)) {
          behaviorsToExecute.push(() => {
            removeStateComponent(entity, State.NotReady)
            addStateComponent(entity, State.Ready)
          })
        }
      }
    })

    this.queryResults.golfHole.all.forEach((entity) => {})

    this.queryResults.golfClub.all.forEach((entity) => {
      behaviorsToExecute.push(() => {
        updateClub(entity)
      })
      if (hasComponent(entity, State.addedHit)) {
        const ballEntity = this.queryResults.golfBall.all.find((e) => {
          return hasComponent(e, State.Active)
        })
        if (ballEntity) {
          behaviorsToExecute.push(() => {
            hitBall(entity, { clubPowerMultiplier: 5, hitAdvanceFactor: 4 }, delta, ballEntity)
          })
        }
        behaviorsToExecute.push(() => {
          removeStateComponent(entity, State.addedHit)
          addStateComponent(entity, State.Hit)
        })
        const playerEntity = this.queryResults.player.all.find((e) => {
          return ifOwned(e, undefined, entity)
        })
        behaviorsToExecute.push(() => {
          saveScore(playerEntity)
        })
      }
      if (hasComponent(entity, State.Hit)) {
        behaviorsToExecute.push(() => {
          removeStateComponent(entity, State.Hit)
        })
      }
    })

    behaviorsToExecute.forEach((v) => v())

    // DO ALL ECS LOGIC HERE (added and removed queries)

    this.queryResults.newPlayer.added.forEach((entity) => {
      const newPlayer = getComponent(entity, NewPlayerTagComponent)
      addComponent(entity, GamePlayer, {
        gameName: newPlayer.gameName,
        role: 'newPlayer',
        uuid: getComponent(entity, NetworkObject).ownerId
      })
      addRole(entity)
      removeComponent(entity, NewPlayerTagComponent)
      isClient && setupPlayerAvatar(entity)
      setupPlayerInput(entity)
      createYourTurnPanel(entity)
      setupOfflineDebug(entity)
      addStateComponent(entity, State.WaitTurn)
    })

    this.queryResults.player.added.forEach((entity) => {
      !isClient && spawnClub(entity)
      initScore(entity)
      if (getComponent(entity, GamePlayer).role === '1-Player') {
        addTurn(entity)
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
      addStateComponent(entity, State.SpawnedObject)
      addStateComponent(entity, State.Active)

      const ownerPlayerEntity =
        Network.instance.networkObjects[getComponent(entity, NetworkObjectOwner).networkId].component.entity
      const ownerGamePlayer = getComponent(ownerPlayerEntity, GamePlayer)

      // ownerGamePlayer.ownedObjects['GolfClub'] = entity
    })

    this.queryResults.golfBall.added.forEach((entity) => {
      addStateComponent(entity, State.SpawnedObject)
      addStateComponent(entity, State.NotReady)
      addStateComponent(entity, State.Active)
      addStateComponent(entity, State.BallMoving)

      const ownerPlayerEntity =
        Network.instance.networkObjects[getComponent(entity, NetworkObjectOwner).networkId].component.entity
      const ownerGamePlayer = getComponent(ownerPlayerEntity, GamePlayer)

      // ownerGamePlayer.ownedObjects['GolfBall'] = entity

      initBallRaycast(entity)
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
    newPlayer: {
      components: [NewPlayerTagComponent],
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
    }
  }
}
