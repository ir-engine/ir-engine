import { Engine } from '../../ecs/classes/Engine'

export function isPlayerLocal(userId): boolean {
  return Engine.userId === userId
}
