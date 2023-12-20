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
import { defineComponent, hasComponent, removeComponent, setComponent } from '../../ecs/functions/ComponentFunctions'

const maxBitWidth = 32
export const ObjectLayerComponents = Array.from({ length: maxBitWidth }, (_, i) => {
  return defineComponent({
    name: `ObjectLayer${i}`,

    onSet(entity, component) {
      ObjectLayerComponent.mask[entity] |= (1 << i) | 0
    },

    onRemove(entity, component) {
      ObjectLayerComponent.mask[entity] &= ~((1 << i) | 0)
    }
  })
})

export const ObjectLayerComponent = defineComponent({
  name: 'ObjectLayerComponent',
  schema: { mask: Types.i32 },

  onSet(entity, component) {
    ObjectLayerComponent.mask[entity] = 1 | 0
    ObjectLayerComponent.setLayer(entity, 1 | 0)
  },

  setLayer(entity, layer: number) {
    for (let i = 0; i < maxBitWidth; i++) {
      if (i == layer) {
        setComponent(entity, ObjectLayerComponents[i])
      } else {
        removeComponent(entity, ObjectLayerComponents[i])
      }
    }
  },

  enableLayers(entity, ...layers: number[]) {
    for (const layer of layers) {
      setComponent(entity, ObjectLayerComponents[layer])
    }
  },

  disableLayers(entity, ...layers: number[]) {
    for (const layer of layers) {
      removeComponent(entity, ObjectLayerComponents[layer])
    }
  },

  toggleLayer(entity, layer: number) {
    if (hasComponent(entity, ObjectLayerComponents[layer])) {
      ObjectLayerComponent.disableLayers(entity, layer)
    } else {
      ObjectLayerComponent.enableLayers(entity, layer)
    }
  },

  setMask(entity, mask: number) {
    for (let i = 0; i < maxBitWidth; i++) {
      const isSet = (mask & ((1 << i) | 0)) !== 0
      if (isSet) {
        setComponent(entity, ObjectLayerComponents[i])
      } else {
        removeComponent(entity, ObjectLayerComponents[i])
      }
    }
  }
})

export class Layer {
  constructor(public entity: Entity) {
    setComponent(entity, ObjectLayerComponent)
  }

  get mask() {
    return ObjectLayerComponent.mask[this.entity]
  }

  set mask(val) {
    ObjectLayerComponent.setMask(this.entity, val)
  }

  set(channel: number) {
    ObjectLayerComponent.setLayer(this.entity, channel)
  }

  enable(channel: number) {
    ObjectLayerComponent.enableLayers(this.entity, channel)
  }

  enableAll() {
    ObjectLayerComponent.enableLayers(this.entity, ...[...Array(maxBitWidth).keys()])
  }

  toggle(channel: number) {
    ObjectLayerComponent.toggleLayer(this.entity, channel)
  }

  disable(channel: number) {
    ObjectLayerComponent.disableLayers(this.entity, channel)
  }

  disableAll() {
    ObjectLayerComponent.disableLayers(this.entity, ...[...Array(maxBitWidth).keys()])
    ObjectLayerComponent.mask[this.entity] = 0
  }

  test(layers: Layer) {
    return (this.mask & layers.mask) !== 0
  }

  isEnabled(channel: number) {
    return (this.mask & ((1 << channel) | 0)) !== 0
  }
}
