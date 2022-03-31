import { Engine } from 'src/ecs/classes/Engine'
import { useWorld } from 'src/ecs/functions/SystemHooks'
import { Quaternion, Vector3 } from 'three'
import matches, { Validator } from 'ts-matches'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

export { Validator }

const matchesVec3Shape = matches.shape({
  x: matches.number,
  y: matches.number,
  z: matches.number
})

const matchesQuatShape = matches.some(
  matches.shape({
    _x: matches.number,
    _y: matches.number,
    _z: matches.number,
    _w: matches.number
  }),
  matches.shape({
    x: matches.number,
    y: matches.number,
    z: matches.number,
    w: matches.number
  })
)

const vector3 = matches.guard((v): v is Vector3 => matchesVec3Shape.test(v))
const quaternion = matches.guard((v): v is Quaternion => matchesQuatShape.test(v))
const userId = matches.string as Validator<unknown, UserId>
const networkId = matches.number as Validator<unknown, NetworkId>

const actionFromUser = (userId: UserId) => {
  return matches.shape({ $from: matches.literal(userId) })
}

/**
 * match when we are the server and we are supposed to receive it, or when it is dispatched locally
 */

const actionFromTrusted = matches.guard((v): v is { $from: UserId } => {
  if (typeof v !== 'object') return false
  if (v && '$from' in v) {
    return (
      (v['$from'] === useWorld().hostId && (v['$to'] === 'all' || v['$to'] === Engine.userId)) || v['$to'] === 'local'
    )
  }
  return false
})

const withDefault = <V extends Validator<unknown, A>, A>(matches: V, callback: () => A) => {
  return { matches, callback }
}

export default {
  ...matches,
  userId,
  networkId,
  vector3,
  quaternion,
  actionFromUser,
  actionFromTrusted,
  withDefault,
  Validator
}
