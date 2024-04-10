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

import React, { ReactElement, useEffect } from 'react'

import { getMutableState } from '@etherealengine/hyperflux'

import {
  EntityUUID,
  PresentationSystemGroup,
  UUIDComponent,
  getMutableComponent,
  getOptionalComponent,
  getOptionalMutableComponent,
  setComponent
} from '@etherealengine/ecs'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { GroupQueryReactor, GroupReactorProps } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { MaterialComponent } from '@etherealengine/spatial/src/renderer/materials/MaterialComponent'
import { hashMaterial } from '@etherealengine/spatial/src/renderer/materials/materialFunctions'
import { Mesh } from 'three'
import { SourceComponent } from '../../components/SourceComponent'
import { MaterialLibraryState, initializeMaterialLibrary } from '../MaterialLibrary'
import { SourceType } from '../components/MaterialSource'
import { registerMaterial, registerMaterialInstance } from '../functions/MaterialLibraryFunctions'

// function MaterialReactor({ materialId }: { materialId: string }) {
//   const materialLibrary = useState(getMutableState(MaterialLibraryState))
//   const component = materialLibrary.materials[materialId]
//   useEffect(() => {
//     const material = component.material.value
//     component.plugins.value.forEach((plugin) => {
//       removeMaterialPlugin(material, plugin)
//       applyMaterialPlugin(material, plugin)
//     })
//   }, [component.plugins])
//   return null
// }

// function PluginReactor({ pluginId }: { pluginId: string }) {
//   const materialLibrary = useState(getMutableState(MaterialLibraryState))
//   const component = materialLibrary.plugins[pluginId]
//   return null
// }

const reactor = (): ReactElement => {
  useEffect(() => {
    initializeMaterialLibrary()
    return () => {
      const materialLibraryState = getMutableState(MaterialLibraryState)
      // todo, to make extensible only clear those initialized in initializeMaterialLibrary
      materialLibraryState.materials.set({})
      materialLibraryState.prototypes.set({})
      materialLibraryState.sources.set({})
      materialLibraryState.plugins.set({})
    }
  }, [])

  // useEffect(() => {
  //   const materialIds = materialLibrary.materials.keys
  //   for (const materialId of materialIds) {
  //     const component = materialLibrary.materials[materialId]
  //     //if the material is missing, check if its prototype is present now
  //     if (component.status.value === 'MISSING' && !!materialLibrary.prototypes[component.prototype.value]) {
  //       //if the prototype is present, create the material
  //       const material = component.material.get(NO_PROXY)
  //       const parms = material.userData.args
  //       const factory = protoIdToFactory(component.prototype.value)
  //       const newMaterial = factory(parms)
  //       replaceMaterial(material, newMaterial)
  //       newMaterial.userData = material.userData
  //       delete newMaterial.userData.args
  //       const src = JSON.parse(JSON.stringify(component.src.value))
  //       registerMaterial(newMaterial, src)
  //       unregisterMaterial(material)
  //     }
  //   }
  // }, [materialLibrary.prototypes])

  return <GroupQueryReactor GroupChildReactor={MaterialGroupReactor} Components={[VisibleComponent]} />
  // const plugins = materialLibrary.plugins
  // return (
  //   <>
  //     {materialLibrary.materials.keys.map((materialId) => (
  //       <MaterialReactor key={materialId} materialId={materialId} />
  //     ))}
  //     {plugins.keys.map((pluginId) => (
  //       <PluginReactor pluginId={pluginId} key={pluginId} />
  //     ))}
  //   </>
  // )
}

const MaterialGroupReactor = ({ obj, entity }: GroupReactorProps) => {
  useEffect(() => {
    const material = (obj as Mesh).material
    if (!material) return
    const materials = Array.isArray(material) ? material : [material]
    materials.map((material) => {
      //todo use a source without a root entity uuid at the start
      const path = getOptionalComponent(entity, SourceComponent) ?? ''
      //if we already have a unique material hash, we don't need to register it again, reuse the existing one
      const entityFromHash = MaterialComponent.materialByHash[hashMaterial(path, material.name)]
      if (entityFromHash) {
        const materialComponent = getOptionalMutableComponent(entity, MaterialComponent)
        if (!materialComponent) setComponent(entity, MaterialComponent, { uuid: [entityFromHash] })
        else materialComponent.uuid.set([...materialComponent.uuid.value, entityFromHash])
        return
      }
      if (!UUIDComponent.getEntityByUUID(material.uuid as EntityUUID)) {
        if (material.plugins) {
          material.customProgramCacheKey = () =>
            material.plugins!.map((plugin) => plugin.toString()).reduce((x, y) => x + y, '')
        }
        const materialEntity = registerMaterial(material, {
          type: SourceType.BUILT_IN,
          path
        })
        const materialComponent = getMutableComponent(materialEntity, MaterialComponent)
        material.userData?.plugins && materialComponent.plugins.set(material.userData['plugins'])
      }
      registerMaterialInstance(material, entity)
    })
  }, [])

  return null
}

export const MaterialLibrarySystem = defineSystem({
  uuid: 'ee.engine.scene.MaterialLibrarySystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
