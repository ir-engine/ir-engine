import { Material, Mesh } from 'three'

import { getState } from '@xrengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from '../ecs/functions/ComponentFunctions'
import { GroupComponent } from '../scene/components/GroupComponent'
import { XRDepthOcclusion } from './XRDepthOcclusion'
import { XRState } from './XRState'

/**
 * Updates materials with XR depth map uniforms
 * @param world
 * @returns
 */
export default async function XRDepthOcclusionSystem(world: World) {
  const groupComponent = defineQuery([GroupComponent])
  const xrState = getState(XRState)

  const execute = () => {
    const depthDataTexture = xrState.depthDataTexture.value
    for (const entity of groupComponent()) {
      for (const obj of getComponent(entity, GroupComponent)) {
        obj.traverse((obj: Mesh<any, Material>) => {
          if (obj.material) {
            if (depthDataTexture) XRDepthOcclusion.implementDepthOBCPlugin(obj.material, depthDataTexture)
            else XRDepthOcclusion.removeDepthOBCPlugin(obj.material)
          }
        })
      }
    }
    if (depthDataTexture)
      XRDepthOcclusion.updateDepthMaterials(
        Engine.instance.xrFrame,
        xrState.viewerReferenceSpace.value!,
        depthDataTexture
      )
  }

  const cleanup = async () => {
    removeQuery(world, groupComponent)
  }

  return { execute, cleanup }
}
