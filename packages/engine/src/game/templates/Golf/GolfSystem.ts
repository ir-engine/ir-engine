import { System, SystemAttributes } from '../../../ecs/classes/System'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/EntityFunctions'
import { SystemUpdateType } from '../../../ecs/functions/SystemUpdateType'
import { Network } from '../../../networking/classes/Network'
import { NetworkObjectOwner } from '../../../networking/components/NetworkObjectOwner'
import { GameObject } from '../../components/GameObject'
import { GamePlayer } from '../../components/GamePlayer'
import { getGame } from '../../functions/functions'
import { addStateComponent, removeStateComponent } from '../../functions/functionsState'
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
import { setupPlayerAvatar } from './behaviors/setupPlayerAvatar'
import { setupPlayerInput } from './behaviors/setupPlayerInput'
import { removeVelocity, teleportObject } from './behaviors/teleportObject'
import { teleportPlayerBehavior } from './behaviors/teleportPlayer'
import { GolfBallComponent } from './components/GolfBallComponent'
import { GolfClubComponent } from './components/GolfClubComponent'
import { GolfHoleComponent } from './components/GolfHoleComponent'
import { GolfTeeComponent } from './components/GolfTeeComponent'
import { spawnBall } from './prefab/GolfBallPrefab'
import { spawnClub, updateClub } from './prefab/GolfClubPrefab'

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
  }

  /**
   * Executes the system. Called each frame by default from the Engine.
   * @param delta Time since last frame.
   */
  execute(delta: number, time: number): void {
    const behaviorsToExecute: (() => void)[] = []

    this.queryResults.player.added.forEach((entity) => {
      behaviorsToExecute.push(() => {
        addRole(entity)
        // setupPlayerAvatar(entity)
        setupPlayerInput(entity)
        createYourTurnPanel(entity)
        setupOfflineDebug(entity)
        addStateComponent(entity, State.WaitTurn)
        spawnClub(entity)
        initScore(entity)
        if (getComponent(entity, GamePlayer).role === '1-Player') {
          addTurn(entity)
        }
      })
    })

    this.queryResults.gameObject.added.forEach((entity) => {
      behaviorsToExecute.push(() => {
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
    })

    this.queryResults.golfClub.added.forEach((entity) => {
      behaviorsToExecute.push(() => {
        addStateComponent(entity, State.SpawnedObject)
        addStateComponent(entity, State.Active)

        const ownerPlayerEntity =
          Network.instance.networkObjects[getComponent(entity, NetworkObjectOwner).networkId].component.entity
        const ownerGamePlayer = getComponent(ownerPlayerEntity, GamePlayer)

        ownerGamePlayer.ownedObjects['GolfClub'] = entity

        console.log('GOLF CLUB')
      })
    })

    if (this.queryResults.golfBall.added.length) console.log('GOLF BALL', this.queryResults.golfBall.added)
    this.queryResults.golfBall.added.forEach((entity) => {
      behaviorsToExecute.push(() => {
        addStateComponent(entity, State.SpawnedObject)
        addStateComponent(entity, State.NotReady)
        addStateComponent(entity, State.Active)
        addStateComponent(entity, State.BallMoving)

        const ownerPlayerEntity =
          Network.instance.networkObjects[getComponent(entity, NetworkObjectOwner).networkId].component.entity
        const ownerGamePlayer = getComponent(ownerPlayerEntity, GamePlayer)

        ownerGamePlayer.ownedObjects['GolfBall'] = entity
        console.log('GOLF BALL')
      })
    })

    this.queryResults.golfHole.added.forEach((entity) => {
      behaviorsToExecute.push(() => {
        console.log('golf hole added')
        addHole(entity)
      })
    })

    this.queryResults.golfTee.added.forEach((entity) => {
      behaviorsToExecute.push(() => {
        console.log('golf tee added')
      })
    })

    this.queryResults.golfBall.removed.forEach((entity) => {
      console.log('golf ball remove added')
    })

    // gamePlayerRoles
    this.queryResults.player.all.forEach((entity) => {
      const playerComponent = getComponent(entity, GamePlayer)

      const clubEntity = playerComponent.ownedObjects['GolfClub']
      const ballEntity = playerComponent.ownedObjects['GolfBall']

      const gameScore = getStorage(entity, { name: 'GameScore' })
      const game = getGame(entity)

      if (hasComponent(entity, State.YourTurn)) {
        // If the player does not have a ball, spawn one
        // TODO: refactor, we shouldn't have to check this each frame

        // gamePlayerRoles.1-Player.spawnBall
        if (doesPlayerHaveGameObject(entity, { on: 'self', objectRoleName: 'GolfBall', invert: true })) {
          behaviorsToExecute.push(() => {
            spawnBall(entity, { positionCopyFromRole: 'GolfTee-0', offsetY: 1 })
          })
        }

        // If the ball and the club have collided, add the hit state

        // gamePlayerRoles.1-Player.HitBall
        if (clubEntity && ballEntity) {
          if (hasComponent(clubEntity, Action.GameObjectCollisionTag)) {
            if (!hasComponent(clubEntity, State.Hit)) {
              if (ifVelocity(entity, { on: 'target', component: GolfClubComponent, more: 0.01, less: 1 }, clubEntity)) {
                if (
                  hasComponent(ballEntity, Action.GameObjectCollisionTag) &&
                  hasComponent(ballEntity, State.BallStopped) &&
                  hasComponent(ballEntity, State.Ready) &&
                  hasComponent(ballEntity, State.Active)
                ) {
                  behaviorsToExecute.push(() => {
                    removeStateComponent(ballEntity, Action.GameObjectCollisionTag)
                    removeStateComponent(clubEntity, Action.GameObjectCollisionTag)
                    addStateComponent(clubEntity, State.addedHit)
                  })
                }
              }
            }
          }
        }
      }

      // If the ball and the hole have collided, add the goal state
      // gamePlayerRoles.1-Player.Goal
      if (ballEntity) {
        if (hasComponent(entity, State.Waiting)) {
          if (dontHasState(entity, { stateComponent: State.Goal })) {
            if (hasComponent(ballEntity, Action.GameObjectCollisionTag) && hasComponent(ballEntity, State.Ready)) {
              const currentHoleEntity = gameScore.score
                ? game.gameObjects['GolfHole-' + gameScore.score.goal][0]
                : undefined
              if (hasComponent(currentHoleEntity, Action.GameObjectCollisionTag)) {
                behaviorsToExecute.push(() => {
                  removeStateComponent(ballEntity, Action.GameObjectCollisionTag)
                  removeStateComponent(entity, Action.GameObjectCollisionTag)
                  addStateComponent(entity, State.addedGoal)
                })
              }
            }
          }
        }

        // gamePlayerRoles.1-Player.Goal
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
              getPositionNextPoint(entity, { on: 'self', positionCopyFromRole: 'GolfTee-', position: null })
            )
            teleportObject(
              entity,
              getPositionNextPoint(
                entity,
                { on: 'target', positionCopyFromRole: 'GolfTee-', position: null },
                ballEntity
              ),
              delta,
              ballEntity
            )
            removeStateComponent(entity, State.Goal)
          })
        }

        // gamePlayerRoles.1-Player.updateTurn
        // give Ball Inactive State for player cant hit Ball again in one game turn
        if (hasComponent(entity, State.Waiting)) {
          if (hasComponent(ballEntity, State.Active) && hasComponent(ballEntity, State.BallMoving)) {
            behaviorsToExecute.push(() => {
              removeStateComponent(ballEntity, State.Active)
              addStateComponent(ballEntity, State.Inactive)
            })
          }

          if (hasComponent(ballEntity, State.Active) && hasComponent(ballEntity, State.BallMoving)) {
            behaviorsToExecute.push(() => {
              nextTurn(entity)
            })
          }
        }

        // do ball Active on next Turn
        if (hasComponent(entity, State.YourTurn)) {
          if (ballEntity)
            if (hasComponent(ballEntity, State.addedHit)) {
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

    // gameObjectRoles.GolfBall
    this.queryResults.golfBall.all.forEach((entity) => {
      // gameObjectRoles.GolfBall.checkIfFlyingOut
      if (ifGetOut(entity, { area: 'GameArea' })) {
        behaviorsToExecute.push(() => {
          teleportObject(
            entity,
            getPositionNextPoint(entity, { on: 'self', positionCopyFromRole: 'GolfTee-', position: null })
          )
        })
      }
      // gameObjectRoles.GolfBall.update
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
  }

  static queries = {
    player: {
      components: [GamePlayer],
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
