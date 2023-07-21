/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Quaternion, Vector3 } from 'three'
import { Validator, matches } from 'ts-matches'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'

import { Entity } from '../../ecs/classes/Entity'

export * from 'ts-matches'
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
