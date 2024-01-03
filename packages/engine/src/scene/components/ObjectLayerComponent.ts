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

import { Types } from 'bitecs'
import { Entity } from '../../ecs/classes/Entity'
import { defineComponent, removeComponent, setComponent } from '../../ecs/functions/ComponentFunctions'

const maxBitWidth = 32

export const ObjectLayerComponents = Array.from({ length: maxBitWidth }, (_, i) => {
  return defineComponent({
    name: `ObjectLayer${i}`,

    onSet(entity, component) {
      ObjectLayerMaskComponent.mask[entity] |= (1 << i) | 0
    },

    onRemove(entity, component) {
      ObjectLayerMaskComponent.mask[entity] &= ~((1 << i) | 0)
    }
  })
})

export const ObjectLayerMaskComponent = defineComponent({
  name: 'ObjectLayerMaskComponent',
  schema: { mask: Types.i32 },

  onInit(entity) {
    return 1 << 0 // enable layer 0
  },

  onSet(entity, component, mask = 1 << 0) {
    for (let i = 0; i < maxBitWidth; i++) {
      const isSet = (mask & ((1 << i) | 0)) !== 0
      if (isSet) {
        setComponent(entity, ObjectLayerComponents[i])
      } else {
        removeComponent(entity, ObjectLayerComponents[i])
      }
    }
    component.set(ObjectLayerMaskComponent.mask[entity])
  },

  onRemove(entity, component) {
    for (let i = 0; i < maxBitWidth; i++) {
      removeComponent(entity, ObjectLayerComponents[i])
    }
    component.set(0)
  },

  toJSON(entity, component) {
    return component.value
  },

  setLayer(entity: Entity, layer: number) {
    const mask = ObjectLayerMaskComponent.mask[entity] | (1 << layer) | 0
    setComponent(entity, ObjectLayerMaskComponent, mask)
  },

  enableLayers(entity: Entity, ...layers: number[]) {
    const mask = ObjectLayerMaskComponent.mask[entity] | layers.reduce((acc, layer) => acc | (1 << layer) | 0, 0)
    setComponent(entity, ObjectLayerMaskComponent, mask)
  },

  disableLayers(entity: Entity, ...layers: number[]) {
    const mask = ObjectLayerMaskComponent.mask[entity] & layers.reduce((acc, layer) => (acc & ~(1 << layer)) | 0, -1)
    setComponent(entity, ObjectLayerMaskComponent, mask)
  },

  toggleLayer(entity: Entity, layer: number) {
    const mask = (ObjectLayerMaskComponent.mask[entity] ^ (1 << layer)) | 0
    setComponent(entity, ObjectLayerMaskComponent, mask)
  },

  setMask(entity: Entity, mask: number) {
    setComponent(entity, ObjectLayerMaskComponent, mask)
  }
})

export class Layer {
  constructor(public entity: Entity) {
    setComponent(entity, ObjectLayerMaskComponent)
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
    ObjectLayerMaskComponent.enableLayers(this.entity, channel)
  }

  enableAll() {
    ObjectLayerMaskComponent.enableLayers(this.entity, ...[...Array(maxBitWidth).keys()])
  }

  toggle(channel: number) {
    ObjectLayerMaskComponent.toggleLayer(this.entity, channel)
  }

  disable(channel: number) {
    ObjectLayerMaskComponent.disableLayers(this.entity, channel)
  }

  disableAll() {
    ObjectLayerMaskComponent.disableLayers(this.entity, ...[...Array(maxBitWidth).keys()])
    ObjectLayerMaskComponent.mask[this.entity] = 0
  }

  test(layers: Layer) {
    return (this.mask & layers.mask) !== 0
  }

  isEnabled(channel: number) {
    return (this.mask & ((1 << channel) | 0)) !== 0
  }
}
