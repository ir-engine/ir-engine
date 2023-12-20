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

import { defineComponent, getComponent, removeComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { GroupComponent } from './GroupComponent'

const maxBitWidth = 32

export const ObjectLayerComponents = [] as any[]

for (let i = 0; i < maxBitWidth; i++) {
  ObjectLayerComponents.push(
    defineComponent({
      name: `ObjectLayer${i}`,

      onInit(entity) {
        const group = getComponent(entity, GroupComponent)
        if (group) {
          for (const object of group) {
            object.layers.enable(i)
          }
        }
        return i
      },

      onRemove(entity, component) {
        const group = getComponent(entity, GroupComponent)
        if (group) {
          for (const object of group) {
            object.layers.disable(i)
          }
        }
      }
    })
  )
}

export const ObjectLayerComponent = defineComponent({
  name: 'ObjectLayerComponent',

  // entitiesBylayer: {} as Record<number, Set<Entity>>,

  onInit(entity) {
    return 1 | 0
  },

  onSet(entity, component, layer) {
    if (layer !== undefined) {
      ObjectLayerComponent.enableLayers(entity, layer)
    }
  },

  enableLayers(entity, ...layers: number[]) {
    // const component = useComponent(entity, ObjectLayerComponent)
    // let mask = component.value
    // for (const layer of layers) {
    //   if (ObjectLayerComponent.entitiesBylayer[layer] === undefined) {
    //     ObjectLayerComponent.entitiesBylayer[layer] = new Set()
    //   }
    //   ObjectLayerComponent.entitiesBylayer[layer].add(entity)
    //   mask |= (1 << layer) | 0
    // }
    // component.set(mask)

    for (const layer of layers) {
      setComponent(entity, ObjectLayerComponents[layer])
    }
  },

  disableLayers(entity, ...layers: number[]) {
    // const component = useComponent(entity, ObjectLayerComponent)
    // let mask = component.value
    // for (const layer of layers) {
    //   ObjectLayerComponent[layer].delete(entity)
    //   mask &= ~((1 << layer) | 0)
    // }
    // component.set(mask)

    for (const layer of layers) {
      removeComponent(entity, ObjectLayerComponents[layer])
    }
  }

  // reactor() {
  //   const entity = useEntityContext()
  //   const component = useComponent(entity, ObjectLayerComponent)

  //   useEffect(() => {
  //     const group = getComponent(entity, GroupComponent)
  //     for (const object of group) {
  //       object.layers.mask = component.value
  //     }
  //   }, [component])

  //   return null
  // }
})
