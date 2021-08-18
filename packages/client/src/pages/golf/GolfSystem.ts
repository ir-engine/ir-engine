import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { defineQuery, defineSystem, enterQuery, exitQuery, Not, System, pipe } from '@xrengine/engine/src/ecs/bitecs'
import { ECSWorld } from '@xrengine/engine/src/ecs/classes/World'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { GolfAction, GolfActionType } from './GolfAction'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { dispatchFromServer, dispatchFromClient } from '@xrengine/engine/src/networking/functions/dispatch'
import { createState, Downgraded } from '@hookstate/core'
import { isClient } from '@xrengine/engine/src/common/functions/isClient'
import { GolfBallTagComponent, GolfClubTagComponent, GolfPrefabs } from './prefab/GolfGamePrefabs'
import { NetworkObjectComponent } from '@xrengine/engine/src/networking/components/NetworkObjectComponent'
import {
  addComponent,
  getComponent,
  removeComponent,
  removeEntity
} from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import {
  BALL_STATES,
  initializeGolfBall,
  resetBall,
  setBallState,
  spawnBall,
  updateBall
} from './prefab/GolfBallPrefab'
import { enableClub, initializeGolfClub, spawnClub, updateClub } from './prefab/GolfClubPrefab'
import { SpawnNetworkObjectComponent } from '@xrengine/engine/src/scene/components/SpawnNetworkObjectComponent'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { GolfClubComponent } from './components/GolfClubComponent'
import { setupPlayerInput } from './functions/setupPlayerInput'
import { registerGolfBotHooks } from './functions/registerGolfBotHooks'
import { getCurrentGolfPlayerEntity, getGolfPlayerNumber, isCurrentGolfPlayer } from './functions/golfFunctions'
import { hitBall } from './functions/hitBall'
import { GolfBallComponent } from './components/GolfBallComponent'
import { getCollisions } from '@xrengine/engine/src/physics/functions/getCollisions'
import { VelocityComponent } from '@xrengine/engine/src/physics/components/VelocityComponent'
import { GolfHoleComponent } from './components/GolfHoleComponent'
import { Vector3 } from 'three'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { isEntityLocalClient } from '@xrengine/engine/src/networking/functions/isEntityLocalClient'
import { useState } from '@hookstate/core'
import { createNetworkPlayerUI } from './GolfPlayerUISystem'
import { getPlayerNumber } from './functions/golfBotHookFunctions'
import { GolfTeeComponent } from './components/GolfTeeComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'

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
  }>,
  currentPlayer: 0,
  currentHole: 0
})

export function useGolfState() {
  return useState(GolfState)
}

const getTeePosition = (currentHole: number) => {
  const teeEntity = GolfObjectEntities.get(`GolfTee-${currentHole}`)
  return getComponent(teeEntity, TransformComponent).position.toArray()
}

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
                  stroke: 0
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
         *   - IF player is current player, reset their ball position to the current tee
         */
        case 'puttclub.PLAYER_READY': {
          if (s.players.value.length && action.playerId === s.players.value[s.currentPlayer.value].id) {
            dispatchFromServer(
              GolfAction.resetBall(s.players.value[s.currentPlayer.value].id, getTeePosition(s.currentHole.value))
            )
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
          setBallState(entityBall, action.inHole ? BALL_STATES.IN_HOLE : BALL_STATES.STOPPED)
          if (isClient) {
            const teePosition = getTeePosition(s.currentHole.value)
            const position = action.outOfBounds ? teePosition : action.position
            resetBall(entityBall, position)
          }

          setTimeout(() => {
            dispatchFromServer(GolfAction.nextTurn())
          }, 1000)
          return
        }

        /**
         * on NEXT_TURN
         *   - next player is first of reduce(players => ball not in hole)
         *   - IF all balls in hole
         *     - Finish current hole for this player
         *     - players[currentPlayer].scores[currentHole] = player.stroke
         *     - IF all players have finished the current hole
         *       - dispatch NEXT_HOLE
         *   - ELSE
         *     - increment currentPlayer
         *     - hide old player's ball
         *     - show new player's ball
         */
        case 'puttclub.NEXT_TURN': {
          const currentPlayerNumber = s.currentPlayer.value
          const currentPlayer = s.players[currentPlayerNumber]
          const entityBall = GolfObjectEntities.get(`GolfBall-${currentPlayerNumber}`)
          const currentHole = GolfState.currentHole.value
          const entityHole = GolfObjectEntities.get(`GolfHole-${currentHole}`)

          // if hole in ball or player has had too many shots, finish their round
          if (
            getComponent(entityBall, GolfBallComponent).state === BALL_STATES.IN_HOLE ||
            currentPlayer.stroke.value > 5 /**s.holes.value[s.currentHole].par.value + 3*/
          ) {
            console.log('=== PLAYER FINISHED HOLE')
            currentPlayer.scores.set([...currentPlayer.scores.value, currentPlayer.stroke.value])
          }

          setBallState(entityBall, BALL_STATES.INACTIVE)

          // TODO: get player with fewest number of holes completed
          // const currentHole = s.players.reduce(() => {
          //   score.length
          // }, [score]) // or something

          const getPlayersYetToFinishRound = () => {
            const currentHole = s.currentHole.value
            const players = []
            for (const p of s.players.value) {
              // if player has finished less holes than the current hole index
              if (p.scores.length <= currentHole) players.push(p)
            }
            return players.concat(players) // concat so it wraps to players prior to the current player
          }

          // get players who haven't finished yet
          const playersYetToFinishRound = getPlayersYetToFinishRound()

          let hasWrapped = false
          const nextPlayer = playersYetToFinishRound.find((p, i) => {
            // get player number from index of p in all players
            const playerNumber = s.players.findIndex((player) => player.value.id === p.id)
            if (hasWrapped) return true
            if (i >= playersYetToFinishRound.length / 2 - 1) {
              hasWrapped = true
            }
            return playerNumber > currentPlayerNumber
          })

          // if we have a next player, increment the current player and change turns
          if (typeof nextPlayer !== 'undefined') {
            const nextPlayerNumber = s.players.findIndex((player) => player.value.id === nextPlayer.id)
            s.currentPlayer.set(nextPlayerNumber)

            // the ball might be in the old hole still
            if (nextPlayer.stroke === 0) {
              dispatchFromServer(GolfAction.resetBall(nextPlayer.id, getTeePosition(s.currentHole.value)))
            }

            const nextBallEntity = GolfObjectEntities.get(`GolfBall-${nextPlayerNumber}`)
            setBallState(nextBallEntity, BALL_STATES.WAITING)

            console.log(`it is now player ${nextPlayerNumber}'s turn`)
          } else {
            // if not, the round has finished
            dispatchFromServer(GolfAction.nextHole())
          }

          return
        }

        /**
         * on NEXT_HOLE
         *   - currentHole = earliest hole that a player hasn’t completed yet
         *   - indicate new current hole
         *   - dispatch RESET_BALL
         */
        case 'puttclub.NEXT_HOLE': {
          // TODO Increment hole based on the next one with no scores
          // holes: for (const [i] of s.holes.entries()) {
          //   const nextHole = i
          //   for (const p of s.players) {
          //     if (p.scores[i] === undefined) {
          //       s.currentHole.set(nextHole)
          //       console.log('incremented hole')
          //       break holes
          //     }
          //   }
          // }
          s.currentHole.set(s.currentHole.value + 1)
          // Set all player strokes to 0
          for (const [i, p] of s.players.entries()) {
            p.stroke.set(0)
            // reset all ball position to the new tee
          }

          // set current player to the first player
          s.currentPlayer.set(0)
          dispatchFromServer(GolfAction.resetBall(s.players[0].id.value, getTeePosition(s.currentHole.value)))

          //
          return
        }

        /**
         * on RESET_BALL
         * - teleport ball
         */
        case 'puttclub.RESET_BALL': {
          const playerNumber = s.players.findIndex((p) => p.value.id === action.playerId)
          const entityBall = GolfObjectEntities.get(`GolfBall-${playerNumber}`)
          if (typeof entityBall !== 'undefined') {
            // && getComponent(entityBall, GolfBallComponent).state === BALL_STATES.INACTIVE) {
            resetBall(entityBall, action.position)
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

  const namedComponentQuery = defineQuery([NameComponent])
  const namedComponentEnterQuery = enterQuery(namedComponentQuery)

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
        const { ownerId } = getComponent(entity, NetworkObjectComponent)
        const ownerEntity = playerQuery(world).find((player) => {
          return getComponent(player, NetworkObjectComponent).uniqueId === ownerId
        })
        // we only need to detect hits for our own club
        if (typeof ownerEntity !== 'undefined' && isEntityLocalClient(ownerEntity)) {
          updateClub(entity)

          if (getCurrentGolfPlayerEntity() === ownerEntity) {
            const { uniqueId } = getComponent(ownerEntity, NetworkObjectComponent)
            const currentPlayerNumber = GolfState.currentPlayer.value
            const entityBall = GolfObjectEntities.get(`GolfBall-${currentPlayerNumber}`)

            if (entityBall && getComponent(entityBall, NetworkObjectComponent).ownerId === uniqueId) {
              const { collisionEntity } = getCollisions(entity, GolfBallComponent)
              if (collisionEntity !== null && collisionEntity === entityBall) {
                const golfBallComponent = getComponent(entityBall, GolfBallComponent)
                if (golfBallComponent.state === BALL_STATES.WAITING) {
                  hitBall(entity, entityBall)
                  setBallState(entityBall, BALL_STATES.MOVING)
                  dispatchFromClient(GolfAction.playerStroke(uniqueId))
                }
              }
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
    }

    for (const entity of playerEnterQueryResults) {
      setupPlayerInput(entity)
    }

    for (const entity of namedComponentEnterQuery(world)) {
      const { name } = getComponent(entity, NameComponent)
      console.log(name)
      if (name.includes('GolfHole')) {
        addComponent(entity, GolfHoleComponent, {})
        GolfObjectEntities.set(name, entity)
      }
      if (name.includes('GolfTee')) {
        addComponent(entity, GolfTeeComponent, {})
        GolfObjectEntities.set(name, entity)
      }
      if (name.includes('GolfBall') || name.includes('GolfClub')) {
        GolfObjectEntities.set(name, entity)
      }
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
          setBallState(activeBallEntity, BALL_STATES.STOPPED)
          setTimeout(() => {
            const outOfBounds = !golfBallComponent.groundRaycast.hits.length
            const activeHoleEntity = GolfObjectEntities.get(`GolfHole-${GolfState.currentHole.value}`)
            const position = getComponent(activeBallEntity, TransformComponent).position
            const { collisionEvent } = getCollisions(activeBallEntity, GolfHoleComponent)
            const dist = position.distanceToSquared(getComponent(activeHoleEntity, TransformComponent).position)
            // ball-hole collision not being detected, not sure why, use dist for now
            const inHole = dist < 0.01 //collisionEvent !== null
            console.log('ball stopped', outOfBounds, inHole, dist, collisionEvent)

            dispatchFromServer(
              GolfAction.ballStopped(
                GolfState.players.value[currentPlayerNumber].id,
                position.toArray(),
                inHole,
                outOfBounds
              )
            )
          }, 1000)
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
          removeComponent(entity, SpawnNetworkObjectComponent)
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
