/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { ECSState, Entity, hasComponent } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import {
  NetworkObjectSendPeriodicUpdatesTag,
  ViewCursor,
  checkBitflag,
  readUint8,
  readVector3,
  readVector4,
  rewindViewCursor,
  spaceUint8,
  writeVector3,
  writeVector4
} from '@ir-engine/network'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { TransformComponent } from './components/TransformComponent'

export const readPosition = readVector3(TransformComponent.position)
export const readRotation = readVector4(TransformComponent.rotation) //readCompressedRotation(TransformComponent.rotation) //readVector4(TransformComponent.rotation)

export const readTransform = (v: ViewCursor, entity: Entity) => {
  const changeMask = readUint8(v)
  let b = 0
  if (checkBitflag(changeMask, 1 << b++)) readPosition(v, entity)
  if (checkBitflag(changeMask, 1 << b++)) readRotation(v, entity)
  TransformComponent.dirtyTransforms[entity] = true
}

export const writePosition = writeVector3(TransformComponent.position)
export const writeRotation = writeVector4(TransformComponent.rotation)

export const writeTransform = (v: ViewCursor, entity: Entity) => {
  if (!hasComponent(entity, TransformComponent) || hasComponent(entity, RigidBodyComponent)) return

  const rewind = rewindViewCursor(v)
  const writeChangeMask = spaceUint8(v)
  let changeMask = 0
  let b = 0

  const ignoreHasChanged =
    hasComponent(entity, NetworkObjectSendPeriodicUpdatesTag) &&
    Math.round(getState(ECSState).simulationTime % getState(ECSState).periodicUpdateFrequency) === 0

  changeMask |= writePosition(v, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0
  changeMask |= writeRotation(v, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0

  return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
}

export const TransformSerialization = {
  ID: 'ee.core.transform' as const,
  readTransform,
  writeTransform
}
