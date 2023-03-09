import { Mesh, MeshStandardMaterial, Object3D, Scene, WebGLRenderer } from 'three'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import iterateObject3D from '@etherealengine/engine/src/scene/util/iterateObject3D'

import { isAncestor } from '../functions/getDetachedObjectsRoots'
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
