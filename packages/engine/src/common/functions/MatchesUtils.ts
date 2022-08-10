import { Quaternion, Vector3 } from 'three'
import { matches, Validator } from 'ts-matches'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { Entity } from '../../ecs/classes/Entity'

export * from 'ts-matches'

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

const matchesVector3 = matches.guard((v): v is Vector3 => matchesVec3Shape.test(v))
const matchesQuaternion = matches.guard((v): v is Quaternion => matchesQuatShape.test(v))
const matchesUserId = matches.string as Validator<unknown, UserId>
const matchesNetworkId = matches.number as Validator<unknown, NetworkId>
const matchesEntity = matches.number as Validator<unknown, Entity>

const matchesActionFromUser = (userId: UserId) => {
  return matches.shape({ $from: matches.literal(userId) })
}

export type MatchesWithDefault<A> = { matches: Validator<unknown, A>; defaultValue: () => A }

const matchesWithDefault = <A>(matches: Validator<unknown, A>, defaultValue: () => A): MatchesWithDefault<A> => {
  return { matches, defaultValue }
}

export {
  matchesUserId,
  matchesNetworkId,
  matchesEntity,
  matchesVector3,
  matchesQuaternion,
  matchesActionFromUser,
  matchesWithDefault
}
