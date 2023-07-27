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

import { Mesh, MeshStandardMaterial, Object3D, WebGLRenderer } from 'three'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import iterateObject3D from '@etherealengine/engine/src/scene/util/iterateObject3D'

import { runBakingPasses } from './bake'
import { withLightScene } from './lightScene'
import { initializeWorkbench, LIGHTMAP_READONLY_FLAG, WorkbenchSettings } from './workbench'

export async function bakeLightmaps(
  target: Object3D,
  props: WorkbenchSettings,
  requestWork: () => Promise<WebGLRenderer>
) {
  const scene = Engine.instance.scene
  iterateObject3D(
    scene,
    (child: Mesh) => {
      child?.isMesh && Object.assign(child.userData, { [LIGHTMAP_READONLY_FLAG]: true })
    },
    (child) => child !== target,
    true
  )
  iterateObject3D(
    target,
    (child: Mesh) => {
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.map((material: MeshStandardMaterial) => {
        if (material.lightMap) {
          material.lightMap = null
        }
      })
    },
    (child: Mesh) => child?.isMesh ?? false
  )
  const workbench = await initializeWorkbench(scene, props, requestWork)
  await withLightScene(workbench, async () => {
    await runBakingPasses(workbench, requestWork)
  })
  iterateObject3D(scene, (child) => {
    Object.prototype.hasOwnProperty.call(child.userData, LIGHTMAP_READONLY_FLAG) &&
      Reflect.deleteProperty(child.userData, LIGHTMAP_READONLY_FLAG)
  })
  return workbench.irradiance
}
