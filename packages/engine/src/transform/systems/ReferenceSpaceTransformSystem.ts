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

import { MeshDepthMaterial, Scene, WebGLRenderTarget } from 'three'

import { updateLocalAvatarPosition, updateLocalAvatarRotation } from '../../avatar/functions/moveAvatar'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { Engine } from '../../ecs/classes/Engine'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { GroupComponent } from '../../scene/components/GroupComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { updateXRCamera } from '../../xr/XRCameraSystem'
import { computeTransformMatrix } from './TransformSystem'

/**
 * This system is responsible for updating the local client avatar position and rotation, and updating the XR camera position.
 * @param world
 * @returns
 */
const skeletonForceUpdateScene = new Scene()
skeletonForceUpdateScene.overrideMaterial = new MeshDepthMaterial()
const dummyRenderTarget = new WebGLRenderTarget(1, 1)

const execute = () => {
  const { localClientEntity } = Engine.instance

  /**
   * 1 - Update local client movement
   */
  if (localClientEntity) {
    updateLocalAvatarPosition()
    updateLocalAvatarRotation()
    computeTransformMatrix(localClientEntity)

    // the following is a workaround for a bug in the multiview rendering implementation, described here:
    // https://github.com/mrdoob/three.js/pull/24048
    // essentially, we are forcing the skeleton of the local client to be uploaded to the GPU here
    if (
      hasComponent(localClientEntity, VisibleComponent) &&
      EngineRenderer.instance.xrManager?.isMultiview &&
      EngineRenderer.instance.xrManager?.isPresenting
    ) {
      const localClientGroup = getComponent(localClientEntity, GroupComponent)
      const renderer = EngineRenderer.instance.renderer
      skeletonForceUpdateScene.children = localClientGroup
      renderer.setRenderTarget(dummyRenderTarget)
      renderer.info.autoReset = false
      renderer.render(skeletonForceUpdateScene, getComponent(Engine.instance.cameraEntity, CameraComponent))
      renderer.info.autoReset = true
      renderer.setRenderTarget(null)
    }
  }

  /**
   * 2 - Update XR camera positions based on world origin and viewer pose
   */
  updateXRCamera()

  /**
   * For whatever reason, this must run at the start of the transform system, before the transform system.
   * @todo - disabled as this doesnt seem necessary anymore
   */
  // applyInputSourcePoseToIKTargets()
}

export const ReferenceSpaceTransformSystem = defineSystem({
  uuid: 'ee.engine.ReferenceSpaceTransformSystem',
  execute
})
