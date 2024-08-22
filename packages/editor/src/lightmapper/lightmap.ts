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

import { MeshStandardMaterial, Object3D, Scene, WebGLRenderer } from 'three'

import { getComponent, hasComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { iterateEntityNode } from '@ir-engine/spatial/src/transform/components/EntityTree'

import { runBakingPasses } from './bake'
import { withLightScene } from './lightScene'
import { initializeWorkbench, LIGHTMAP_READONLY_FLAG, WorkbenchSettings } from './workbench'

const meshQuery = defineQuery([MeshComponent])

export async function bakeLightmaps(
  target: Object3D,
  props: WorkbenchSettings,
  requestWork: () => Promise<WebGLRenderer>
) {
  const scene = new Scene()
  const meshes = meshQuery()
  for (const entity of meshes) {
    const mesh = getComponent(entity, MeshComponent)
    mesh.isMesh && Object.assign(mesh.userData, { [LIGHTMAP_READONLY_FLAG]: true })
  }

  iterateEntityNode(
    target.entity,
    (entity) => {
      const mesh = getComponent(entity, MeshComponent)
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      materials.map((material: MeshStandardMaterial) => {
        if (material.lightMap) {
          material.lightMap = null
        }
      })
    },
    (entity) => hasComponent(entity, MeshComponent)
  )

  const workbench = await initializeWorkbench(scene, props, requestWork)
  await withLightScene(workbench, async () => {
    await runBakingPasses(workbench, requestWork)
  })

  for (const entity of meshes) {
    const mesh = getComponent(entity, MeshComponent)
    Object.prototype.hasOwnProperty.call(mesh.userData, LIGHTMAP_READONLY_FLAG) &&
      Reflect.deleteProperty(mesh.userData, LIGHTMAP_READONLY_FLAG)
  }

  return workbench.irradiance
}
