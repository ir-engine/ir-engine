import { Engine } from '../../../ecs/classes/Engine'
import { defineQuery, defineSystem, enterQuery, exitQuery, System } from '../../../ecs/bitecs'
import { ECSWorld } from '../../../ecs/classes/World'
import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { GolfAction, GolfActionType } from './GolfAction'
import { Network } from '../../../networking/classes/Network'
import { createState } from '@hookstate/core'
import { ActionType } from '../../../networking/interfaces/NetworkTransport'
import { GamePlayer } from '../../components/GamePlayer'
import { BallStopped } from './GolfGameComponents'
import { isClient } from '../../../common/functions/isClient'
import { GolfGameMode } from '../GolfGameMode'
import { GolfPrefabs } from './prefab/GolfGamePrefabs'
import { NetworkObjectComponent } from '../../../networking/components/NetworkObjectComponent'
import { getComponent } from '../../../ecs/functions/EntityFunctions'
import { AvatarComponent } from '../../../avatar/components/AvatarComponent'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/hexafield>
 * @author Gheric Speiginer <github.com/speigg>
 */

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

globalThis.GolfState = GolfState

// IMPORTANT: unlike Redux, dispatched actions are always processed asynchronously
const dispatchOnServer = (x: ActionType) => {
  // noop on client
  if (!isClient) Network.instance.outgoingActions.push(x)
}

export const GolfSystem = async (): Promise<System> => {
  if (isClient) {
    // pre-cache the assets we need for this game
    await AssetLoader.loadAsync({ url: Engine.publicPath + '/models/golf/avatars/avatar_head.glb' })
    await AssetLoader.loadAsync({ url: Engine.publicPath + '/models/golf/avatars/avatar_hands.glb' })
    await AssetLoader.loadAsync({ url: Engine.publicPath + '/models/golf/avatars/avatar_torso.glb' })
  }

  Engine.gameModes.set(GolfGameMode.name, GolfGameMode)

  // add our prefabs - TODO: find a better way of doing this that doesn't pollute prefab namespace
  Object.entries(GolfPrefabs).forEach(([prefabType, prefab]) => {
    Network.instance.schema.prefabs.set(Number(prefabType), prefab)
  })

  // IMPORTANT : For FLUX pattern, consider state immutable outside a receptor
  function receptor(world: ECSWorld, action: GolfActionType) {
    GolfState.batch((s) => {
      switch (action.type) {
        /**
         * On PLAYER_JOINED
         * - Add a player to player list (start at hole 0, scores at 0 for all holes)
         * - spawn golf club
         * - spawn golf ball
         */
        case 'puttclub.PLAYER_JOINED':
          s.players.merge([
            {
              id: action.playerId,
              scores: [],
              stroke: 0
            }
          ])
          // spawn golf ball
          if (isClient) {
            // spawn golf club
          }
          if (s.players.length === 1) {
            dispatchOnServer(GolfAction.nextTurn())
          }
          console.log(`player ${action.playerId} joined and added to state`)
          return

        /**
         * on PLAYER_STROKE
         *   - Finish current hole for this player
         *   - players[currentPlayer].scores[currentHole] = player.stroke
         */
        case 'puttclub.PLAYER_STROKE':
          s.players[s.currentPlayer.value].merge((s) => {
            return { stroke: s.stroke + 1 }
          })
          return

        /**
         * on NEXT_TURN
         *   - Finish current hole for this player
         *   - players[currentPlayer].scores[currentHole] = player.stroke
         *   - currentHole = earliest hole that a player hasn’t completed yet
         *   - dispatch NEXT_HOLE
         *   - increment currentPlayer
         *   - hide old player's ball
         *   - show new player's ball
         *   - enable new player's club
         */
        case 'puttclub.NEXT_TURN':
          const player = s.players[s.currentPlayer.value]
          player.scores.merge({
            [s.currentHole.value]: player.stroke.value
          })
          player.stroke.set(0)
          dispatchOnServer(GolfAction.nextHole())
          console.log(`it is now player ${player.id.value}'s turn`)
          return

        /**
         * on NEXT_HOLE
         *   - indicate next hole
         *   - currentHole = earliest hole that a player hasn’t completed yet
         *   - dispatch RESET_BALL
         * - ELSE
         *   - increment currentPlayer
         */
        case 'puttclub.NEXT_HOLE':
          holes: for (const [i] of s.holes.entries()) {
            const nextHole = i
            for (const p of s.players) {
              if (p.scores[i] === undefined) {
                s.currentHole.set(nextHole)
                break holes
              }
            }
          }
          dispatchOnServer(GolfAction.resetBall())
          return

        /**
         * on RESET_BALL
         * - teleport ball
         */
        case 'puttclub.RESET_BALL':
          return
      }
    })
  }

  const playerQuery = defineQuery([AvatarComponent])
  const playerEnterQuery = enterQuery(playerQuery)
  const playerExitQuery = exitQuery(playerQuery)

  return defineSystem((world: ECSWorld) => {
    // runs on server & client:
    for (const action of Network.instance.incomingActions) receptor(world, action as any)

    const currentPlayer = GolfState.players[GolfState.currentPlayer.value].value

    if (!isClient) {
      for (const entity of playerEnterQuery(world)) {
        const { ownerId } = getComponent(entity, NetworkObjectComponent)

        // Add a player to player list (start at hole 0, scores at 0 for all holes)
        dispatchOnServer(GolfAction.playerJoined(ownerId))
      }

      for (const entity of playerExitQuery(world)) {
        const { ownerId } = getComponent(entity, NetworkObjectComponent)

        // if a player disconnects and it's their turn, change turns to the next player
        if (currentPlayer.id === ownerId) dispatchOnServer(GolfAction.nextTurn())
      }

      // if (ballHit()) {
      //   dispatchOnServer(GolfAction.playerStroke(currentPlayer.id))
      // }

      // if (ballStoppedOrTimedOut()) {
      //   dispatchOnServer(GolfAction.nextTurn())
      // }

      // if (ballOutOfBounds()) {
      //   dispatchOnServer(GolfAction.nextTurn())
      //   dispatchOnServer(GolfAction.resetBall())
      // }
    }

    return world
  })
}
