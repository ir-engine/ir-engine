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

import { Object3D } from 'three'

import { Entity, Types } from '@ir-engine/ecs'
import { defineComponent, hasComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'

const maxBitWidth = 32
/**
 * @note - do not use ObjectLayerComponent directly, use ObjectLayerMaskComponent instead
 */
export const ObjectLayerComponents = Array.from({ length: maxBitWidth }, (_, i) => {
  return defineComponent({
    name: `ObjectLayer${i}`
  })
})

export const ObjectLayerMaskDefault = 1 << 0 // enable layer 0

export const ObjectLayerMaskComponent = defineComponent({
  name: 'ObjectLayerMaskComponent',
  schema: { mask: Types.i32 },

  onInit() {
    return ObjectLayerMaskDefault // enable layer 0
  },

  /**
   * @description
   * Takes a layer mask as a parameter, not a layer (eg. layer mask with value 256 enables layer 8)
   * ```ts
   * // Incorrect usage
   * setComponent(entity, ObjectLayerMaskComponent, ObjectLayers.NodeHelper)
   *
   * // Correct usage
   * setComponent(entity, ObjectLayerMaskComponent, ObjectLayerMasks.NodeHelper)
   * ```
   */
  onSet(entity, component, mask = ObjectLayerMaskDefault) {
    for (let i = 0; i < maxBitWidth; i++) {
      const isSet = (mask & ((1 << i) | 0)) !== 0
      if (isSet) {
        setComponent(entity, ObjectLayerComponents[i])
      } else {
        removeComponent(entity, ObjectLayerComponents[i])
      }
    }
    component.set(mask)
    ObjectLayerMaskComponent.mask[entity] = mask
  },

  onRemove(entity, component) {
    for (let i = 0; i < maxBitWidth; i++) {
      removeComponent(entity, ObjectLayerComponents[i])
    }
    component.set(0)
  },

  setLayer(entity: Entity, layer: number) {
    const mask = ((1 << layer) | 0) >>> 0
    setComponent(entity, ObjectLayerMaskComponent, mask)
  },

  enableLayer(entity: Entity, layer: number) {
    if (!hasComponent(entity, ObjectLayerMaskComponent)) setComponent(entity, ObjectLayerMaskComponent)
    const currentMask = ObjectLayerMaskComponent.mask[entity]
    const mask = currentMask | ((1 << layer) | 0)
    setComponent(entity, ObjectLayerMaskComponent, mask)
  },

  enableLayers(entity: Entity, ...layers: number[]) {
    if (!hasComponent(entity, ObjectLayerMaskComponent)) setComponent(entity, ObjectLayerMaskComponent)
    const currentMask = ObjectLayerMaskComponent.mask[entity]
    let mask = currentMask
    for (const layer of layers) {
      mask |= (1 << layer) | 0
    }
    setComponent(entity, ObjectLayerMaskComponent, mask)
  },

  disableLayer(entity: Entity, layer: number) {
    if (!hasComponent(entity, ObjectLayerMaskComponent)) setComponent(entity, ObjectLayerMaskComponent)
    const currentMask = ObjectLayerMaskComponent.mask[entity]
    const mask = currentMask & ~((1 << layer) | 0)
    setComponent(entity, ObjectLayerMaskComponent, mask)
  },

  disableLayers(entity: Entity, ...layers: number[]) {
    if (!hasComponent(entity, ObjectLayerMaskComponent)) setComponent(entity, ObjectLayerMaskComponent)
    const currentMask = ObjectLayerMaskComponent.mask[entity]
    let mask = currentMask
    for (const layer of layers) {
      mask &= ~((1 << layer) | 0)
    }
    setComponent(entity, ObjectLayerMaskComponent, mask)
  },

  toggleLayer(entity: Entity, layer: number) {
    if (!hasComponent(entity, ObjectLayerMaskComponent)) setComponent(entity, ObjectLayerMaskComponent)
    const currentMask = ObjectLayerMaskComponent.mask[entity]
    const mask = currentMask ^ ((1 << layer) | 0)
    setComponent(entity, ObjectLayerMaskComponent, mask)
  },

  setMask(entity: Entity, mask: number) {
    setComponent(entity, ObjectLayerMaskComponent, mask)
  }
})

export class Layer {
  constructor(public entity: Entity) {
    if (!hasComponent(entity, ObjectLayerMaskComponent)) setComponent(entity, ObjectLayerMaskComponent)
  }

  get mask() {
    return ObjectLayerMaskComponent.mask[this.entity]
  }

  set mask(val) {
    setComponent(this.entity, ObjectLayerMaskComponent, val)
  }

  set(channel: number) {
    ObjectLayerMaskComponent.setLayer(this.entity, channel)
  }

  enable(channel: number) {
    ObjectLayerMaskComponent.enableLayer(this.entity, channel)
  }

  enableAll() {
    ObjectLayerMaskComponent.setMask(this.entity, -1)
  }

  toggle(channel: number) {
    ObjectLayerMaskComponent.toggleLayer(this.entity, channel)
  }

  disable(channel: number) {
    ObjectLayerMaskComponent.disableLayer(this.entity, channel)
  }

  disableAll() {
    ObjectLayerMaskComponent.setMask(this.entity, 0)
  }

  test(layers: Layer) {
    return (this.mask & layers.mask) !== 0
  }

  isEnabled(channel: number) {
    return (this.mask & ((1 << channel) | 0)) !== 0
  }
}

/**
 * @deprecated use ObjectLayerMaskComponent instead
 */
export function setObjectLayers(object: Object3D, ...layers: number[]) {
  object.traverse((obj: Object3D) => {
    if (obj.entity) ObjectLayerMaskComponent.setMask(obj.entity, 0)
    obj.layers.disableAll()
    for (const layer of layers) {
      if (obj.entity) ObjectLayerMaskComponent.enableLayer(obj.entity, layers[0])
      obj.layers.enable(layer)
    }
  })
}
