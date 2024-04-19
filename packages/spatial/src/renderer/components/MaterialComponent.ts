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

import { Material } from 'three'

import { useDidMount } from '@etherealengine/common/src/utils/useDidMount'
import { useEntityContext } from '@etherealengine/ecs'
import { defineComponent, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { useResource } from '@etherealengine/engine/src/assets/functions/resourceHooks'
import { matchesMeshMaterial } from '../../common/functions/MatchesUtils'

export const MaterialComponent = defineComponent({
  name: 'Material Component',
  jsonID: 'EE_material',

  onInit: (entity) => null! as Material | Material[],

  onSet: (entity, component, material: Material | Material[]) => {
    if (!matchesMeshMaterial.test(material)) throw new Error('MaterialComponent: Invalid material')
    component.set(material)
  },

  reactor: () => {
    const entity = useEntityContext()
    const materialComponent = useComponent(entity, MaterialComponent)
    const [materialResource] = useResource<Material | Material[]>(
      materialComponent.value,
      entity,
      !Array.isArray(materialComponent.value) ? (materialComponent.value as Material).uuid : undefined
    )

    useDidMount(() => {
      if (materialComponent.value != materialResource.value) materialResource.set(materialComponent.value)
    }, [materialComponent])

    return null
  }
})
