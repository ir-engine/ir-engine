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

import { UUIDComponent, getComponent, hasComponent, useEntityContext } from '@ir-engine/ecs'
import { defineComponent, useComponent, useOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, matchesEntityUUID } from '@ir-engine/ecs/src/Entity'
import { defineAction, dispatchAction, getState, isClient, matches } from '@ir-engine/hyperflux'
import { setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import { InputSourceComponent } from '@ir-engine/spatial/src/input/components/InputSourceComponent'
import { InputState } from '@ir-engine/spatial/src/input/state/InputState'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NetworkTopics } from '@ir-engine/network'
import { AvatarComponent } from '../avatar/components/AvatarComponent'
import { InteractableComponent, XRUIVisibilityOverride } from '../interaction/components/InteractableComponent'

// @todo move this to spatial package schema definitions
export const XRHandedness = S.LiteralUnion(['none', 'left', 'right'], 'none')

/**
 * GrabbableComponent
 * - Allows an entity to be grabbed by an entity with a GrabberComponent
 */
export const GrabbableComponent = defineComponent({
  name: 'GrabbableComponent',
  jsonID: 'EE_grabbable',

  toJSON: () => true,

  grabbableCallbackName: 'grabCallback',

  reactor: function () {
    const entity = useEntityContext()
    const isGrabbed = !!useOptionalComponent(entity, GrabbedComponent)
    const interactableComponent = useComponent(entity, InteractableComponent)

    useEffect(() => {
      if (isClient) {
        setCallback(entity, GrabbableComponent.grabbableCallbackName, (entity: Entity, targetEntity: Entity) =>
          grabCallback(entity)
        )
      }
    }, [])

    useEffect(() => {
      interactableComponent.uiVisibilityOverride.set(
        isGrabbed ? XRUIVisibilityOverride.off : XRUIVisibilityOverride.none
      )
    }, [isGrabbed, !!interactableComponent])

    return null
  },

  grab: (grabberEntity: Entity, grabbableEntity: Entity, handedness = getState(InputState).preferredHand) => {
    if (
      !grabberEntity ||
      !hasComponent(grabberEntity, GrabberComponent) ||
      !hasComponent(grabbableEntity, GrabbableComponent)
    )
      return

    const grabber = getComponent(grabberEntity, GrabberComponent)
    const grabbedEntity = grabber[handedness]!
    if (grabbedEntity) return
    dispatchAction(
      GrabbableNetworkAction.setGrabbedObject({
        entityUUID: getComponent(grabbableEntity, UUIDComponent),
        grabberEntityUUID: getComponent(grabberEntity, UUIDComponent),
        grabbed: true,
        attachmentPoint: handedness
      })
    )
  },

  drop: (grabberEntity: Entity, grabbableEntity: Entity) => {
    if (
      !grabberEntity ||
      !hasComponent(grabberEntity, GrabberComponent) ||
      !hasComponent(grabbableEntity, GrabbableComponent)
    )
      return

    dispatchAction(
      GrabbableNetworkAction.setGrabbedObject({
        entityUUID: getComponent(grabbableEntity, UUIDComponent),
        grabberEntityUUID: getComponent(grabberEntity, UUIDComponent),
        grabbed: false
      })
    )
  }
})

const grabCallback = (grabbableEntity: Entity) => {
  const nonCapturedInputSources = InputSourceComponent.nonCapturedInputSources()
  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
  for (const entity of nonCapturedInputSources) {
    const inputSource = getComponent(entity, InputSourceComponent)
    if (hasComponent(grabbableEntity, GrabbedComponent)) {
      GrabbableComponent.drop(selfAvatarEntity, grabbableEntity)
    } else {
      GrabbableComponent.grab(
        selfAvatarEntity,
        grabbableEntity,
        inputSource.source.handedness === 'left' ? 'left' : 'right'
      )
    }
  }
}

/**
 * GrabbedComponent
 * - Indicates that an entity is currently being grabbed by a GrabberComponent
 */
export const GrabbedComponent = defineComponent({
  name: 'GrabbedComponent',

  schema: S.Object({
    attachmentPoint: XRHandedness,
    grabberEntity: S.Entity()
  })
})

/**
 * GrabberComponent
 * - Allows an entity to grab a GrabbableComponent
 */
export const GrabberComponent = defineComponent({
  name: 'GrabberComponent',

  schema: S.Object({
    left: S.Entity(),
    right: S.Entity()
  })
})

export class GrabbableNetworkAction {
  static setGrabbedObject = defineAction({
    type: 'ee.engine.grabbable.SET_GRABBED_OBJECT',
    entityUUID: matchesEntityUUID,
    grabbed: matches.boolean,
    attachmentPoint: matches.literals('left', 'right').optional(),
    grabberEntityUUID: matchesEntityUUID,
    $cache: true,
    $topic: NetworkTopics.world
  })
}
