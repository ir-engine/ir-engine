import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions'
import { Checker } from '../../../../game/types/Checker'
import { GamePlayer } from '../../../../game/components/GamePlayer'
import { GameObject } from '../../../../game/components/GameObject'
import { NetworkObject } from '../../../../networking/components/NetworkObject'
import { getGame, getTargetEntity } from '../../../../game/functions/functions'
import { ColliderComponent } from '../../../../physics/components/ColliderComponent'
import { Game } from '../../../components/Game'
import { TransformComponent } from '../../../../transform/components/TransformComponent'
import { CollisionEvents } from 'three-physx'

/**
 * @author HydraFire <github.com/HydraFire>
 */

const updateNewPlayersRate: number = 60 * 2
let updateLastTime = 60

export const ifGetOut: Checker = (entity: Entity, args?: any, entityTarget?: Entity): any | undefined => {
  if (updateLastTime > updateNewPlayersRate) {
    const game = getGame(entity)
    if (game === undefined) return false

    const gameArea = game.gameArea

    const collider = getComponent(entity, ColliderComponent)
    if (collider === undefined) return false
    const p = collider.body.transform.translation

    const inGameArea = (p.x < gameArea.max.x && p.x > gameArea.min.x &&
                        p.y < gameArea.max.y && p.y > gameArea.min.y &&
                        p.z < gameArea.max.z && p.z > gameArea.min.z)
    updateLastTime = 0
    return !inGameArea
  } else {
    updateLastTime += 1
    return false
  }
}
