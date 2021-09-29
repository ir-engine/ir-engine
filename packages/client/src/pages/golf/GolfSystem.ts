/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/hexafield>
 * @author Gheric Speiginer <github.com/speigg>
 */

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { GolfAction } from './GolfAction'
import { dispatchFrom } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { createState, Downgraded } from '@hookstate/core'
import { isClient } from '@xrengine/engine/src/common/functions/isClient'
import { GolfBallTagComponent, GolfClubTagComponent, GolfPrefabs } from './prefab/GolfGamePrefabs'
import { NetworkObjectComponent } from '@xrengine/engine/src/networking/components/NetworkObjectComponent'
import {
  addComponent,
  defineQuery,
  getComponent,
  removeComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { BALL_STATES, initializeGolfBall, resetBall, setBallState, updateBall } from './prefab/GolfBallPrefab'
import { initializeGolfClub, updateClub } from './prefab/GolfClubPrefab'
import { GolfClubComponent } from './components/GolfClubComponent'
import { setupPlayerInput } from './functions/setupPlayerInput'
import { registerGolfBotHooks } from './functions/registerGolfBotHooks'
import {
  getBall,
  getCurrentGolfPlayerEntity,
  getHole,
  getPlayerEntityFromNumber,
  getTee
} from './functions/golfFunctions'
import { hitBall } from './functions/hitBall'
import { GolfBallComponent } from './components/GolfBallComponent'
import { getCollisions } from '@xrengine/engine/src/physics/functions/getCollisions'
import { VelocityComponent } from '@xrengine/engine/src/physics/components/VelocityComponent'
import { GolfHoleComponent } from './components/GolfHoleComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { isEntityLocalClient } from '@xrengine/engine/src/networking/functions/isEntityLocalClient'
import { useState } from '@hookstate/core'
import { GolfTeeComponent } from './components/GolfTeeComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { setupPlayerAvatar, setupPlayerAvatarNotInVR, setupPlayerAvatarVR } from './functions/setupPlayerAvatar'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import matches from 'ts-matches'
import { SpawnPoseComponent } from '@xrengine/engine/src/avatar/components/SpawnPoseComponent'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { NetworkWorldAction } from '@xrengine/engine/src/networking/functions/NetworkWorldAction'

/**
 *
 */
export const GolfState = createState({
  holes: [{ par: 3 }, { par: 3 }, { par: 3 }] as Array<{ par: number }>,
  players: [] as Array<{
    userId: UserId
    scores: Array<number | undefined>
    stroke: number
    viewingScorecard: boolean
  }>,
  currentPlayerId: undefined! as UserId,
  currentHole: 0
})

// Attach logging
GolfState.attach(() => ({
  id: Symbol('Logger'),
  init: () => ({
    onSet() {
      console.log('GOLF STATE \n' + JSON.stringify(GolfState.attach(Downgraded).value, null, 2))
    }
  })
}))

export function useGolfState() {
  return useState(GolfState) as any as typeof GolfState
}

const getTeePosition = (currentHole: number) => {
  const teeEntity = getTee(currentHole)
  return getComponent(teeEntity, TransformComponent).position.toArray()
}

// IMPORTANT : For FLUX pattern, consider state immutable outside a receptor
function golfReceptor(action) {
  const world = useWorld()

  GolfState.batch((s) => {
    matches(action)
      .when(GolfAction.sendState.matches, ({ state }) => {
        s.set(state)
      })

      /**
       * On PLAYER_JOINED
       * - Add a player to player list (start at hole 0, scores at 0 for all holes)
       * - spawn golf club
       * - spawn golf ball
       */
      .when(NetworkWorldAction.spawnAvatar.matches, ({ userId }) => {
        const playerAlreadyExists = s.players.find((p) => p.userId.value === userId)
        if (!playerAlreadyExists) {
          s.players.merge([
            {
              userId: userId,
              scores: [],
              stroke: 0,
              viewingScorecard: false
            }
          ])
          console.log(`player ${userId} joined`)
        } else {
          console.log(`player ${userId} rejoined`)
        }
        dispatchFrom(world.hostId, () => GolfAction.sendState({ state: s.attach(Downgraded).value })).to(userId)
        dispatchFrom(world.hostId, () => GolfAction.spawnBall({ userId }))
        dispatchFrom(world.hostId, () => GolfAction.spawnClub({ userId }))
        const entity = world.getUserAvatarEntity(userId)
        setupPlayerAvatar(entity)
        setupPlayerInput(entity)
      })

      // Setup player XR avatars
      .when(NetworkWorldAction.setXRMode.matchesFromAny, (a) => {
        if (a.$from !== world.hostId || a.$from !== a.userId) return
        const entity = world.getUserAvatarEntity(a.userId)
        if (a.enabled) setupPlayerAvatarVR(entity)
        else setupPlayerAvatarNotInVR(entity)
      })

      /**
       * on PLAYER_STROKE
       *   - Finish current hole for this player
       *   - players[currentPlayer].scores[currentHole] = player.stroke
       */
      .when(GolfAction.playerStroke.matchesFromUser(s.currentPlayerId.value), ({ $from }) => {
        s.players[$from].merge((s) => {
          return { stroke: s.stroke + 1 }
        })
        setBallState(getBall($from), BALL_STATES.MOVING)
        if (world.isHosting) ballTimer = 0
      })

      /**
       * on spawn Goll ball
       */
      .when(GolfAction.spawnBall.matches, (action) => {
        console.log('MAKIGN BALL')
        const eid = initializeGolfBall(action)
        if (GolfState.currentPlayerId.value === action.userId) {
          setBallState(eid, BALL_STATES.WAITING)
        } else {
          setBallState(eid, BALL_STATES.INACTIVE)
        }
      })

      /**
       * on spawn Golf club
       */
      .when(GolfAction.spawnClub.matches, (action) => {
        console.log('MAKIGN CLUB')
        initializeGolfClub(action)
      })

      /**
       * on BALL_STOPPED
       *   - Finish current hole for this player
       *   - players[currentPlayer].scores[currentHole] = player.stroke
       */
      .when(GolfAction.ballStopped.matches, ({ userId }) => {
        const entityBall = getBall(userId)
        setBallState(entityBall, action.inHole ? BALL_STATES.IN_HOLE : BALL_STATES.STOPPED)
        if (isClient) {
          const teePosition = getTeePosition(s.currentHole.value)
          const position = action.outOfBounds ? teePosition : action.position
          resetBall(entityBall, position)
        }
        dispatchFrom(world.hostId, () => GolfAction.nextTurn({ userId }))
      })

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
      .when(GolfAction.nextTurn.matches, ({ userId }) => {
        const currentPlayerId = s.currentPlayerId.value
        const currentPlayerState = s.players.find((c) => c.userId.value === currentPlayerId)!
        const currentPlayerIndex = s.players.indexOf(currentPlayerState)
        const currentHole = s.currentHole.value
        const entityBall = getBall(userId)

        // if hole in ball or player has had too many shots, finish their round
        if (
          getComponent(entityBall, GolfBallComponent).state === BALL_STATES.IN_HOLE ||
          currentPlayerState.stroke.value > 8 /**s.holes.value[s.currentHole].par.value + 3*/
        ) {
          currentPlayerState.scores.set([
            ...currentPlayerState.scores.value,
            currentPlayerState.stroke.value - s.holes[currentHole].par.value
          ])
        }

        setBallState(entityBall, BALL_STATES.INACTIVE)

        // get players who haven't finished yet
        const playerSequence = s.players.value.slice().concat(s.players.value) // wrap
        const nextPlayer = playerSequence.filter((p) => {
          return p.scores.length <= currentHole && playerSequence.indexOf(p) > currentPlayerIndex
        })[0]

        // if we have a next player, increment the current player and change turns
        if (nextPlayer) {
          s.currentPlayerId.set(nextPlayer.userId)

          // the ball might be in the old hole still
          if (nextPlayer.stroke === 0) {
            if (!isClient)
              dispatchFrom(world.hostId, () =>
                GolfAction.resetBall({
                  userId: nextPlayer.userId,
                  position: getTeePosition(s.currentHole.value)
                })
              )
          }

          const nextBallEntity = getBall(nextPlayer.userId)
          setBallState(nextBallEntity, BALL_STATES.WAITING)
          console.log(`it is now player ${nextPlayer.userId}'s turn`)
        } else {
          // if not, the round has finished
          if (!isClient) dispatchFrom(world.hostId, () => GolfAction.nextHole({}))
        }
      })

      /**
       * on NEXT_HOLE
       *   - currentHole = earliest hole that a player hasn’t completed yet
       *   - indicate new current hole
       *   - dispatch RESET_BALL
       */
      .when(GolfAction.nextHole.matches, () => {
        s.currentHole.set((s.currentHole.value + 1) % s.holes.length) // TODO: earliest incomplete hole
        if (s.currentHole.value === 0) {
          console.log('finished game! resetting player scores')
          for (const [i, p] of s.players.entries()) {
            p.scores.set([])
          }
        }
        // Set all player strokes to 0
        for (const [i, p] of s.players.entries()) {
          p.stroke.set(0)
          // reset all ball position to the new tee
        }

        if (isClient) {
          const teeEntity = getTee(s.currentHole.value)
          getComponent(world.localClientEntity, SpawnPoseComponent).position.copy(
            getComponent(teeEntity, TransformComponent).position
          )
        }

        // set current player to the first player
        s.currentPlayerId.set(s.players[0].userId.value)
        if (!isClient)
          dispatchFrom(world.hostId, () =>
            GolfAction.resetBall({
              userId: s.players[0].userId.value,
              position: getTeePosition(s.currentHole.value)
            })
          )
      })

      /**
       * on RESET_BALL
       * - teleport ball
       */
      .when(GolfAction.resetBall.matches, ({ userId }) => {
        const entityBall = getBall(userId)
        if (typeof entityBall !== 'undefined') {
          resetBall(entityBall, action.position)
          setBallState(entityBall, BALL_STATES.WAITING)
        }
      })

      /**
       * Show scorecard
       */
      .when(GolfAction.lookAtScorecard.matchesFromAny, ({ userId, value }) => {
        const player = s.players.find((p) => p.userId.value === userId)
        if (player) player.viewingScorecard.set((v) => (typeof value === 'boolean' ? value : !v))
      })
  })
}

// Note: player numbers are 0-indexed

globalThis.GolfState = GolfState
let ballTimer = 0

export default async function GolfSystem(world: World) {
  world.receptors.add(golfReceptor)

  const namedComponentQuery = defineQuery([NameComponent])
  const golfClubQuery = defineQuery([GolfClubComponent])

  if (isClient) {
    registerGolfBotHooks()
    // pre-cache the assets we need for this game
    await Promise.all([
      AssetLoader.loadAsync({ url: Engine.publicPath + '/models/golf/avatars/avatar_head.glb' }),
      AssetLoader.loadAsync({ url: Engine.publicPath + '/models/golf/avatars/avatar_hands.glb' }),
      AssetLoader.loadAsync({ url: Engine.publicPath + '/models/golf/avatars/avatar_torso.glb' }),
      AssetLoader.loadAsync({ url: Engine.publicPath + '/models/golf/golf_ball.glb' })
    ])
  }

  return () => {
    for (const entity of golfClubQuery()) {
      const { networkId } = getComponent(entity, NetworkObjectComponent)
      const { number } = getComponent(entity, GolfClubComponent)
      const ownerEntity = getPlayerEntityFromNumber(number)
      updateClub(entity)
      // we only need to detect hits for our own club
      if (typeof ownerEntity !== 'undefined' && isEntityLocalClient(ownerEntity)) {
        if (getCurrentGolfPlayerEntity() === ownerEntity) {
          const currentPlayerId = GolfState.currentPlayerId.value
          const entityBall = getBall(currentPlayerId)
          if (entityBall && getComponent(entityBall, NetworkObjectComponent).networkId === networkId) {
            const { collisionEntity } = getCollisions(entity, GolfBallComponent)
            if (collisionEntity !== null && collisionEntity === entityBall) {
              const golfBallComponent = getComponent(entityBall, GolfBallComponent)
              if (golfBallComponent.state === BALL_STATES.WAITING) {
                hitBall(entity, entityBall)
                setBallState(entityBall, BALL_STATES.MOVING)
                dispatchFrom(Engine.userId, () => GolfAction.playerStroke({}))
              }
            }
          }
        }
      }
    }

    for (const entity of namedComponentQuery.enter()) {
      const { name } = getComponent(entity, NameComponent)
      if (name) {
        console.log(name)
        if (name.includes('GolfHole')) {
          addComponent(entity, GolfHoleComponent, {})
        }
        if (name.includes('GolfTee')) {
          addComponent(entity, GolfTeeComponent, {})
        }
      }
    }

    const currentPlayerId = GolfState.currentPlayerId.value
    const activeBallEntity = getBall(currentPlayerId)
    if (typeof activeBallEntity !== 'undefined') {
      const golfBallComponent = getComponent(activeBallEntity, GolfBallComponent)
      updateBall(activeBallEntity)

      if (!isClient && golfBallComponent.state === BALL_STATES.MOVING) {
        ballTimer++
        if (ballTimer > 60) {
          const { velocity } = getComponent(activeBallEntity, VelocityComponent)
          const position = getComponent(activeBallEntity, TransformComponent)?.position
          if (!position) return
          const velMag = velocity.lengthSq()
          if (velMag < 0.001 || position.y < -100) {
            setBallState(activeBallEntity, BALL_STATES.STOPPED)
            setTimeout(() => {
              const position = getComponent(activeBallEntity, TransformComponent)?.position
              golfBallComponent.groundRaycast.origin.copy(position)
              world.physics.doRaycast(golfBallComponent.groundRaycast)
              const outOfBounds = !golfBallComponent.groundRaycast.hits.length
              const activeHoleEntity = getHole(GolfState.currentHole.value)
              if (!position) return
              const { collisionEvent } = getCollisions(activeBallEntity, GolfHoleComponent)
              const dist = position.distanceToSquared(getComponent(activeHoleEntity, TransformComponent).position)
              // ball-hole collision not being detected, not sure why, use dist for now
              const inHole = dist < 0.01 //typeof collisionEvent !== 'undefined'
              console.log('\n\n\n========= ball stopped', outOfBounds, inHole, dist, collisionEvent, '\n')

              dispatchFrom(world.hostId, () =>
                GolfAction.ballStopped({
                  userId: currentPlayerId,
                  position: position.toArray(),
                  inHole,
                  outOfBounds
                })
              )
            }, 1000)
          }
        }
      }
    }

    return world
  }
}
