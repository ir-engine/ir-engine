import { Engine } from '../../ecs/classes/Engine'
import { useWorld } from '../../ecs/functions/SystemHooks'

/** Returns true if the engine instance is the host. */
export const isHost = () => useWorld().hostId === Engine.userId
