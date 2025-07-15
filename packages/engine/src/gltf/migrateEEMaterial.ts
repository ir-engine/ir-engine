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

import { GLTF } from '@gltf-transform/core'
import { materialValuesToMaterialDef } from './exportGLTFScene'

export const EEMaterialMigrationRegistry = {} as Record<string, string> // prototype name to jsonID

EEMaterialMigrationRegistry['HolographicMaterial'] = 'IR_material_holographic'

export const migrateEEMaterial = (gltf: GLTF.IGLTF) => {
  if (gltf.extensions) {
    if (gltf.extensions['IR_scene_delta']) {
      for (const nodeDeltas of Object.values(gltf.extensions['IR_scene_delta'])) {
        for (const nodeDelta of Object.values(nodeDeltas) as any) {
          if (nodeDelta.prototypeConstructor) {
            if (nodeDelta.prototypeConstructor === 'MeshBasicMaterial') {
              nodeDelta.KHR_materials_unlit = {}
            } else if (nodeDelta.prototypeConstructor === 'MeshPhysicalMaterial') {
              nodeDelta.KHR_materials_specular = {
                specularFactor: nodeDelta.materialParameters.specularIntensity,
                specularTexture: nodeDelta.materialParameters.specularIntensityMap,
                specularColorFactor: nodeDelta.materialParameters.specularColor,
                specularColorTexture: nodeDelta.materialParameters.specularColorMap
              }
            } else {
              nodeDelta[EEMaterialMigrationRegistry[nodeDelta.prototypeConstructor]] = nodeDelta.materialParameters
            }
            delete nodeDelta.materialParameters
            delete nodeDelta.prototypeConstructor
          }
        }
      }
    }
  }

  if (!gltf.extensionsUsed?.includes('EE_material')) return gltf

  for (const material of gltf.materials || []) {
    if (!material.extensions) continue
    const eeMaterial = material.extensions!.EE_material as any
    if (!eeMaterial?.args) continue

    const converted = materialValuesToMaterialDef(eeMaterial.args)
    delete material.extensions.EE_material
    Object.assign(material, converted)
  }

  return gltf
}
