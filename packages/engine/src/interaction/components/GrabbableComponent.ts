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

import { useEffect } from 'react'

import { getState } from '@etherealengine/hyperflux'

import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { SceneState } from '../../ecs/classes/Scene'
import { defineComponent, removeComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { LocalTransformComponent } from '../../transform/components/TransformComponent'

/**
 * GrabbableComponent
 * - Allows an entity to be grabbed by a GrabberComponent
 */
export const GrabbableComponent = defineComponent({
  name: 'GrabbableComponent',
  jsonID: 'equippable', // TODO: rename to grabbable
  toJSON: () => true,

  reactor: () => {
    const entity = useEntityContext()

    /** @todo figure out a better way of disassociating dynamic objects from the scene */
    useEffect(() => {
      if (getState(EngineState).isEditor) return
      removeComponent(entity, LocalTransformComponent)
      setComponent(entity, EntityTreeComponent, { parentEntity: getState(SceneState).sceneEntity })
    }, [])

    return null
  }
})

/**
 * GrabbedComponent
 * - Indicates that an entity is currently being grabbed by a GrabberComponent
 */
export const GrabbedComponent = defineComponent({
  name: 'GrabbedComponent',

  onInit(entity) {
    return {
      attachmentPoint: 'none' as XRHandedness,
      grabberEntity: null! as Entity
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (typeof json.attachmentPoint === 'string') component.attachmentPoint.set(json.attachmentPoint)
    if (typeof json.grabberEntity === 'number') component.grabberEntity.set(json.grabberEntity)
  }
})

/**
 * GrabberComponent
 * - Allows an entity to grab a GrabbableComponent
 */
export const GrabberComponent = defineComponent({
  name: 'GrabberComponent',

  onInit(entity) {
    return {
      grabbedEntity: null as Entity | null
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (typeof json.grabbedEntity === 'number' || json.grabbedEntity === null)
      component.grabbedEntity.set(json.grabbedEntity)
  },

  onRemove(entity, component) {
    const grabbedEntity = component.grabbedEntity.value
    if (!grabbedEntity) return
    removeComponent(grabbedEntity, GrabbedComponent)
  }
})
