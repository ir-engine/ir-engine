import { Quaternion, Vector3 } from 'three'
import { matches, Validator } from 'ts-matches'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'

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
const matchesPeerID = matches.string as Validator<unknown, PeerID>
const matchesNetworkId = matches.number as Validator<unknown, NetworkId>
const matchesEntity = matches.number as Validator<unknown, Entity>
const matchesEntityUUID = matches.string as Validator<unknown, EntityUUID>

const matchesActionFromUser = (userId: UserId) => {
  return matches.shape({ $from: matches.literal(userId) })
}

export type MatchesWithDefault<A> = { matches: Validator<unknown, A>; defaultValue: () => A }

const matchesWithDefault = <A>(matches: Validator<unknown, A>, defaultValue: () => A): MatchesWithDefault<A> => {
  return { matches, defaultValue }
}

export {
  matchesUserId,
  matchesPeerID,
  matchesNetworkId,
  matchesEntity,
  matchesEntityUUID,
  matchesVector3,
  matchesQuaternion,
  matchesActionFromUser,
  matchesWithDefault
}
