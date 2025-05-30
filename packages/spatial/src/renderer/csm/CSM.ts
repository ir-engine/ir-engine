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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import {
  Box3,
  ColorRepresentation,
  DirectionalLight,
  MathUtils,
  Matrix4,
  Object3D,
  ShaderChunk,
  Vector2,
  Vector3
} from 'three'

import { createEntity, defineQuery, EntityTreeComponent, removeEntity, UUIDComponent } from '@ir-engine/ecs'
import {
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { Entity, EntityID, SourceID } from '@ir-engine/ecs/src/Entity'
import { NO_PROXY } from '@ir-engine/hyperflux'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { NameComponent } from '../../common/NameComponent'
import { Vector3_Zero } from '../../common/constants/MathConstants'
import { ObjectComponent } from '../../renderer/components/ObjectComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { MaterialStateComponent } from '../materials/MaterialComponent'
import { CSMComponent } from './CSMComponent'
import { CSMPluginComponent } from './CSMPluginComponent'
import Frustum from './Frustum'
import Shader from './Shader'

const originalLightsFragmentBegin = ShaderChunk.lights_fragment_begin
const originalLightsParsBegin = ShaderChunk.lights_pars_begin

const _lightOrientationMatrix = new Matrix4()
const _lightOrientationMatrixInverse = new Matrix4()

const _cameraToLightMatrix = new Matrix4()
const _lightSpaceFrustum = new Frustum()
const _center = new Vector3()
const _bbox = new Box3()
const _uniformArray = []
const _logArray = []

export const CSMModes = {
  UNIFORM: 'UNIFORM',
  LOGARITHMIC: 'LOGARITHMIC',
  PRACTICAL: 'PRACTICAL',
  CUSTOM: 'CUSTOM'
}

export type CSMParams = {
  light?: DirectionalLight
  cascades?: number
  maxFar?: number
  mode?: (typeof CSMModes)[keyof typeof CSMModes]
  shadowMapSize?: number
  shadowBias?: number
  lightDirection?: Vector3
  lightDirectionUp?: Vector3
  lightIntensity?: number
  lightColor?: ColorRepresentation
  lightNear?: number
  lightFar?: number
  lightMargin?: number
  fade?: boolean
}

function uniformSplit(amount: number, near: number, far: number, target: number[]): void {
  for (let i = 1; i < amount; i++) {
    target.push((near + ((far - near) * i) / amount) / far)
  }

  target.push(1)
}

function logarithmicSplit(amount: number, near: number, far: number, target: number[]): void {
  for (let i = 1; i < amount; i++) {
    target.push((near * (far / near) ** (i / amount)) / far)
  }

  target.push(1)
}

function practicalSplit(amount: number, near: number, far: number, lambda: number, target: number[]): void {
  _uniformArray.length = 0
  _logArray.length = 0
  logarithmicSplit(amount, near, far, _logArray)
  uniformSplit(amount, near, far, _uniformArray)

  for (let i = 1; i < amount; i++) {
    target.push(MathUtils.lerp(_uniformArray[i - 1], _logArray[i - 1], lambda))
  }

  target.push(1)
}

function createLight(i: number, rendererEntity: Entity): void {
  const csm = getMutableComponent(rendererEntity, CSMComponent)

  const light = new DirectionalLight(csm.lightColor.value, csm.lightIntensity.value)
  light.castShadow = true
  light.frustumCulled = false

  light.shadow.mapSize.width = csm.shadowMapSize.value
  light.shadow.mapSize.height = csm.shadowMapSize.value

  light.shadow.camera.near = 0
  light.shadow.camera.far = 1

  const lightEntity = createEntity()
  setComponent(lightEntity, UUIDComponent, {
    entitySourceID: (UUIDComponent.get(rendererEntity) + 'csm') as SourceID,
    entityID: ('light-' + UUIDComponent.generate()) as EntityID
  })
  setComponent(lightEntity, NameComponent, 'CSM light ' + i)
  setComponent(lightEntity, VisibleComponent)
  setComponent(lightEntity, TransformComponent)
  setComponent(lightEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
  setComponent(lightEntity, ObjectComponent, light)

  csm.lightEntities.merge([lightEntity])
  csm.lights.merge([light])

  light.name = 'CSM_' + light.name
  light.target.name = 'CSM_' + light.target.name
}

function createLights(sourceLight?: DirectionalLight, rendererEntity?: Entity): void {
  const entity = rendererEntity || Engine.instance.viewerEntity
  const csm = getMutableComponent(entity, CSMComponent)

  /**@todo why aren't these being cleared after the component is ostensibly removed and reset??? */
  csm.lights.set([])
  csm.lightEntities.set([])

  if (sourceLight) {
    csm.merge({
      sourceLight: sourceLight,
      shadowBias: sourceLight.shadow.bias,
      lightIntensity: sourceLight.intensity,
      lightColor: sourceLight.color.clone()
    })

    for (let i = 0; i < csm.cascades.value; i++) {
      createLight(i, entity)
    }
    return
  }

  for (let i = 0; i < csm.cascades.value; i++) {
    createLight(i, entity)
  }
}

function initCascades(rendererEntity?: Entity): void {
  const entity = rendererEntity || Engine.instance.viewerEntity
  const csm = getMutableComponent(entity, CSMComponent)

  const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
  camera.updateProjectionMatrix()

  const mainFrustum = new Frustum()
  mainFrustum.setFromProjectionMatrix(camera.projectionMatrix, csm.maxFar.value)

  const frustums: Frustum[] = []

  mainFrustum.split(csm.breaks.value as number[], frustums)

  csm.merge({
    mainFrustum,
    frustums
  })
}

function updateShadowBounds(rendererEntity?: Entity): void {
  const entity = rendererEntity || Engine.instance.viewerEntity
  const csm = getComponent(entity, CSMComponent)
  const frustums = csm.frustums

  for (let i = 0; i < frustums.length; i++) {
    const light = csm.lights[i]
    if (!light) continue

    const shadowCam = light.shadow.camera
    const frustum = csm.frustums[i]

    // Get the two points that represent that furthest points on the frustum assuming
    // that's either the diagonal across the far plane or the diagonal across the whole
    // frustum itself.
    const nearVerts = frustum.vertices.near
    const farVerts = frustum.vertices.far
    const point1 = farVerts[0]
    let point2: Vector3
    if (point1.distanceTo(farVerts[2]) > point1.distanceTo(nearVerts[2])) {
      point2 = farVerts[2]
    } else {
      point2 = nearVerts[2]
    }

    let squaredBBWidth = point1.distanceTo(point2)
    if (csm.fade) {
      // expand the shadow extents by the fade margin if fade is enabled.
      const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
      const far = Math.max(camera.far, csm.maxFar)
      const linearDepth = frustum.vertices.far[0].z / (far - camera.near)
      const margin = 0.25 * Math.pow(linearDepth, 2.0) * (far - camera.near)

      squaredBBWidth += margin
    }

    shadowCam.left = -squaredBBWidth / 2
    shadowCam.right = squaredBBWidth / 2
    shadowCam.top = squaredBBWidth / 2
    shadowCam.bottom = -squaredBBWidth / 2
    shadowCam.near = 0
    shadowCam.far = squaredBBWidth + csm.lightMargin
    shadowCam.updateProjectionMatrix()

    light.shadow.bias = csm.shadowBias * squaredBBWidth
    light.shadow.normalBias = csm.shadowNormalBias * squaredBBWidth
  }
}

function getBreaks(rendererEntity?: Entity): void {
  const entity = rendererEntity || Engine.instance.viewerEntity
  const csm = getComponent(entity, CSMComponent)
  const mutableCsm = getMutableComponent(entity, CSMComponent)

  const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
  const far = Math.min(camera.far, csm.maxFar)

  // Create a new breaks array
  const breaks: number[] = []

  switch (csm.mode) {
    case CSMModes.UNIFORM:
      uniformSplit(csm.cascades, camera.near, far, breaks)
      break
    case CSMModes.LOGARITHMIC:
      logarithmicSplit(csm.cascades, camera.near, far, breaks)
      break
    case CSMModes.PRACTICAL:
      practicalSplit(csm.cascades, camera.near, far, 0.5, breaks)
      break
    // case CSMModes.CUSTOM:
    //   if (csm.customSplitsCallback === undefined) console.error('CSM: Custom split scheme callback not defined.')
    //   csm.customSplitsCallback!(csm.cascades, camera.near, far, breaks)
    //   break
  }

  // Update the component
  mutableCsm.breaks.set(breaks)
}

function updateCSM(rendererEntity: Entity): void {
  const entity = rendererEntity
  const csm = getComponent(entity, CSMComponent)
  const mutableCsm = getMutableComponent(entity, CSMComponent)

  if (csm.sourceLight) {
    // Update light direction
    const newLightDirection = csm.lightDirection
      .clone()
      .subVectors(csm.sourceLight.target.position, csm.sourceLight.position)
    mutableCsm.lightDirection.set(newLightDirection)
  }

  if (csm.needsUpdate) {
    injectInclude()
    updateFrustums(entity)
    for (const light of csm.lights) {
      light.shadow.map?.dispose()
      light.shadow.map = null as any
      light.shadow.camera.updateProjectionMatrix()
      light.shadow.needsUpdate = true
    }
    mutableCsm.needsUpdate.set(false)
  }

  const camera = getComponent(Engine.instance.cameraEntity, TransformComponent)
  const frustums = csm.frustums

  for (let i = 0; i < frustums.length; i++) {
    const light = csm.lights[i]
    const frustum = frustums[i]
    const shadowCam = light.shadow.camera

    const texelWidth = (shadowCam.right - shadowCam.left) / csm.shadowMapSize
    const texelHeight = (shadowCam.top - shadowCam.bottom) / csm.shadowMapSize

    // This matrix only represents sun orientation, origin is zero
    _lightOrientationMatrix.lookAt(Vector3_Zero, csm.lightDirection, csm.lightDirectionUp)
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
    _center.z = _bbox.max.z + csm.lightMargin
    // Round X and Y to avoid shadow shimmering when moving or rotating the camera
    _center.x = Math.floor(_center.x / texelWidth) * texelWidth
    _center.y = Math.floor(_center.y / texelHeight) * texelHeight
    // Center is currently in light space, so we need to go back to light parent space
    _center.applyMatrix4(_lightOrientationMatrix)

    getComponent(csm.lightEntities[i], TransformComponent).position.copy(_center)
    light.target.position.copy(_center).add(csm.lightDirection)

    light.target.matrix.compose(light.target.position, light.target.quaternion, light.target.scale)
    light.target.matrixWorld.copy(light.target.matrix)
  }
}

function injectInclude(): void {
  ShaderChunk.lights_fragment_begin = Shader.lights_fragment_begin
  ShaderChunk.lights_pars_begin = Shader.lights_pars_begin
}

function removeInclude(): void {
  ShaderChunk.lights_fragment_begin = originalLightsFragmentBegin
  ShaderChunk.lights_pars_begin = originalLightsParsBegin
}

function updateUniforms(rendererEntity?: Entity): void {
  const entity = rendererEntity || Engine.instance.viewerEntity
  const csm = getMutableComponent(entity, CSMComponent)

  const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
  const far = Math.min(camera.far, csm.maxFar.value)

  // Create a new shaders object to update
  const updatedShaders = { ...csm.shaders.get(NO_PROXY) }

  for (const materialUuid in updatedShaders) {
    const shader = updatedShaders[materialUuid]

    if (!shader) continue

    const uniforms = (shader as any).uniforms
    uniforms.cameraNear.value = Math.min(csm.maxFar.value, camera.near)
    uniforms.shadowFar.value = far
  }

  csm.shaders.set(updatedShaders)

  const materialEntities = csmPluginQuery()

  for (const materialEntity of materialEntities) {
    if (hasComponent(materialEntity, MaterialStateComponent)) {
      const materialComponent = getComponent(materialEntity, MaterialStateComponent)
      const material = materialComponent.material

      if (!material?.isMaterial || !material.defines) continue

      if (!csm.fade.value && 'CSM_FADE' in material.defines) {
        delete material.defines.CSM_FADE
        material.needsUpdate = true
      } else if (csm.fade.value && !('CSM_FADE' in material.defines)) {
        material.defines.CSM_FADE = ''
        material.needsUpdate = true
      }
    }
  }
}

function getExtendedBreaks(target: Vector2[], rendererEntity?: Entity): Vector2[] {
  const entity = rendererEntity || Engine.instance.viewerEntity
  const csm = getComponent(entity, CSMComponent)

  while (target.length < csm.breaks.length) {
    target.push(new Vector2())
  }

  target.length = csm.breaks.length

  for (let i = 0; i < csm.cascades; i++) {
    const amount = csm.breaks[i] || 0
    const prev = csm.breaks[i - 1] || 0
    target[i].x = prev
    target[i].y = amount
  }

  return target
}

function updateFrustums(rendererEntity?: Entity): void {
  getBreaks(rendererEntity)
  initCascades(rendererEntity)
  updateShadowBounds(rendererEntity)
  updateUniforms(rendererEntity)
}

function removeCSMLights(rendererEntity: Entity): void {
  const entity = rendererEntity
  const csm = getMutableComponent(entity, CSMComponent)

  csm.lights.value.forEach((light) => {
    light.dispose()
  })
  csm.lightEntities.value.forEach((entity) => {
    removeEntity(entity)
  })

  csm.lightEntities.set([])
  csm.lights.set([])
}

const csmPluginQuery = defineQuery([CSMPluginComponent])

function disposeCSM(rendererEntity: Entity): void {
  const materialEntities = csmPluginQuery()

  for (const materialEntity of materialEntities) {
    if (hasComponent(materialEntity, CSMPluginComponent)) {
      removeComponent(materialEntity, CSMPluginComponent)
    }
  }
  if (hasComponent(rendererEntity, CSMComponent)) removeCSMLights(rendererEntity)
  removeComponent(rendererEntity, CSMComponent)
}

const CSMDefaults = Object.freeze({
  cascades: 5,
  maxFar: 100,
  mode: CSMModes.PRACTICAL,
  shadowMapSize: 1024,
  shadowBias: 0,
  shadowNormalBias: 0,
  lightDirection: new Vector3(1, -1, 1).normalize(),
  lightDirectionUp: Object3D.DEFAULT_UP.clone(),
  lightColor: 0xffffff,
  lightIntensity: 1,
  lightMargin: 200,
  fade: true,
  mainFrustum: new Frustum(),
  frustums: [],
  breaks: [],
  lights: [],
  lightEntities: [],
  shaders: {},
  needsUpdate: true
})

function initCSM(params: CSMParams = {}, rendererEntity?: Entity): void {
  const entity = rendererEntity || Engine.instance.viewerEntity

  // Ensure the entity has a CSMComponent
  if (!hasComponent(entity, CSMComponent)) {
    setComponent(entity, CSMComponent)
  }

  const csm = getMutableComponent(entity, CSMComponent)

  csm.set({
    cascades: params.cascades ?? CSMDefaults.cascades,
    maxFar: params.maxFar ?? CSMDefaults.maxFar,
    mode: params.mode ?? CSMDefaults.mode,
    shadowMapSize: params.shadowMapSize ?? CSMDefaults.shadowMapSize,
    shadowBias: params.shadowBias ?? CSMDefaults.shadowBias,
    shadowNormalBias: CSMDefaults.shadowNormalBias,
    lightDirection: params.lightDirection ?? CSMDefaults.lightDirection,
    lightDirectionUp: params.lightDirectionUp ?? CSMDefaults.lightDirectionUp,
    lightColor: params.lightColor ?? CSMDefaults.lightColor,
    lightIntensity: params.lightIntensity ?? CSMDefaults.lightIntensity,
    lightMargin: params.lightMargin ?? CSMDefaults.lightMargin,
    fade: params.fade ?? CSMDefaults.fade,
    mainFrustum: CSMDefaults.mainFrustum,
    frustums: CSMDefaults.frustums,
    breaks: CSMDefaults.breaks,
    lights: CSMDefaults.lights,
    lightEntities: CSMDefaults.lightEntities,
    shaders: CSMDefaults.shaders,
    needsUpdate: CSMDefaults.needsUpdate
  })

  createLights(params.light, entity)
  updateFrustums(entity)
  injectInclude()
}

function updateProperty(key: string, value: any, rendererEntity?: Entity): void {
  const entity = rendererEntity || Engine.instance.viewerEntity
  const csm = getComponent(entity, CSMComponent)

  const props = key.split('.')
  const last = props[props.length - 1]
  csm.lights.forEach((cascade) => {
    let obj = cascade

    for (let i = 0; i < props.length - 1; i++) {
      obj = obj[props[i]]
    }

    if (obj[last] && typeof obj[last].copy === 'function') {
      obj[last].copy(value)
    } else {
      obj[last] = value
    }
  })
}

export const CSM = {
  initCSM,
  update: updateCSM,
  updateProperty,
  injectInclude,
  removeInclude,
  updateUniforms,
  getExtendedBreaks,
  updateFrustums,
  remove: removeCSMLights,
  dispose: disposeCSM,
  createLights
}
