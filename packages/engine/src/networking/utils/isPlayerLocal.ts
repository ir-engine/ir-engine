import { useEngine } from '../../ecs/classes/Engine'

export function isPlayerLocal(userId): boolean {
  return useEngine().userId === userId
}
