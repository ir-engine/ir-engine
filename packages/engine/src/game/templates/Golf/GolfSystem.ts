import { Entity } from '../../../ecs/classes/Entity'
import { System, SystemAttributes } from '../../../ecs/classes/System'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/EntityFunctions'
import { SystemUpdateType } from '../../../ecs/functions/SystemUpdateType'
import { Network } from '../../../networking/classes/Network'
import { NetworkObjectOwner } from '../../../networking/components/NetworkObjectOwner'
import { Game } from '../../components/Game'
import { GameObject } from '../../components/GameObject'
import { GamePlayer } from '../../components/GamePlayer'
import { getGame } from '../../functions/functions'
import { addStateComponent, removeStateComponent } from '../../functions/functionsState'
import { getStorage } from '../../functions/functionsStorage'
import { Action, State } from '../../types/GameComponents'
import { addState, removeState, switchState } from '../gameDefault/behaviors/switchState'
import { doesPlayerHaveGameObject } from '../gameDefault/checkers/doesPlayerHaveGameObject'
import { dontHasState } from '../gameDefault/checkers/dontHasState'
import { hasState } from '../gameDefault/checkers/hasState'
import { ifVelocity } from '../gameDefault/checkers/ifVelocity'
import { addRole } from './behaviors/addRole'
import { addTurn } from './behaviors/addTurn'
import { createYourTurnPanel } from './behaviors/createYourTurnPanel'
import { saveGoalScore } from './behaviors/displayScore'
import { getPositionNextPoint } from './behaviors/getPositionNextPoint'
import { hitBall } from './behaviors/hitBall'
import { nextTurn } from './behaviors/nextTurn'
import { initScore } from './behaviors/saveScore'
import { setupOfflineDebug } from './behaviors/setupOfflineDebug'
import { setupPlayerAvatar } from './behaviors/setupPlayerAvatar'
import { setupPlayerInput } from './behaviors/setupPlayerInput'
import { teleportObject } from './behaviors/teleportObject'
import { teleportPlayerBehavior } from './behaviors/teleportPlayer'
import { GolfBallComponent } from './components/GolfBallComponent'
import { GolfClubComponent } from './components/GolfClubComponent'
import { NewPlayerTagComponent } from './components/GolfTagComponents'
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

  /** Removes resize listener. */
  dispose(): void {
    super.dispose()
  }

  /**
   * Executes the system. Called each frame by default from the Engine.
   * @param delta Time since last frame.
   */
  execute(delta: number, time: number): void {
    const behaviorsToExecute: (() => void)[] = []

    // initGameState.newPlayer
    this.queryResults.newPlayer.added.forEach((entity) => {
      behaviorsToExecute.push(() => {
        addRole(entity)
        setupPlayerAvatar(entity)
        setupPlayerInput(entity)
        createYourTurnPanel(entity)
        setupOfflineDebug(entity)
      })
    })

    this.queryResults.player.added.forEach((entity) => {
      behaviorsToExecute.push(() => {
        addComponent(entity, State.WaitTurn)
        spawnClub(entity)
        initScore(entity)
        if (getComponent(entity, GamePlayer).role === '1-Player') {
          addTurn(entity)
        }
      })
    })

    // initGameState.GolfClub
    this.queryResults.golfClub.added.forEach((entity) => {
      console.log('golf club added')
      behaviorsToExecute.push(() => {
        addComponent(entity, State.SpawnedObject)
        addComponent(entity, State.Active)

        const ownerPlayerEntity =
          Network.instance.networkObjects[getComponent(entity, NetworkObjectOwner).networkId].component.entity
        const ownerGamePlayer = getComponent(ownerPlayerEntity, GamePlayer)

        ownerGamePlayer.ownedObjects['GolfClub'] = entity

        console.log('GOLF CLUB')
      })
    })

    this.queryResults.golfBall.added.forEach((entity) => {
      console.log('golf ball added')
      behaviorsToExecute.push(() => {
        addComponent(entity, State.SpawnedObject)
        addComponent(entity, State.NotReady)
        addComponent(entity, State.Active)
        addComponent(entity, State.BallMoving)

        const ownerPlayerEntity =
          Network.instance.networkObjects[getComponent(entity, NetworkObjectOwner).networkId].component.entity
        const ownerGamePlayer = getComponent(ownerPlayerEntity, GamePlayer)

        ownerGamePlayer.ownedObjects['GolfBall'] = entity
        console.log('GOLF BALL')
      })
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
    // gameObjectRoles.GolfClub
    // this.queryResults.golfClub.all.forEach((entity) => {

    //   // gameObjectRoles.GolfClub.update
    //   executeComplexResult.push({
    //     updateClub,
    //     entity
    //   })

    //   // gameObjectRoles.GolfClub.hitBall
    //   if(hasComponent(entity, State.addedHit)) {
    //     const clubOwnerPlayerEntity: Entity = getComponent(entity, GameObjectOwner).owner
    //     const entityBall: Entity = getComponent(clubOwnerPlayerEntity, GolfPlayerComponent).ball
    //     if(hasState(entity, { stateComponent: State.Active })) {
    //       executeComplexResult.push({
    //         hitBall,
    //         entity,
    //         args: { clubPowerMultiplier: 5, hitAdvanceFactor: 4 },
    //         entityOther: entityBall,
    //       })
    //     }
    //   }
    // })

    behaviorsToExecute.forEach((v) => v())
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
    golfClub: {
      components: [GameObject, GolfClubComponent],
      listen: {
        added: true,
        removed: true
      }
    },
    golfBall: {
      components: [GameObject, GolfBallComponent],
      listen: {
        added: true,
        removed: true
      }
    }
  }
}
