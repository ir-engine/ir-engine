import { Engine } from '../../../ecs/classes/Engine'
import { defineQuery, defineSystem, enterQuery, exitQuery, Not, System } from '../../../ecs/bitecs'
import { ECSWorld } from '../../../ecs/classes/World'
import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { GolfAction, GolfActionType } from './GolfAction'
import { Network } from '../../../networking/classes/Network'
import { dispatchFromServer, dispatchFromClient } from '../../../networking/functions/dispatch'
import { createState, Downgraded } from '@hookstate/core'
import { ActionType } from '../../../networking/interfaces/NetworkTransport'
import { isClient } from '../../../common/functions/isClient'
import { GolfBallTagComponent, GolfClubTagComponent, GolfPrefabs } from './prefab/GolfGamePrefabs'
import { NetworkObjectComponent } from '../../../networking/components/NetworkObjectComponent'
import { getComponent, hasComponent, removeComponent } from '../../../ecs/functions/EntityFunctions'
import { AvatarComponent } from '../../../avatar/components/AvatarComponent'
import {
  BALL_STATES,
  initializeGolfBall,
  resetBall,
  setBallState,
  spawnBall,
  updateBall
} from './prefab/GolfBallPrefab'
import { enableClub, initializeGolfClub, spawnClub, updateClub } from './prefab/GolfClubPrefab'
import { SpawnNetworkObjectComponent } from '../../../scene/components/SpawnNetworkObjectComponent'
import { Entity } from '../../../ecs/classes/Entity'
import { GameObject } from '../../components/GameObject'
import { GolfClubComponent } from './components/GolfClubComponent'
import { setupPlayerInput } from './behaviors/setupPlayerInput'
import { registerGolfBotHooks } from './functions/registerGolfBotHooks'
import { getCurrentGolfPlayerEntity, getGolfPlayerNumber, isCurrentGolfPlayer } from './functions/golfFunctions'
import { hitBall } from './behaviors/hitBall'
import { GolfBallComponent } from './components/GolfBallComponent'
import { getCollisions } from '../../../physics/behaviors/getCollisions'
import { VelocityComponent } from '../../../physics/components/VelocityComponent'
import { GolfHoleComponent } from './components/GolfHoleComponent'
import { Vector3 } from 'three'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { isEntityLocalClient } from '../../../networking/functions/isEntityLocalClient'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/hexafield>
 * @author Gheric Speiginer <github.com/speigg>
 */

/**
 * A map of all game objects by role
 */
export const GolfObjectEntities = new Map<string, Entity>()

globalThis.GolfObjectEntities = GolfObjectEntities
/**
 *
 */
export const GolfState = createState({
  holes: [] as Array<{ par: number }>,
  players: [] as Array<{
    id: string
    scores: Array<number>
    stroke: number
    lastBallPosition: [number, number, number]
  }>,
  currentPlayer: 0,
  currentHole: 0
})

// Note: player numbers are 0-indexed

globalThis.GolfState = GolfState

export const GolfSystem = async (): Promise<System> => {
  if (isClient) {
    registerGolfBotHooks()
    // pre-cache the assets we need for this game
    await AssetLoader.loadAsync({ url: Engine.publicPath + '/models/golf/avatars/avatar_head.glb' })
    await AssetLoader.loadAsync({ url: Engine.publicPath + '/models/golf/avatars/avatar_hands.glb' })
    await AssetLoader.loadAsync({ url: Engine.publicPath + '/models/golf/avatars/avatar_torso.glb' })
    await AssetLoader.loadAsync({ url: Engine.publicPath + '/models/golf/golf_ball.glb' })
  }

  // add our prefabs - TODO: find a better way of doing this that doesn't pollute prefab namespace
  Object.entries(GolfPrefabs).forEach(([prefabType, prefab]) => {
    Network.instance.schema.prefabs.set(Number(prefabType), prefab)
  })

  // IMPORTANT : For FLUX pattern, consider state immutable outside a receptor
  function receptor(world: ECSWorld, action: GolfActionType) {
    console.log('\n\nACTION', action, 'CURRENT STATE', GolfState.attach(Downgraded).value, '\n\n')
    GolfState.batch((s) => {
      switch (action.type) {
        /**
         * on PLAYER_READY
         *   -
         */
        case 'puttclub.GAME_STATE': {
          s.merge(action.state)
          return
        }

        /**
         * On PLAYER_JOINED
         * - Add a player to player list (start at hole 0, scores at 0 for all holes)
         * - spawn golf club
         * - spawn golf ball
         */
        case 'puttclub.PLAYER_JOINED': {
          // this must happen on the server

          if (!isClient) {
            const playerAlreadyExists = s.players.find((p) => p.value.id === action.playerId)

            if (!playerAlreadyExists) {
              s.players.merge([
                {
                  id: action.playerId,
                  scores: [],
                  stroke: 0,
                  lastBallPosition: null
                }
              ])
              console.log(`player ${action.playerId} joined`)
            } else {
              console.log(`player ${action.playerId} rejoined`)
            }

            dispatchFromServer(GolfAction.sendState(s.attach(Downgraded).value))

            const { entity } = Object.values(Network.instance.networkObjects).find(
              (obj) => obj.uniqueId === action.playerId
            )

            // const playerNumber = getGolfPlayerNumber(entity)
            spawnBall(entity, GolfState.currentHole.value)
            spawnClub(entity)
          }
          return
        }

        /**
         * on PLAYER_READY
         *   -
         */
        case 'puttclub.PLAYER_READY': {
          //
          // if(isClient) {
          //   const currentPlayerEntity = getCurrentGolfPlayerEntity()
          //   if(isEntityLocalClient(currentPlayerEntity)) {
          //     const currentPlayerNumber = GolfState.currentPlayer.value
          //     const activeBallEntity = GolfObjectEntities.get(`GolfBall-${currentPlayerNumber}`)
          //     setBallState(activeBallEntity, BALL_STATES.WAITING)
          //   }
          // }
          // if the player
          if (action.playerId === s.players.value[s.currentPlayer.value].id) {
            dispatchFromServer(GolfAction.resetBall())
          }
          return
        }

        /**
         * on PLAYER_STROKE
         *   - Finish current hole for this player
         *   - players[currentPlayer].scores[currentHole] = player.stroke
         */
        case 'puttclub.PLAYER_STROKE': {
          s.players[s.currentPlayer.value].merge((s) => {
            return { stroke: s.stroke + 1 }
          })
          const currentPlayerNumber = GolfState.currentPlayer.value
          const activeBallEntity = GolfObjectEntities.get(`GolfBall-${currentPlayerNumber}`)
          setBallState(activeBallEntity, BALL_STATES.MOVING)
          return
        }

        /**
         * on BALL_STOPPED
         *   - Finish current hole for this player
         *   - players[currentPlayer].scores[currentHole] = player.stroke
         */
        case 'puttclub.BALL_STOPPED': {
          const currentPlayerNumber = GolfState.currentPlayer.value

          const entityBall = GolfObjectEntities.get(`GolfBall-${currentPlayerNumber}`)
          const ballTransform = getComponent(entityBall, TransformComponent)

          s.players[s.currentPlayer.value].merge((s) => {
            return { lastBallPosition: ballTransform.position.toArray() }
          })

          setBallState(entityBall, BALL_STATES.STOPPED)

          dispatchFromServer(GolfAction.nextTurn())
          return
        }

        /**
         * on NEXT_TURN
         *   - IF ball in hole
         *     - Finish current hole for this player
         *     - players[currentPlayer].scores[currentHole] = player.stroke
         *     - dispatch NEXT_HOLE
         *   - increment currentPlayer
         *   - hide old player's ball
         *   - show new player's ball
         */
        case 'puttclub.NEXT_TURN': {
          const currentPlayerNumber = s.currentPlayer.value
          const player = s.players[currentPlayerNumber]
          const entityHole = GolfObjectEntities.get(`GolfHole-${currentPlayerNumber}`)
          const entityBall = GolfObjectEntities.get(`GolfBall-${currentPlayerNumber}`)

          if (getCollisions(entityHole, GolfBallComponent).collisionEntity) {
            player.scores.merge({
              [s.currentHole.value]: player.stroke.value
            })
            player.stroke.set(0)
            dispatchFromServer(GolfAction.nextHole())
          }
          // TODO: get player with fewest number of holes completed
          // const currentHole = players.reduce(score.length) // or something

          setBallState(entityBall, BALL_STATES.INACTIVE)

          // get player with fewest number of strokes on that hole
          const nextPlayerNumber = s.currentPlayer.value === s.players.value.length - 1 ? 0 : s.currentPlayer.value + 1
          s.merge(() => {
            return { currentPlayer: nextPlayerNumber }
          })

          dispatchFromServer(GolfAction.resetBall())

          console.log(`it is now player ${nextPlayerNumber}'s turn`)
          return
        }

        /**
         * on NEXT_HOLE
         *   - currentHole = earliest hole that a player hasn’t completed yet
         *   - indicate new current hole
         *   - dispatch RESET_BALL
         */
        case 'puttclub.NEXT_HOLE': {
          holes: for (const [i] of s.holes.entries()) {
            const nextHole = i
            for (const p of s.players) {
              if (p.scores[i] === undefined) {
                s.currentHole.set(nextHole)
                break holes
              }
            }
          }
          dispatchFromServer(GolfAction.resetBall())
          return
        }

        /**
         * on RESET_BALL
         * - teleport ball
         */
        case 'puttclub.RESET_BALL': {
          const currentPlayerNumber = GolfState.currentPlayer.value

          if (s.players[s.currentPlayer.value].value.lastBallPosition === null) {
            const currentHole = GolfState.currentHole.value
            const teeEntity = GolfObjectEntities.get(`GolfTee-${currentHole}`)
            const lastBallPosition = getComponent(teeEntity, TransformComponent).position.toArray()
            s.players[s.currentPlayer.value].merge((s) => {
              return { lastBallPosition }
            })
          }

          const player = s.players[s.currentPlayer.value]

          const entityBall = GolfObjectEntities.get(`GolfBall-${currentPlayerNumber}`)
          if (typeof entityBall !== 'undefined') {
            resetBall(entityBall, player.lastBallPosition.value)
            setBallState(entityBall, BALL_STATES.WAITING)
          }

          return
        }
      }
    })
  }

  const playerQuery = defineQuery([AvatarComponent])
  const playerEnterQuery = enterQuery(playerQuery)
  const playerExitQuery = exitQuery(playerQuery)

  const playerSpawnedQuery = defineQuery([Not(SpawnNetworkObjectComponent), AvatarComponent])
  const playerSpawnedEnterQuery = enterQuery(playerSpawnedQuery)

  const gameObjectQuery = defineQuery([GameObject])
  const gameObjectEnterQuery = enterQuery(gameObjectQuery)

  const spawnGolfBallQuery = defineQuery([SpawnNetworkObjectComponent, GolfBallTagComponent])
  const spawnGolfClubQuery = defineQuery([SpawnNetworkObjectComponent, GolfClubTagComponent])

  const golfBallQuery = defineQuery([GolfBallComponent])

  const golfClubQuery = defineQuery([GolfClubComponent])
  const golfClubAddQuery = enterQuery(golfClubQuery)

  return defineSystem((world: ECSWorld) => {
    // runs on server & client:
    for (const action of Network.instance.incomingActions) receptor(world, action as any)

    const currentPlayer = GolfState.players[GolfState.currentPlayer.value].value

    const playerEnterQueryResults = playerEnterQuery(world)

    if (isClient) {
      for (const entity of golfClubQuery(world)) {
        updateClub(entity)

        const currentPlayerEntity = getCurrentGolfPlayerEntity()
        const networkObject = getComponent(currentPlayerEntity, NetworkObjectComponent)
        const currentPlayerNumber = GolfState.currentPlayer.value
        const entityBall = GolfObjectEntities.get(`GolfBall-${currentPlayerNumber}`)

        if (entityBall && getComponent(entityBall, NetworkObjectComponent).ownerId === networkObject.uniqueId) {
          const { collisionEntity } = getCollisions(entity, GolfBallComponent)
          if (collisionEntity !== null && collisionEntity === entityBall) {
            const golfBallComponent = getComponent(entityBall, GolfBallComponent)
            if (golfBallComponent.state === BALL_STATES.WAITING) {
              hitBall(entity, entityBall)
              setBallState(entityBall, BALL_STATES.MOVING)
              dispatchFromClient(GolfAction.playerStroke(networkObject.uniqueId))
            }
          }
        }
      }
    } else {
      for (const entity of playerEnterQueryResults) {
        const { ownerId } = getComponent(entity, NetworkObjectComponent)

        // Add a player to player list (start at hole 0, scores at 0 for all holes)
        dispatchFromServer(GolfAction.playerJoined(ownerId))
      }

      for (const entity of playerExitQuery(world)) {
        const { ownerId } = getComponent(entity, NetworkObjectComponent)
        console.log('player leave???')
        // if a player disconnects and it's their turn, change turns to the next player
        if (currentPlayer.id === ownerId) dispatchFromServer(GolfAction.nextTurn())
      }

      // if (ballOutOfBounds()) {
      //   dispatchOnServer(GolfAction.nextTurn())
      //   dispatchOnServer(GolfAction.resetBall())
      // }
    }

    for (const entity of playerSpawnedEnterQuery(world)) {
      setupPlayerInput(entity)
    }

    for (const entity of gameObjectEnterQuery(world)) {
      const { role } = getComponent(entity, GameObject)
      GolfObjectEntities.set(role, entity)
    }

    const currentPlayerNumber = GolfState.currentPlayer.value
    const activeBallEntity = GolfObjectEntities.get(`GolfBall-${currentPlayerNumber}`)
    if (activeBallEntity) {
      const golfBallComponent = getComponent(activeBallEntity, GolfBallComponent)
      updateBall(activeBallEntity)

      if (!isClient && golfBallComponent.state === BALL_STATES.MOVING) {
        const { velocity } = getComponent(activeBallEntity, VelocityComponent)
        const velMag = velocity.lengthSq()
        if (velMag > 0) console.log(velMag)
        if (velMag < 0.001) {
          console.log('ball stopped', getComponent(activeBallEntity, TransformComponent).position)
          setBallState(activeBallEntity, BALL_STATES.STOPPED)
          setTimeout(() => {
            dispatchFromServer(GolfAction.ballStopped(GolfState.players.value[GolfState.currentPlayer.value].id))
          }, 1000)
          // TODO add a ball stopped action to sync
        }
      }
    }

    /**
     * we use an plain query here in case the player and club/ball arrive at the client in the same frame,
     * as there can be a race condition between the two
     */
    for (const entity of spawnGolfBallQuery(world)) {
      const { ownerId } = getComponent(entity, NetworkObjectComponent)
      const ownerEntity = playerQuery(world).find((player) => {
        return getComponent(player, NetworkObjectComponent).uniqueId === ownerId
      })
      if (typeof ownerEntity !== 'undefined') {
        const playerNumber = getGolfPlayerNumber(ownerEntity)
        if (typeof playerNumber !== 'undefined') {
          const { parameters } = removeComponent(entity, SpawnNetworkObjectComponent)
          // removeComponent(entity, GolfBallTagComponent)
          initializeGolfBall(entity, playerNumber, ownerEntity, parameters)
          // if current player is owner entity
          if (GolfState.currentPlayer.value === playerNumber) {
            setBallState(entity, BALL_STATES.WAITING)
          } else {
            setBallState(entity, BALL_STATES.INACTIVE)
          }
        }
      }
    }

    for (const entity of spawnGolfClubQuery(world)) {
      const { ownerId } = getComponent(entity, NetworkObjectComponent)
      const ownerEntity = playerQuery(world).find((player) => {
        return getComponent(player, NetworkObjectComponent).uniqueId === ownerId
      })
      if (typeof ownerEntity !== 'undefined') {
        const playerNumber = getGolfPlayerNumber(ownerEntity)
        if (typeof playerNumber !== 'undefined') {
          const { parameters } = removeComponent(entity, SpawnNetworkObjectComponent)
          // removeComponent(entity, GolfClubTagComponent)
          initializeGolfClub(entity, playerNumber, ownerEntity)
          if (isEntityLocalClient(ownerEntity)) {
            console.log('i am ready')
            dispatchFromClient(GolfAction.playerReady(GolfState.players.value[playerNumber].id))
          }
        }
      }
    }

    return world
  })
}
