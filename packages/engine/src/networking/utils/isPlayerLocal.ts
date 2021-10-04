import { Engine } from '../../ecs/Engine'

export function isPlayerLocal(userId): boolean {
  return Engine.userId === userId
}
