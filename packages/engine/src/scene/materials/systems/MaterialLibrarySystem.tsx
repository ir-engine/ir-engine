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

import {
  PresentationSystemGroup,
  QueryReactor,
  getComponent,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import {
  MaterialComponent,
  MaterialComponents,
  MaterialPlugins,
  MaterialPrototypeDefinition,
  MaterialPrototypeDefinitions
} from '@etherealengine/spatial/src/renderer/materials/MaterialComponent'
import {
  applyMaterialPlugins,
  createMaterialPlugin,
  createMaterialPrototype,
  setGroupMaterial,
  updateMaterialPrototype
} from '@etherealengine/spatial/src/renderer/materials/materialFunctions'
import { iterateEntityNode } from '@etherealengine/spatial/src/transform/components/EntityTree'

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
    MaterialPrototypeDefinitions.map((prototype: MaterialPrototypeDefinition) => createMaterialPrototype(prototype))
    MaterialPlugins.map((plugin) => {
      createMaterialPlugin(plugin)
    })
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

  return (
    <>
      {
        <QueryReactor
          Components={[MaterialComponent[MaterialComponents.Instance]]}
          ChildEntityReactor={MaterialInstanceReactor}
        />
      }
      <QueryReactor
        Components={[MaterialComponent[MaterialComponents.State]]}
        ChildEntityReactor={MaterialEntityReactor}
      />
    </>
  )

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

const MaterialEntityReactor = () => {
  const entity = useEntityContext()
  const materialComponent = useComponent(entity, MaterialComponent[MaterialComponents.State])
  useEffect(() => {
    if (materialComponent.instances.value)
      for (const sourceEntity of materialComponent.instances.value) {
        iterateEntityNode(sourceEntity, (childEntity) => {
          const uuid = getComponent(childEntity, MaterialComponent[MaterialComponents.Instance]).uuid
          if (uuid) setGroupMaterial(childEntity, uuid)
        })
      }
  }, [materialComponent.material])

  useEffect(() => {
    if (materialComponent.pluginEntities) applyMaterialPlugins(entity)
  }, [materialComponent.pluginEntities])

  useEffect(() => {
    if (materialComponent.prototypeEntity.value) updateMaterialPrototype(entity)
  }, [materialComponent.prototypeEntity])
  return null
}

const MaterialInstanceReactor = () => {
  const entity = useEntityContext()
  const uuid = useComponent(entity, MaterialComponent[MaterialComponents.Instance]).uuid
  useEffect(() => {
    if (uuid.value) setGroupMaterial(entity, uuid.value)
  }, [uuid])
  return null
}

export const MaterialLibrarySystem = defineSystem({
  uuid: 'ee.engine.scene.MaterialLibrarySystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
