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

import { WebContainer3D } from '@etherealengine/xrui'
import { useEffect } from 'react'
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  SphereGeometry
} from 'three'
import { matches } from '../../common/functions/MatchesUtils'
import { Entity } from '../../ecs/classes/Entity'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  setComponent,
  useComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity, entityExists, useEntityContext } from '../../ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { InputSourceComponent } from '../../input/components/InputSourceComponent'
import { addObjectToGroup, removeObjectFromGroup } from '../../scene/components/GroupComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { LocalTransformComponent } from '../../transform/components/TransformComponent'

export const PointerComponent = defineComponent({
  name: 'PointerComponent',

  onInit: (entity) => {
    return {
      inputSource: null! as XRInputSource,
      pointer: null! as PointerObject
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (matches.object.test(json.inputSource)) component.inputSource.set(json.inputSource)
  },

  onRemove: (entity, component) => {
    PointerComponent.pointers.delete(component.inputSource.value)
  },

  reactor: () => {
    const entity = useEntityContext()
    const inputSourceState = useComponent(entity, PointerComponent).inputSource

    useEffect(() => {
      const inputSource = inputSourceState.value
      const pointer = createPointer(inputSource)
      const cursor = createUICursor()
      pointer.cursor = cursor
      pointer.add(cursor)
      // cursor.visible = false
      getMutableComponent(entity, PointerComponent).pointer.set(pointer)
      addObjectToGroup(entity, pointer)
      return () => {
        if (entityExists(entity)) removeObjectFromGroup(entity, pointer)
      }
    }, [inputSourceState])

    return null
  },

  addPointer: (inputSourceEntity: Entity) => {
    const inputSource = getComponent(inputSourceEntity, InputSourceComponent).source
    const entity = createEntity()
    setComponent(entity, PointerComponent, { inputSource })
    setComponent(entity, NameComponent, 'Pointer' + inputSource.handedness)
    setComponent(entity, EntityTreeComponent, { parentEntity: inputSourceEntity })
    setComponent(entity, LocalTransformComponent)
    setComponent(entity, VisibleComponent)
    PointerComponent.pointers.set(inputSource, entity)
  },

  pointers: new Map<XRInputSource, Entity>(),

  getPointers: () => {
    return Array.from(PointerComponent.pointers.values()).map(
      (entity) => getComponent(entity, PointerComponent).pointer
    )
  }
})

// pointer taken from https://github.com/mrdoob/three.js/blob/master/examples/webxr_vr_ballshooter.html
const createPointer = (inputSource: XRInputSource): PointerObject => {
  switch (inputSource.targetRayMode) {
    case 'gaze': {
      const geometry = new RingGeometry(0.02, 0.04, 32).translate(0, 0, -1)
      const material = new MeshBasicMaterial({ opacity: 0.5, transparent: true })
      return new Mesh(geometry, material) as PointerObject
    }
    default:
    case 'tracked-pointer': {
      const geometry = new BufferGeometry()
      geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3))
      geometry.setAttribute('color', new Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3))
      const material = new LineBasicMaterial({ vertexColors: true, blending: AdditiveBlending })
      return new Line(geometry, material)
    }
  }
}

const createUICursor = () => {
  const geometry = new SphereGeometry(0.01, 16, 16)
  const material = new MeshBasicMaterial({ color: 0xffffff })
  return new Mesh(geometry, material)
}

export type PointerObject = (Line<BufferGeometry, LineBasicMaterial> | Mesh<RingGeometry, MeshBasicMaterial>) & {
  targetRay?: Mesh<BufferGeometry, MeshBasicMaterial>
  cursor?: Mesh<BufferGeometry, MeshBasicMaterial>
  lastHit?: ReturnType<typeof WebContainer3D.prototype.hitTest> | null
}
