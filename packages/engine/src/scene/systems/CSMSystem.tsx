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

import { isClient } from '@etherealengine/common/src/utils/getEnvironment'
import {
  ComponentType,
  Engine,
  Entity,
  defineQuery,
  getComponent,
  getMutableComponent,
  hasComponent
} from '@etherealengine/ecs'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { AnimationSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { DirectionalLightComponent, TransformComponent } from '@etherealengine/spatial'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { Vector3_Zero } from '@etherealengine/spatial/src/common/constants/MathConstants'
import { CSMLightComponent } from '@etherealengine/spatial/src/renderer/components/CSMLightComponent'
import Frustum from '@etherealengine/spatial/src/renderer/csm/Frustum'
import { useShadowsEnabled } from '@etherealengine/spatial/src/renderer/functions/RenderSettingsFunction'
import { ArrayCamera, Box3, Material, Matrix4, Object3D, Shader, Vector2, Vector3 } from 'three'

const _defaultLightDirection = new Vector3(1, -1, 1).normalize()
const _sourceLightDirection = new Vector3()
const _lightDirectionUp = Object3D.DEFAULT_UP

const _lightOrientationMatrix = new Matrix4()
const _lightOrientationMatrixInverse = new Matrix4()

const _cameraToLightMatrix = new Matrix4()
const _lightSpaceFrustum = new Frustum()
const _center = new Vector3()
const _bbox = new Box3()

const csmLightQuery = defineQuery([CSMLightComponent])

const entityShaderMap = new Map<Entity, Map<Material, Shader>>()

const updateShadowBounds = (csmLightComponent: ComponentType<typeof CSMLightComponent>, camera: ArrayCamera) => {
  const { frustums, lights, maxFar, shadowBias, shadowNormalBias, lightMargin, fade } = csmLightComponent
  for (let i = 0; i < frustums.length; i++) {
    const light = lights[i]

    const shadowCam = light.shadow.camera
    const frustum = frustums[i]

    // Get the two points that represent that furthest points on the frustum assuming
    // that's either the diagonal across the far plane or the diagonal across the whole
    // frustum itself.
    const nearVerts = frustum.vertices.near
    const farVerts = frustum.vertices.far
    const point1 = farVerts[0]
    let point2
    if (point1.distanceTo(farVerts[2]) > point1.distanceTo(nearVerts[2])) {
      point2 = farVerts[2]
    } else {
      point2 = nearVerts[2]
    }

    let squaredBBWidth = point1.distanceTo(point2)
    if (fade) {
      // expand the shadow extents by the fade margin if fade is enabled.
      const far = Math.max(camera.far, maxFar)
      const linearDepth = frustum.vertices.far[0].z / (far - camera.near)
      const margin = 0.25 * Math.pow(linearDepth, 2.0) * (far - camera.near)

      squaredBBWidth += margin
    }

    shadowCam.left = -squaredBBWidth / 2
    shadowCam.right = squaredBBWidth / 2
    shadowCam.top = squaredBBWidth / 2
    shadowCam.bottom = -squaredBBWidth / 2
    shadowCam.near = 0
    shadowCam.far = squaredBBWidth + lightMargin
    shadowCam.updateProjectionMatrix()

    light.shadow.bias = shadowBias * squaredBBWidth
    light.shadow.normalBias = shadowNormalBias * squaredBBWidth
  }
}

const getExtendedBreaks = (target: Vector2[], csmLightComponent: ComponentType<typeof CSMLightComponent>) => {
  const { breaks, cascades } = csmLightComponent

  while (target.length < breaks.length) {
    target.push(new Vector2())
  }

  target.length = breaks.length

  for (let i = 0; i < cascades; i++) {
    const amount = breaks[i]
    const prev = breaks[i - 1] || 0
    target[i].x = prev
    target[i].y = amount
  }
}

const updateUniforms = (
  csmLightEntity: Entity,
  csmLightComponent: ComponentType<typeof CSMLightComponent>,
  camera: ArrayCamera
) => {
  const { maxFar, fade } = csmLightComponent
  const far = Math.min(camera.far, maxFar)

  const shaders = entityShaderMap.get(csmLightEntity)
  if (!shaders) return
  shaders.forEach(function (shader: Shader, material: Material) {
    if (shader !== null) {
      const uniforms = shader.uniforms
      getExtendedBreaks(uniforms.CSM_cascades.value, csmLightComponent)
      uniforms.cameraNear.value = camera.near
      uniforms.shadowFar.value = far
    }

    if (!fade && 'CSM_FADE' in material.defines!) {
      delete material.defines.CSM_FADE
      material.needsUpdate = true
    } else if (fade && !('CSM_FADE' in material.defines!)) {
      material.defines!.CSM_FADE = ''
      material.needsUpdate = true
    }
  })
}

const execute = () => {
  if (!isClient) return

  for (const csmLightEntity of csmLightQuery()) {
    const csmLightComponent = getComponent(csmLightEntity, CSMLightComponent)
    /** @todo get camera from non deprecatetd api */
    const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)

    let lightDirection
    if (hasComponent(csmLightEntity, DirectionalLightComponent)) {
      const directionalLight = getComponent(csmLightEntity, DirectionalLightComponent).light
      lightDirection = _sourceLightDirection.subVectors(directionalLight.target.position, directionalLight.position)
    } else {
      lightDirection = _defaultLightDirection
    }

    if (csmLightComponent.needsUpdate) {
      // Init Cascades
      camera.updateProjectionMatrix()
      csmLightComponent.mainFrustum.setFromProjectionMatrix(camera.projectionMatrix, csmLightComponent.maxFar)
      csmLightComponent.mainFrustum.split(csmLightComponent.breaks, csmLightComponent.frustums)

      updateShadowBounds(csmLightComponent, camera)
      updateUniforms(csmLightEntity, csmLightComponent, camera)

      for (const light of csmLightComponent.lights) {
        light.shadow.map?.dispose()
        light.shadow.map = null as any
        light.shadow.camera.updateProjectionMatrix()
        light.shadow.needsUpdate = true
      }
      getMutableComponent(csmLightEntity, CSMLightComponent).needsUpdate.set(false)
    }

    const { frustums, lights, shadowMapSize, lightMargin } = csmLightComponent
    for (let i = 0; i < frustums.length; i++) {
      const light = lights[i]
      const frustum = frustums[i]
      const shadowCam = light.shadow.camera

      const texelWidth = (shadowCam.right - shadowCam.left) / shadowMapSize
      const texelHeight = (shadowCam.top - shadowCam.bottom) / shadowMapSize

      // This matrix only represents sun orientation, origin is zero
      _lightOrientationMatrix.lookAt(Vector3_Zero, lightDirection, _lightDirectionUp)
      _lightOrientationMatrixInverse.copy(_lightOrientationMatrix).invert()

      _cameraToLightMatrix.multiplyMatrices(_lightOrientationMatrixInverse, camera.matrixWorld)
      frustum.toSpace(_cameraToLightMatrix, _lightSpaceFrustum)

      const nearVerts = _lightSpaceFrustum.vertices.near
      const farVerts = _lightSpaceFrustum.vertices.far

      _bbox.makeEmpty()
      for (let j = 0; j < 4; j++) {
        _bbox.expandByPoint(nearVerts[j])
        _bbox.expandByPoint(farVerts[j])
      }

      _bbox.getCenter(_center)
      _center.z = _bbox.max.z + lightMargin
      // Round X and Y to avoid shadow shimmering when moving or rotating the camera
      _center.x = Math.floor(_center.x / texelWidth) * texelWidth
      _center.y = Math.floor(_center.y / texelHeight) * texelHeight
      // Center is currently in light space, so we need to go back to light parent space
      _center.applyMatrix4(_lightOrientationMatrix)

      getComponent(light.entity, TransformComponent).position.copy(_center)
      light.target.position.copy(_center).add(lightDirection)

      light.target.matrix.compose(light.target.position, light.target.quaternion, light.target.scale)
      light.target.matrixWorld.copy(light.target.matrix)
    }
  }
}

const reactor = () => {
  if (!isClient) return null

  const useShadows = useShadowsEnabled()

  return null
}

export const CSMSystem = defineSystem({
  uuid: 'ee.engine.CSMSystem',
  insert: { with: AnimationSystemGroup },
  execute,
  reactor
})
