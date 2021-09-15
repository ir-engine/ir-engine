import { Network } from '../classes/Network'

export function isPlayerLocal(userId): boolean {
  return Network.instance?.userId === userId
}
