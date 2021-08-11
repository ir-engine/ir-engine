import { Engine } from '../../../ecs/classes/Engine'
import { defineQuery, defineSystem, enterQuery, exitQuery, System } from '../../../ecs/bitecs'
import { ECSWorld } from '../../../ecs/classes/World'
import { AssetLoader } from '../../../assets/classes/AssetLoader'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/hexafield>
 */

export const GolfCommonSystem = async (): Promise<System> => {
  return defineSystem((world: ECSWorld) => {
    const { delta } = world

    return world
  })
}

export const GolfClientSystem = async (): Promise<System> => {
  await AssetLoader.loadAsync({ url: Engine.publicPath + '/models/golf/avatars/avatar_head.glb' })
  await AssetLoader.loadAsync({ url: Engine.publicPath + '/models/golf/avatars/avatar_hands.glb' })
  await AssetLoader.loadAsync({ url: Engine.publicPath + '/models/golf/avatars/avatar_torso.glb' })

  return defineSystem((world: ECSWorld) => {
    const { delta } = world

    /**
     * UI update stuff not included
     * clubs can be client only, since they take input from 6dof network & client sends hit  data
     */

    /**
     * on hit ball
     * - CLIENT_PLAYER_STROKE
     * - club is disabled
     */

    /**
     * On new player
     * - Add a player to player list (start at hole 0, scores at 0 for all holes)
     */

    /**
     * on NEXT_TURN
     * - hide old player's ball
     * - show new player's ball
     * - enable new player's club
     */

    /**
     * on NEXT_HOLE
     * - indicate next hole
     */

    /**
     * on MOVE_BALL
     * - teleport ball
     */

    return world
  })
}

export const GolfServerSystem = async (): Promise<System> => {
  return defineSystem((world: ECSWorld) => {
    const { delta } = world

    /**
     * On new player
     * - add player to list of players
     * - dispatch NEW_PLAYER
     * - spawn golf club
     * - spawn golf ball
     */

    /**
     * on first player join
     * - add turn
     */

    /**
     * on current player leave
     * - next turn
     */

    /**
     * On player hit ball
     * - dispatch PLAYER_STROKE
     *   - increment player.stroke
     */

    /**
     * On ball stopped
     * - dispatch NEXT_TURN
     */

    /**
     * on NEXT_TURN
     * - IF player's ball in hole OR If current player has had too many attempts at this hole
     *   - Finish current hole for this player
     *   - players[currentPlayer].scores[currentHole] = player.stroke
     * - IF all players have scores for current hole
     *   - currentHole = earliest hole that a player hasn’t completed yet
     *   - dispatch NEXT_HOLE
     *   - dispatch MOVE_BALL
     * - ELSE
     *   - increment currentPlayer
     */

    /**
     * - Detect ball out of bounds
     *   - Reset to previous hit's start position or tee position
     *   - dispatch MOVE_BALL
     */

    return world
  })
}
