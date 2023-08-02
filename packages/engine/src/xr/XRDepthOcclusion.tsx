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

/**
 * Adapted from https://github.com/tentone/webxr-occlusion-lighting/tree/main/src/material
 */

import { Not } from 'bitecs'
import React, { useEffect } from 'react'
import { Material, Matrix4, Mesh, Shader, ShaderMaterial, ShadowMaterial, Vector2 } from 'three'

import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { addOBCPlugin, removeOBCPlugin } from '../common/functions/OnBeforeCompilePlugin'
import { Engine } from '../ecs/classes/Engine'
import { defineQuery } from '../ecs/functions/ComponentFunctions'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { GroupComponent, GroupQueryReactor } from '../scene/components/GroupComponent'
import { SceneTagComponent } from '../scene/components/SceneTagComponent'
import { VisibleComponent } from '../scene/components/VisibleComponent'
import { DepthCanvasTexture } from './DepthCanvasTexture'
import { DepthDataTexture } from './DepthDataTexture'
import { ReferenceSpace, XRState } from './XRState'
import { XRCPUDepthInformation } from './XRTypes'

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

const XRDepthOcclusionMaterials = [] as XRDepthOcclusionMaterialType[]

/**
 * Create a augmented reality occlusion enabled material from a standard three.js material.
 *
 * Can be used to test multiple material this.models with the AR functionality.
 *
 * @param {Material} mat - Material to be transformed into an augmented material.
 * @param {Texture} depthMap - Depth map bound to the material. A single depth map should be used for all AR materials.
 */
function addDepthOBCPlugin(material: Material, depthMap: DepthDataTexture) {
  const mat = material as XRDepthOcclusionMaterialType
  if (!mat) return
  if (!mat.userData) mat.userData = {}
  if (mat.userData.DepthOcclusionPlugin) return

  mat.userData.DepthOcclusionPlugin = {
    id: DepthOcclusionPluginID,
    uniforms: {
      uDepthTexture: { value: depthMap },
      uResolution: { value: new Vector2() },
      uUvTransform: { value: new Matrix4() },
      uOcclusionEnabled: { value: true },
      uRawValueToMeters: { value: 0.0 }
    },
    compile: function (shader: Shader) {
      if (!mat.userData.DepthOcclusionPlugin) return
      // Pass uniforms from userData to the shader
      for (const key in mat.userData.DepthOcclusionPlugin.uniforms) {
        shader.uniforms[key] = mat.userData.DepthOcclusionPlugin.uniforms[key]
      }
      mat.shader = shader

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
      if (mat instanceof ShadowMaterial) {
        fragmentEntryPoint = '#include <fog_fragment>'
      }

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
  }

  addOBCPlugin(mat, mat.userData.DepthOcclusionPlugin)
  mat.needsUpdate = true

  XRDepthOcclusionMaterials.push(mat)
}

function removeDepthOBCPlugin(material: Material) {
  const mat = material as XRDepthOcclusionMaterialType
  if (!mat?.userData?.DepthOcclusionPlugin) return

  /** remove plugin */
  removeOBCPlugin(mat, mat.userData.DepthOcclusionPlugin)
  delete mat.userData.DepthOcclusionPlugin
  XRDepthOcclusionMaterials.splice(XRDepthOcclusionMaterials.indexOf(mat), 1)

  mat.needsUpdate = true
}

/** frame.getDepthInformation has no type currently */
type getDepthInformationType = {
  getDepthInformation: (view: XRView) => XRCPUDepthInformation
}

function updateDepthMaterials(
  frame: XRFrame & getDepthInformationType,
  referenceSpace: XRReferenceSpace,
  depthTexture?: DepthCanvasTexture
) {
  if (!frame || !referenceSpace) return
  const xrState = getMutableState(XRState)
  const viewerPose = frame.getViewerPose(referenceSpace)
  if (viewerPose) {
    for (const view of viewerPose.views) {
      const depthInfo = frame.getDepthInformation(view)
      if (depthInfo) {
        if (!xrState.depthDataTexture.value) {
          xrState.depthDataTexture.set(new DepthDataTexture(depthInfo.width, depthInfo.height))
        }
        xrState.depthDataTexture.value!.updateDepth(depthInfo)
        XRDepthOcclusion.updateUniforms(XRDepthOcclusionMaterials, depthInfo)
        depthTexture?.updateDepth(depthInfo)
      }
    }
  }
}

/**
 * Update uniforms of materials to match the screen size and camera configuration.
 *
 * https://immersive-web.github.io/depth-sensing/
 *
 * @param {XRDepthOcclusionMaterialType} materials - Materials to be updated.
 * @param {XRRigidTransform} normTextureFromNormViewMatrix - Matrix obtained from AR depth from frame.getDepthInformation(view).
 */
function updateUniforms(materials: XRDepthOcclusionMaterialType[], depthInfo: XRCPUDepthInformation) {
  const normTextureFromNormViewMatrix = depthInfo.normDepthBufferFromNormView.matrix
  const rawValueToMeters = depthInfo.rawValueToMeters
  const width = Math.floor(window.devicePixelRatio * window.innerWidth)
  const height = Math.floor(window.devicePixelRatio * window.innerHeight)
  for (const material of materials) {
    if (material.userData.DepthOcclusionPlugin && material.shader) {
      material.shader.uniforms.uResolution.value.set(width, height)
      /** invert matrix as physics looks down +z, and webxr looks down -z */
      material.shader.uniforms.uUvTransform.value.fromArray(normTextureFromNormViewMatrix).invert()
      material.shader.uniforms.uRawValueToMeters.value = rawValueToMeters
    }
  }
}

export const XRDepthOcclusion = {
  XRDepthOcclusionMaterials,
  addDepthOBCPlugin,
  removeDepthOBCPlugin,
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

/**
 * Updates materials with XR depth map uniforms
 * @param world
 * @returns
 */
const groupQuery = defineQuery([GroupComponent])

const useDepthTextureDebug = false
const depthTexture = _createDepthDebugCanvas(useDepthTextureDebug)
let depthSupported = false

function DepthOcclusionReactor({ obj }) {
  const depthDataTexture = useHookstate(getMutableState(XRState).depthDataTexture)

  useEffect(() => {
    const mesh = obj as any as Mesh<any, Material>
    if (depthDataTexture && depthSupported)
      mesh.traverse((o: Mesh<any, Material>) => XRDepthOcclusion.addDepthOBCPlugin(o.material, depthDataTexture.value!))
    else mesh.traverse((o: Mesh<any, Material>) => XRDepthOcclusion.removeDepthOBCPlugin(o.material))
  }, [depthDataTexture])

  useEffect(() => {
    return () => {
      const mesh = obj as any as Mesh<any, Material>
      mesh.traverse((o: Mesh<any, Material>) => XRDepthOcclusion.removeDepthOBCPlugin(o.material))
    }
  }, [])

  return null
}

const execute = () => {
  const xrFrame = Engine.instance.xrFrame as XRFrame & getDepthInformationType
  depthSupported = typeof xrFrame?.getDepthInformation === 'function'
  if (!depthSupported) return
  XRDepthOcclusion.updateDepthMaterials(Engine.instance.xrFrame as any, ReferenceSpace.origin!, depthTexture)
}

const reactor = () => {
  const xrState = useHookstate(getMutableState(XRState))

  useEffect(() => {
    if (!xrState.sessionActive.value) {
      const depthDataTexture = xrState.depthDataTexture.value
      if (depthDataTexture) {
        depthDataTexture.dispose()
        xrState.depthDataTexture.set(null)
      }
    }
  }, [xrState.sessionActive])

  return (
    <GroupQueryReactor
      GroupChildReactor={DepthOcclusionReactor}
      Components={[Not(SceneTagComponent), VisibleComponent]}
    />
  )
}

export const XRDepthOcclusionSystem = defineSystem({
  uuid: 'ee.engine.XRDepthOcclusionSystem',
  execute,
  reactor
})
