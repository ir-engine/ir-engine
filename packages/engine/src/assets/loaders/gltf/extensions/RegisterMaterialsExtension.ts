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

import { Mesh, Object3D } from 'three'

import { getState } from '@etherealengine/hyperflux'

import { EntityUUID } from '@etherealengine/ecs'
import { UUIDComponent } from '@etherealengine/network'
import iterateObject3D from '@etherealengine/spatial/src/common/functions/iterateObject3D'
import { MaterialLibraryState } from '../../../../scene/materials/MaterialLibrary'
import { SourceType } from '../../../../scene/materials/components/MaterialSource'
import {
  materialIsRegistered,
  registerMaterial,
  registerMaterialInstance
} from '../../../../scene/materials/functions/MaterialLibraryFunctions'
import { GLTF, GLTFLoaderPlugin } from '../GLTFLoader'
import { ImporterExtension } from './ImporterExtension'

export function registerMaterials(root: Object3D, type: SourceType = SourceType.EDITOR_SESSION, path = '') {
  const materialLibrary = getState(MaterialLibraryState)
  iterateObject3D(root, (mesh: Mesh) => {
    if (!mesh?.isMesh) return
    mesh.entity = UUIDComponent.getOrCreateEntityByUUID(mesh.uuid as EntityUUID)
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    materials
      .filter((material) => !materialLibrary.materials[material.uuid])
      .map((material) => {
        if (!materialIsRegistered(material)) {
          if (material.plugins) {
            material.customProgramCacheKey = () =>
              material.plugins!.map((plugin) => plugin.toString()).reduce((x, y) => x + y, '')
          }
          const materialComponent = registerMaterial(material, { type, path })
          material.userData?.plugins && materialComponent.plugins.set(material.userData['plugins'])
        }
        registerMaterialInstance(material, mesh.entity)
        //iterate intersected object in the scene and set material
      })
  })
}
export default class RegisterMaterialsExtension extends ImporterExtension implements GLTFLoaderPlugin {
  name = 'EE_RegisterMaterialsExtension'
  async afterRoot(result: GLTF) {
    const parser = this.parser
    registerMaterials(result.scene, SourceType.MODEL, parser.options.url)
  }
}
