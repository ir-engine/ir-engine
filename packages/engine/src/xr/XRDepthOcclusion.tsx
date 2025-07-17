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

/**
 * Adapted from https://github.com/tentone/webxr-occlusion-lighting/tree/main/src/material
 */

import React, { useEffect } from 'react'
import { Matrix4, Shader, ShaderMaterial, Vector2 } from 'three'

import { Entity, getComponent, removeComponent, S, setComponent } from '@ir-engine/ecs'
import { defineQuery, QueryReactor } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { getMutableState, getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { DepthCanvasTexture } from '@ir-engine/spatial/src/xr/DepthCanvasTexture'
import { DepthDataTexture } from '@ir-engine/spatial/src/xr/DepthDataTexture'
import { ReferenceSpace, XRState } from '@ir-engine/spatial/src/xr/XRState'
import { XRSystem } from '@ir-engine/spatial/src/xr/XRSystem'
import { XRCPUDepthInformation } from '@ir-engine/spatial/src/xr/XRTypes'
import { defineMaterialPlugin, TextureSchema } from '../material/defineMaterialPlugin'

export const DepthOcclusionPluginComponent = defineMaterialPlugin({
  name: 'DepthOcclusionPluginComponent',

  jsonID: 'IR_depth_occlusion',

  uniforms: S.Object({
    uDepthTexture: TextureSchema(),
    uResolution: T.Vec2(),
    uUvTransform: T.Mat4(),
    uOcclusionEnabled: S.Bool({ default: true }),
    uRawValueToMeters: S.Number({ default: 0.0 })
  }),

  onApply(shader) {
    // Fragment variables
    shader.fragmentShader =
      `
        uniform sampler2D uDepthTexture;
        uniform vec2 uResolution;
        uniform mat4 uUvTransform;
        uniform bool uOcclusionEnabled;
        uniform float uRawValueToMeters;
        varying float vDepth;
        ` + shader.fragmentShader

    let fragmentEntryPoint = '#include <clipping_planes_fragment>'
    // if (mat instanceof ShadowMaterial) {
    //   fragmentEntryPoint = '#include <fog_fragment>'
    // }

    // Fragment depth logic
    shader.fragmentShader = shader.fragmentShader.replace(
      'void main',
      `float getDepthInMeters(in sampler2D depthText, in vec2 uv)
        {
          vec2 packedDepth = texture2D(depthText, uv).rg;
          return dot(packedDepth, vec2(255.0, 256.0 * 255.0)) * uRawValueToMeters;
        }
        void main`
    )

    shader.fragmentShader = shader.fragmentShader.replace(
      fragmentEntryPoint,
      `
        ${fragmentEntryPoint}
        if(uOcclusionEnabled)
        {
          // Normalize x, y to range [0, 1]
          vec2 uv = gl_FragCoord.xy / uResolution.xy;
          
          vec2 depthUV = (uUvTransform * vec4(uv, 0, 1)).xy;
          float depth = getDepthInMeters(uDepthTexture, depthUV);
          if (depth < vDepth)
          {
            discard;
          }
        }
        `
    )

    // Vertex variables
    shader.vertexShader =
      `
        varying float vDepth;
        ` + shader.vertexShader

    // Vertex depth logic
    shader.vertexShader = shader.vertexShader.replace(
      '#include <fog_vertex>',
      `
        #include <fog_vertex>
        vDepth = gl_Position.z;
        `
    )
  }
})

const DepthOcclusionPluginID = 'DepthOcclusionPlugin'

type XRDepthOcclusionMaterialType = Omit<ShaderMaterial, 'userData'> & {
  shader?: Shader
  userData: {
    DepthOcclusionPlugin?: {
      uniforms: {
        uDepthTexture: { value: DepthDataTexture }
        uResolution: { value: Vector2 }
        uUvTransform: { value: Matrix4 }
        uOcclusionEnabled: { value: true }
        uRawValueToMeters: { value: number }
      }
      id: typeof DepthOcclusionPluginID
      compile: (shader: Shader) => void
    }
  }
}

/** frame.getDepthInformation has no type currently */
type GetDepthInformationType = {
  getDepthInformation: (view: XRView) => XRCPUDepthInformation
}

/**
 * Updates materials with XR depth map uniforms
 * @param world
 * @returns
 */
function updateDepthMaterials(
  frame: XRFrame & GetDepthInformationType,
  referenceSpace: XRReferenceSpace,
  depthTexture?: DepthCanvasTexture
) {
  if (!frame || !referenceSpace) return
  const xrState = getMutableState(XRState)
  const viewerPose = frame.getViewerPose(referenceSpace)
  if (!viewerPose) return
  for (const view of viewerPose.views) {
    const depthInfo = frame.getDepthInformation(view)
    if (!depthInfo) continue
    if (!xrState.depthDataTexture.value) {
      xrState.depthDataTexture.set(new DepthDataTexture(depthInfo.width, depthInfo.height))
    }
    xrState.depthDataTexture.value!.updateDepth(depthInfo)
    XRDepthOcclusion.updateUniforms(depthInfo)
    depthTexture?.updateDepth(depthInfo)
  }
}

const materialPlugins = defineQuery([DepthOcclusionPluginComponent])

/**
 * Update uniforms of materials to match the screen size and camera configuration.
 *
 * https://immersive-web.github.io/depth-sensing/
 *
 * @param {XRDepthOcclusionMaterialType} materials - Materials to be updated.
 * @param {XRRigidTransform} normTextureFromNormViewMatrix - Matrix obtained from AR depth from frame.getDepthInformation(view).
 */
function updateUniforms(depthInfo: XRCPUDepthInformation) {
  const normTextureFromNormViewMatrix = depthInfo.normDepthBufferFromNormView.matrix
  const rawValueToMeters = depthInfo.rawValueToMeters
  const width = Math.floor(window.devicePixelRatio * window.innerWidth)
  const height = Math.floor(window.devicePixelRatio * window.innerHeight)
  for (const entity of materialPlugins()) {
    const material = getComponent(entity, MaterialStateComponent).material
    if (!(material.userData.DepthOcclusionPlugin && material.shader)) continue
    material.shader.uniforms.uResolution.value.set(width, height)
    /** invert matrix as physics looks down +z, and webxr looks down -z */
    material.shader.uniforms.uUvTransform.value.fromArray(normTextureFromNormViewMatrix).invert()
    material.shader.uniforms.uRawValueToMeters.value = rawValueToMeters
  }
}

export const XRDepthOcclusion = {
  updateDepthMaterials,
  updateUniforms
}

const _createDepthDebugCanvas = (enabled: boolean) => {
  if (!enabled) return
  const depthCanvas = document.createElement('canvas')
  document.body.appendChild(depthCanvas)
  const depthTexture = new DepthCanvasTexture(depthCanvas)
  depthCanvas.style.position = 'absolute'
  depthCanvas.style.right = '10px'
  depthCanvas.style.bottom = '10px'
  depthCanvas.style.borderRadius = '20px'
  return depthTexture
}

const useDepthTextureDebug = false
const depthTexture = _createDepthDebugCanvas(useDepthTextureDebug)
let depthSupported = false

function DepthOcclusionReactor(props: { entity: Entity }) {
  const depthDataTexture = useHookstate(getMutableState(XRState).depthDataTexture)

  useEffect(() => {
    setComponent(props.entity, DepthOcclusionPluginComponent, {
      uDepthTexture: depthDataTexture.value as DepthDataTexture
    })
    return () => {
      removeComponent(props.entity, DepthOcclusionPluginComponent)
    }
  }, [depthDataTexture])

  return null
}

const execute = () => {
  const xrFrame = getState(XRState).xrFrame
  const xrFrameD = xrFrame as XRFrame & GetDepthInformationType
  depthSupported = typeof xrFrameD?.getDepthInformation === 'function'
  if (!depthSupported) return
  XRDepthOcclusion.updateDepthMaterials(xrFrame as any, ReferenceSpace.origin!, depthTexture)
}

const reactor = () => {
  const xrState = useMutableState(XRState)

  useEffect(() => {
    if (!xrState.sessionActive.value) {
      const depthDataTexture = xrState.depthDataTexture.value
      if (depthDataTexture) {
        depthDataTexture.dispose()
        xrState.depthDataTexture.set(null)
      }
    }
  }, [xrState.sessionActive])

  const depthDataTexture = useHookstate(getMutableState(XRState).depthDataTexture).value
  if (!depthDataTexture || !depthSupported) return null

  return <QueryReactor ChildEntityReactor={DepthOcclusionReactor} Components={[MaterialStateComponent]} />
}

export const XRDepthOcclusionSystem = defineSystem({
  uuid: 'ee.engine.XRDepthOcclusionSystem',
  insert: { after: XRSystem },
  execute,
  reactor
})
