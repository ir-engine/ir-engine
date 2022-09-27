/**
 * Credit https://github.com/tentone/webxr-occlusion-lighting/tree/main/src/material
 */
import { Material, Matrix4, ShaderMaterial, Shader as ShaderType, ShadowMaterial } from 'three'

import { addOBCPlugin, removeOBCPlugin } from '../common/functions/OnBeforeCompilePlugin'
import { DepthDataTexture } from './DepthDataTexture'
import { XRCPUDepthInformation } from './XRTypes'

const DepthOcclusionPluginID = 'DepthOcclusionPlugin'

type XRDepthOcclusionMaterialType = Omit<ShaderMaterial, 'userData'> & {
  userData: {
    DepthOcclusionPlugin?: {
      uniforms: {
        uDepthTexture: { value: DepthDataTexture }
        uWidth: { value: number }
        uHeight: { value: number }
        uUvTransform: { value: Matrix4 }
        uOcclusionEnabled: { value: true }
        uRawValueToMeters: { value: number }
      }
      id: typeof DepthOcclusionPluginID
      compile: (shader: ShaderType) => void
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
function implementDepthOBCPlugin(material: Material, depthMap: DepthDataTexture) {
  const mat = material as XRDepthOcclusionMaterialType

  if (material.userData.DepthOcclusionPlugin) return

  mat.userData.DepthOcclusionPlugin = {
    id: DepthOcclusionPluginID,
    uniforms: {
      uDepthTexture: { value: depthMap },
      uWidth: { value: 1.0 },
      uHeight: { value: 1.0 },
      uUvTransform: { value: new Matrix4() },
      uOcclusionEnabled: { value: true },
      uRawValueToMeters: { value: 0.0 }
    },
    compile: function (shader: ShaderType) {
      // Pass uniforms from userData to the
      for (let i in mat.userData) {
        shader.uniforms[i] = mat.userData[i]
      }

      // Fragment variables
      shader.fragmentShader =
        `
             uniform sampler2D uDepthTexture;
             uniform float uWidth;
             uniform float uHeight;
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
                 float x = gl_FragCoord.x / uWidth;
                 float y = gl_FragCoord.y / uHeight;
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

  XRDepthOcclusionMaterials.push(mat)
}

function removeDepthOBCPlugin(material: Material) {
  const mat = material as XRDepthOcclusionMaterialType
  if (!mat.userData.DepthOcclusionPlugin) return
  removeOBCPlugin(mat, mat.userData.DepthOcclusionPlugin)
  delete mat.userData.DepthOcclusionPlugin
  XRDepthOcclusionMaterials.splice(XRDepthOcclusionMaterials.indexOf(mat), 1)
  mat.needsUpdate = true
}

function updateDepthMaterials(frame: XRFrame, referenceSpace: XRReferenceSpace, depthDataTexture: DepthDataTexture) {
  const viewerPose = frame.getViewerPose(referenceSpace)
  if (viewerPose) {
    for (const view of viewerPose.views) {
      const depthInfo = frame.getDepthInformation(view)
      if (depthInfo) {
        depthDataTexture.updateDepth(depthInfo)
        XRDepthOcclusion.updateUniforms(XRDepthOcclusionMaterials, depthInfo)
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
  const normTextureFromNormViewMatrix = depthInfo.normTextureFromNormView.matrix
  const rawValueToMeters = depthInfo.rawValueToMeters

  for (const material of materials) {
    if (material.userData.DepthOcclusionPlugin) {
      material.userData.DepthOcclusionPlugin.uniforms.uWidth.value = Math.floor(
        window.devicePixelRatio * window.innerWidth
      )
      material.userData.DepthOcclusionPlugin.uniforms.uHeight.value = Math.floor(
        window.devicePixelRatio * window.innerHeight
      )
      material.userData.DepthOcclusionPlugin.uniforms.uUvTransform.value.fromArray(normTextureFromNormViewMatrix)
      material.userData.DepthOcclusionPlugin.uniforms.uRawValueToMeters.value = rawValueToMeters
      material.uniformsNeedUpdate = true
    }
  }
}

export const XRDepthOcclusion = {
  XRDepthOcclusionMaterials,
  implementDepthOBCPlugin,
  removeDepthOBCPlugin,
  updateDepthMaterials,
  updateUniforms
}
