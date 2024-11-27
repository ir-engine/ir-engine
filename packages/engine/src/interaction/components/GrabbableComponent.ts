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

import { useEffect } from 'react'

import { getComponent, hasComponent, useEntityContext } from '@ir-engine/ecs'
import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { getState, isClient } from '@ir-engine/hyperflux'
import { setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import { InputSourceComponent } from '@ir-engine/spatial/src/input/components/InputSourceComponent'
import { InputState } from '@ir-engine/spatial/src/input/state/InputState'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { dropEntity, grabEntity } from '../functions/grabbableFunctions'
import { InteractableComponent, XRUIVisibilityOverride } from './InteractableComponent'

const grabbableCallbackName = 'grabCallback'

export const XRHandedness = S.LiteralUnion(['none', 'left', 'right'], 'none')

/**
 * GrabbableComponent
 * - Allows an entity to be grabbed by a GrabberComponent
 */
export const GrabbableComponent = defineComponent({
  name: 'GrabbableComponent',
  jsonID: 'EE_grabbable', // TODO: rename to grabbable

  toJSON: () => true,

  grabbableCallbackName,

  reactor: function () {
    const entity = useEntityContext()
    useEffect(() => {
      if (isClient) {
        setCallback(entity, grabbableCallbackName, () => grabCallback(entity))
      }
    }, [])
    return null
  }
})

const grabCallback = (targetEntity: Entity) => {
  const nonCapturedInputSources = InputSourceComponent.nonCapturedInputSources()
  for (const entity of nonCapturedInputSources) {
    const inputSource = getComponent(entity, InputSourceComponent)
    onGrab(targetEntity, inputSource.source.handedness === 'left' ? 'left' : 'right')
  }
}
const updateUI = (entity: Entity) => {
  const isGrabbed = hasComponent(entity, GrabbedComponent)
  const interactable = getComponent(entity, InteractableComponent)
  interactable.uiVisibilityOverride = isGrabbed ? XRUIVisibilityOverride.off : XRUIVisibilityOverride.none
}

const onGrab = (targetEntity: Entity, handedness = getState(InputState).preferredHand) => {
  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
  if (!hasComponent(targetEntity, GrabbableComponent)) return
  const grabber = getComponent(selfAvatarEntity, GrabberComponent)
  const grabbedEntity = grabber[handedness]!
  if (!grabbedEntity) return
  if (grabbedEntity) {
    onDrop()
  } else {
    grabEntity(selfAvatarEntity, targetEntity, handedness)
  }
  updateUI(targetEntity)
}
export const onDrop = () => {
  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
  const grabber = getComponent(selfAvatarEntity, GrabberComponent)
  const handedness = getState(InputState).preferredHand
  const grabbedEntity = grabber[handedness]!
  if (!grabbedEntity) return
  dropEntity(selfAvatarEntity)
  updateUI(grabbedEntity)
}

/**
 * GrabbedComponent
 * - Indicates that an entity is currently being grabbed by a GrabberComponent
 */
export const GrabbedComponent = defineComponent({
  name: 'GrabbedComponent',

  schema: S.Object({
    attachmentPoint: XRHandedness,
    grabberEntity: T.Entity()
  })
})

/**
 * GrabberComponent
 * - Allows an entity to grab a GrabbableComponent
 */
export const GrabberComponent = defineComponent({
  name: 'GrabberComponent',

  schema: S.Object({
    left: T.Entity(),
    right: T.Entity()
  })
})
