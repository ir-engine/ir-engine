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

import { Mesh } from 'three'

import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, getComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { useImmediateEffect } from '@ir-engine/hyperflux'

import { S } from '@ir-engine/ecs'
import { ObjectComponent } from './ObjectComponent'

export const MeshComponent = defineComponent({
  name: 'MeshComponent',

  schema: S.Required(S.NonSerialized(S.Type<Mesh>())),

  reactor: () => {
    const entity = useEntityContext()
    // const meshComponent = useComponent(entity, MeshComponent)
    // useResource(getComponent(entity, MeshComponent), entity)
    // const sceneLayer = useOptionalComponent(entity, ObjectLayerComponents[ObjectLayers.Scene])

    useImmediateEffect(() => {
      setComponent(entity, ObjectComponent, getComponent(entity, MeshComponent))
      return () => {
        removeComponent(entity, ObjectComponent)
      }
    }, [])

    // const geometryValue = meshComponent.geometry.value
    // const [geometryResource] = useResource(isHookstateValue(geometryValue) ? null : geometryValue, entity)

    // const materialValue = meshComponent.material.value
    // const [materialResource] = useResource(isHookstateValue(materialValue) ? null : materialValue, entity)

    // useEffect(() => {
    //   if (!sceneLayer) return
    //   const box = meshComponent.geometry.boundingBox.get(NO_PROXY) as Box3 | null
    //   if (!box) return

    //   setComponent(entity, BoundingBoxComponent, { box: box })
    //   return () => {
    //     removeComponent(entity, BoundingBoxComponent)
    //   }
    // }, [sceneLayer && meshComponent.geometry.value.boundingBox])

    // useEffect(() => {
    //   const geometry = meshComponent.geometry.value
    //   if (geometry !== geometryResource.value && !isHookstateValue(geometry)) geometryResource.set(geometry)
    // }, [meshComponent.geometry])

    // useEffect(() => {
    //   const material = meshComponent.material.value

    //   if (material !== materialResource.value && !isHookstateValue(material)) materialResource.set(material)

    //   if (Array.isArray(material)) {
    //     material.forEach((material) => (material.needsUpdate = true))
    //   } else {
    //     ;(material as Material).needsUpdate = true
    //   }
    // }, [meshComponent.material])

    // useEffect(() => {
    //   const mesh = meshComponent.value
    //   if (mesh !== meshResource.value) {
    //     meshResource.set(mesh)
    //     setComponent(entity, ObjectComponent, meshResource.get(NO_PROXY) as Mesh)
    //   }
    // }, [meshComponent])

    return null
  }
})
