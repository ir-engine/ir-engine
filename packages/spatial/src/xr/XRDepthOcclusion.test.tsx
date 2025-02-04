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

import { afterEach, assert, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from '../../tests/webxr/emulator'

import { SystemDefinitions, SystemUUID, createEngine, destroyEngine } from '@ir-engine/ecs'
import { getMutableState } from '@ir-engine/hyperflux'
import { IUniform, Material, Matrix4, MeshBasicMaterial, Quaternion, Shader, Vector2, Vector3 } from 'three'
import { Vector3_One } from '../common/constants/MathConstants'
import { PluginType } from '../common/functions/OnBeforeCompilePlugin'
import { DepthCanvasTexture } from './DepthCanvasTexture'
import { DepthDataTexture } from './DepthDataTexture'
import { XRDepthOcclusion, XRDepthOcclusionSystem } from './XRDepthOcclusion'
import { XRState } from './XRState'
import { XRSystem } from './XRSystem'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('XRDepthOcclusion', () => {
  describe('XRDepthOcclusionMaterials,', () => {
    it('should start as an empty array of XRDepthOcclusionMaterialType', () => {
      expect(Array.isArray(XRDepthOcclusion.XRDepthOcclusionMaterials)).toBe(true)
      expect(XRDepthOcclusion.XRDepthOcclusionMaterials.length).toBe(0)
    })
  }) //:: XRDepthOcclusionMaterials

  describe('addDepthOBCPlugin,', () => {
    it('should not throw an error when accessing `@param material`.userData when its value is falsy (initializes it to an empty object)', () => {
      const Initial = undefined
      // Set the data as expected
      const material = new MeshBasicMaterial()
      material.userData = Initial
      // Sanity check before running
      expect(material.userData).toBeFalsy()
      const before = material.userData
      expect(before).toEqual(Initial)
      // Run and Check the result
      expect(() => XRDepthOcclusion.addDepthOBCPlugin(material, {} as DepthDataTexture)).not.toThrow()
      const result = material.userData
      expect(result).not.toEqual(Initial)
    })

    it('should not error if `@param material` is falsy', () => {
      // Set the data as expected
      const material = null as unknown as Material
      // Sanity check before running
      expect(material).toBeFalsy()
      // Run and Check the result
      expect(() => XRDepthOcclusion.addDepthOBCPlugin(material, {} as DepthDataTexture)).not.toThrow()
    })

    it('should exit early if `@param material`.userData.DepthOcclusionPlugin is truthy', () => {
      const Initial = 'InitialID-ShouldNotChange'
      // Set the data as expected
      const material = { userData: { DepthOcclusionPlugin: { id: Initial } } } as Material
      // Sanity check before running
      expect(material).toBeTruthy()
      expect(material.userData).toBeTruthy()
      expect(material.userData.DepthOcclusionPlugin).toBeTruthy()
      // Run and Check the result
      XRDepthOcclusion.addDepthOBCPlugin(material, {} as DepthDataTexture)
      const result = material.userData.DepthOcclusionPlugin.id
      expect(result).toBe(Initial)
    })

    describe('`@param material`.userData.DepthOcclusionPlugin', () => {
      it('should set .id to the expected default value', () => {
        const Expected = 'DepthOcclusionPlugin'
        // Set the data as expected
        const material = { userData: {} } as Material
        const depthMap = {} as DepthDataTexture
        // Sanity check before running
        expect(material).toBeTruthy()
        expect(material.userData).toBeTruthy()
        expect(material.userData.DepthOcclusionPlugin).toBeFalsy()
        // Run and Check the result
        XRDepthOcclusion.addDepthOBCPlugin(material, depthMap)
        const result = material.userData.DepthOcclusionPlugin.id
        expect(result).toBe(Expected)
      })

      it('should set .uniforms to the expected default value', () => {
        // Set the data as expected
        const material = { userData: {} } as Material
        const depthMap = {} as DepthDataTexture
        const Expected = {
          uDepthTexture: { value: depthMap },
          uResolution: { value: new Vector2() },
          uUvTransform: { value: new Matrix4() },
          uOcclusionEnabled: { value: true },
          uRawValueToMeters: { value: 0.0 }
        }
        // Sanity check before running
        expect(material).toBeTruthy()
        expect(material.userData).toBeTruthy()
        expect(material.userData.DepthOcclusionPlugin).toBeFalsy()
        // Run and Check the result
        XRDepthOcclusion.addDepthOBCPlugin(material, depthMap)
        const result = material.userData.DepthOcclusionPlugin.uniforms
        assert(result)
        expect(result).toEqual(Expected)
      })

      describe('compile', () => {
        it('should set `@param material`.shader to `@param shader`', () => {
          // @ts-expect-error Coerce our mocked shader into the shape of a Threejs shader
          const Expected = { uniforms: { someMockedUniform: 42 } } as Shader
          const Initial = {} as Shader
          // Set the data as expected
          const material = { userData: {}, shader: Initial } as Material
          const depthMap = {} as DepthDataTexture
          const shader = Expected
          // Sanity check before running
          expect(material).toBeTruthy()
          expect(material.userData).toBeTruthy()
          expect(material.userData.DepthOcclusionPlugin).toBeFalsy()
          expect(material.userData.DepthOcclusionPlugin?.compile).toBeFalsy()
          const before = material.shader
          expect(before).toEqual(Initial)
          expect(before).not.toEqual(Expected)
          // Run the pre-process and Sanity check its results
          XRDepthOcclusion.addDepthOBCPlugin(material, depthMap)
          expect(material.userData.DepthOcclusionPlugin).toBeTruthy()
          expect(material.userData.DepthOcclusionPlugin.compile).toBeTruthy()
          // Run and Check the result
          material.userData.DepthOcclusionPlugin.compile(shader)
          const result = material.shader
          expect(result).not.toEqual(Initial)
          expect(result).toEqual(Expected)
        })

        // @note
        // Checks for this line at the start
        //   if (!mat.userData.DepthOcclusionPlugin) return
        // The compile function is defined inside the very object that contains it
        // This branch of the code can never be hit
        it.skip('should not do anything if mat.userData.DepthOcclusionPlugin is falsy', () => {
          // @ts-expect-error Coerce our mocked shader into the shape of a Threejs shader
          const Incorrect = { uniforms: { someMockedUniform: 42 } } as Shader
          const Initial = {} as Shader
          // Set the data as expected
          const material = { userData: {}, shader: Initial } as Material
          const depthMap = {} as DepthDataTexture
          const shader = Incorrect
          // Sanity check before running
          expect(material).toBeTruthy()
          expect(material.userData).toBeTruthy()
          expect(material.userData.DepthOcclusionPlugin).toBeFalsy()
          expect(material.userData.DepthOcclusionPlugin?.compile).toBeFalsy()
          const before = material.shader
          expect(before).toEqual(Initial)
          // Run the pre-process and Sanity check its results
          XRDepthOcclusion.addDepthOBCPlugin(material, depthMap)
          expect(material.userData.DepthOcclusionPlugin).toBeFalsy()
          expect(material.userData.DepthOcclusionPlugin.compile).toBeTruthy()
          // Run and Check the result
          material.userData.DepthOcclusionPlugin.compile(shader)
          const result = material.shader
          expect(result).toEqual(Initial)
        })

        it('should set `@param shader`.fragmentShader source code', () => {
          const Initial = undefined
          // Set the data as expected
          const material = { userData: {}, shader: {} as Shader } as Material
          const depthMap = {} as DepthDataTexture
          // @ts-expect-error Coerce our mocked shader into the shape of a Threejs shader
          const shader = { uniforms: { someMockedUniform: 42 } } as Shader
          // Sanity check before running
          expect(material).toBeTruthy()
          expect(material.userData).toBeTruthy()
          expect(material.userData.DepthOcclusionPlugin).toBeFalsy()
          expect(material.userData.DepthOcclusionPlugin?.compile).toBeFalsy()
          const before = material.shader.fragmentShader
          expect(before).toBe(Initial)
          // Run the pre-process and Sanity check its results
          XRDepthOcclusion.addDepthOBCPlugin(material, depthMap)
          expect(material.userData.DepthOcclusionPlugin).toBeTruthy()
          expect(material.userData.DepthOcclusionPlugin.compile).toBeTruthy()
          // Run and Check the result
          material.userData.DepthOcclusionPlugin.compile(shader)
          const result = material.shader.fragmentShader
          expect(result).not.toEqual(Initial)
        })

        it('should set `@param shader`.vertexShader source code', () => {
          const Initial = undefined
          // Set the data as expected
          const material = { userData: {}, shader: {} as Shader } as Material
          const depthMap = {} as DepthDataTexture
          // @ts-expect-error Coerce our mocked shader into the shape of a Threejs shader
          const shader = { uniforms: { someMockedUniform: 42 } } as Shader
          // Sanity check before running
          expect(material).toBeTruthy()
          expect(material.userData).toBeTruthy()
          expect(material.userData.DepthOcclusionPlugin).toBeFalsy()
          expect(material.userData.DepthOcclusionPlugin?.compile).toBeFalsy()
          const before = material.shader.vertexShader
          expect(before).toBe(Initial)
          // Run the pre-process and Sanity check its results
          XRDepthOcclusion.addDepthOBCPlugin(material, depthMap)
          expect(material.userData.DepthOcclusionPlugin).toBeTruthy()
          expect(material.userData.DepthOcclusionPlugin.compile).toBeTruthy()
          // Run and Check the result
          material.userData.DepthOcclusionPlugin.compile(shader)
          const result = material.shader.vertexShader
          expect(result).not.toEqual(Initial)
        })

        describe('for all uniforms of DepthOcclusionPlugin', () => {
          it('.. should add all `@param material`.userData.DepthOcclusionPlugin.uniforms to `@param shader`.uniforms', () => {
            const Expected = 5
            const Initial = undefined
            // Set the data as expected
            const material = { userData: {}, shader: {} as Shader } as Material
            const depthMap = {} as DepthDataTexture
            // @ts-expect-error Coerce our mocked shader into the shape of a Threejs shader
            const shader = { uniforms: { someMockedUniform: 42 } } as Shader
            // Sanity check before running
            expect(material).toBeTruthy()
            expect(material.userData).toBeTruthy()
            expect(material.userData.DepthOcclusionPlugin).toBeFalsy()
            expect(material.userData.DepthOcclusionPlugin?.compile).toBeFalsy()
            const before = material.userData.DepthOcclusionPlugin?.uniforms
            expect(before).toBe(Initial)
            expect(before).not.toBe(Expected)
            // Run the pre-process and Sanity check its results
            XRDepthOcclusion.addDepthOBCPlugin(material, depthMap)
            expect(material.userData.DepthOcclusionPlugin).toBeTruthy()
            expect(material.userData.DepthOcclusionPlugin.compile).toBeTruthy()
            // Run and Check the result
            material.userData.DepthOcclusionPlugin.compile(shader)
            const result = Object.entries(material.userData.DepthOcclusionPlugin.uniforms).length
            expect(result).not.toEqual(Initial)
            expect(result).toEqual(Expected)
          })
        })
      }) //:: DepthOcclusionPlugin.compile
    }) //:: DepthOcclusionPlugin

    it('should call addOBCPlugin with `@param material` and `@param material`.userData.DepthOcclusionPlugin', () => {
      const Initial = undefined
      // Set the data as expected
      const material = { userData: {} } as Material
      const depthMap = {} as DepthDataTexture
      // Sanity check before running
      expect(material).toBeTruthy()
      expect(material.userData).toBeTruthy()
      expect(material.userData.DepthOcclusionPlugin).toBeFalsy()
      const before = material.onBeforeCompile
      expect(before).toBe(Initial)
      // Run and Check the result
      XRDepthOcclusion.addDepthOBCPlugin(material, depthMap)
      const result = material.onBeforeCompile
      expect(result).not.toBe(Initial)
      expect(result).toEqual(material.userData.DepthOcclusionPlugin)
    })

    it('should set `@param material`.needsUpdate to true', () => {
      const Expected = true
      const Initial = !Expected
      // Set the data as expected
      const material = { userData: {}, needsUpdate: Initial } as Material
      const depthMap = {} as DepthDataTexture
      // Sanity check before running
      expect(material).toBeTruthy()
      expect(material.userData).toBeTruthy()
      expect(material.userData.DepthOcclusionPlugin).toBeFalsy()
      const before = material.needsUpdate
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // Run and Check the result
      XRDepthOcclusion.addDepthOBCPlugin(material, depthMap)
      const result = material.needsUpdate
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should add the `@param material` to the XRDepthOcclusionMaterials list', () => {
      const Expected = true
      const Initial = !Expected
      // Set the data as expected
      const material = { userData: {} } as Material
      const depthMap = {} as DepthDataTexture
      // Sanity check before running
      expect(material).toBeTruthy()
      expect(material.userData).toBeTruthy()
      expect(material.userData.DepthOcclusionPlugin).toBeFalsy()
      // @ts-expect-error The XRDepthOcclusionMaterialType is not exported from the file
      const before = XRDepthOcclusion.XRDepthOcclusionMaterials.includes(material)
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // Run and Check the result
      XRDepthOcclusion.addDepthOBCPlugin(material, depthMap)
      // @ts-expect-error The XRDepthOcclusionMaterialType is not exported from the file
      const result = XRDepthOcclusion.XRDepthOcclusionMaterials.includes(material)
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })
  }) //:: addDepthOBCPlugin

  describe('removeDepthOBCPlugin,', () => {
    it('should remove the DepthOcclusionPlugin field from `@param material`.userData', () => {
      const Expected = undefined
      // Set the data as expected
      const material = { userData: {} } as Material
      const depthMap = {} as DepthDataTexture
      XRDepthOcclusion.addDepthOBCPlugin(material, depthMap)
      // Sanity check before running
      expect(material.userData.DepthOcclusionPlugin).not.toBe(Expected)
      // Run and Check the result
      XRDepthOcclusion.removeDepthOBCPlugin(material)
      const result = material.userData.DepthOcclusionPlugin
      expect(result).toBe(Expected)
    })

    it('should remove the `@param material` from the XRDepthOcclusionMaterials list', () => {
      const Expected = false
      const Initial = !Expected
      // Set the data as expected
      const material = { userData: {} } as Material
      const depthMap = {} as DepthDataTexture
      XRDepthOcclusion.addDepthOBCPlugin(material, depthMap)
      // Sanity check before running
      // @ts-expect-error The XRDepthOcclusionMaterialType is not exported from the file
      const before = XRDepthOcclusion.XRDepthOcclusionMaterials.includes(material)
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // Run and Check the result
      XRDepthOcclusion.removeDepthOBCPlugin(material)
      // @ts-expect-error The XRDepthOcclusionMaterialType is not exported from the file
      const result = XRDepthOcclusion.XRDepthOcclusionMaterials.includes(material)
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should call removeOBCPlugin with `@param material` and `@param material`.userData.DepthOcclusionPlugin', () => {
      const Initial = 1
      const Expected = Initial - 1
      // Set the data as expected
      const material = { userData: {}, plugins: [] as PluginType[] } as Material
      const depthMap = {} as DepthDataTexture
      XRDepthOcclusion.addDepthOBCPlugin(material, depthMap)
      material.plugins?.push(material.userData.DepthOcclusionPlugin)
      console.log(material.plugins)
      // Sanity check before running
      const before = material.plugins?.length
      expect(before).toBe(Initial)
      // Run and Check the result
      XRDepthOcclusion.removeDepthOBCPlugin(material)
      const result = material.plugins?.length
      expect(result).toBe(Expected)
    })

    it('should set `@param material`.needsUpdate to true', () => {
      const Expected = true
      const Initial = !Expected
      // Set the data as expected
      const material = { userData: {}, needsUpdate: Initial } as Material
      const depthMap = {} as DepthDataTexture
      XRDepthOcclusion.addDepthOBCPlugin(material, depthMap)
      material.needsUpdate = false
      // Sanity check before running
      const before = material.needsUpdate
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // Run and Check the result
      XRDepthOcclusion.removeDepthOBCPlugin(material)
      const result = material.needsUpdate
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })
  }) //:: removeDepthOBCPlugin

  describe('updateDepthMaterials,', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    describe('for every viewerPose in `@param frame`.getViewerPose(`@param referenceSpace`)', () => {
      it('.. should set XRState.depthDataTexture to a new DepthDataTexture created with (depthInfo.width, depthInfo.height) if its value is falsy', () => {
        const Initial = null
        // Set the data as expected
        getMutableState(XRState).depthDataTexture.set(Initial)
        const viewerPose = {}
        const depthInfo = { normDepthBufferFromNormView: { matrix: new Matrix4() } }
        const frame = {
          getViewerPose() {
            return { views: [viewerPose] }
          },
          getDepthInformation(_val: any) {
            return depthInfo
          }
        } as XRFrame & any // @note getDepthInformationType is not exported
        const referenceSpace = {} as XRReferenceSpace
        const depthTexture = { updateDepth() {} } as unknown as DepthCanvasTexture
        // Sanity check before running
        expect(frame).toBeTruthy()
        expect(referenceSpace).toBeTruthy()
        expect(frame.getDepthInformation({})).toBeTruthy()
        const before = getMutableState(XRState).depthDataTexture.value
        expect(before).toBe(Initial)
        // Run and Check the result
        XRDepthOcclusion.updateDepthMaterials(frame, referenceSpace, depthTexture)
        const result = getMutableState(XRState).depthDataTexture.value
        expect(result).not.toBe(Initial)
      })

      it('.. should call XRState.depthDataTexture.updateDepth with the value of frame.getDepthInformation(view)', () => {
        // Set the data as expected
        const viewerPose = {}
        const depthInfo = { normDepthBufferFromNormView: { matrix: new Matrix4() } }
        const frame = {
          getViewerPose() {
            return { views: [viewerPose] }
          },
          getDepthInformation(_val: any) {
            return depthInfo
          }
        } as XRFrame & any // @note getDepthInformationType is not exported
        const referenceSpace = {} as XRReferenceSpace
        const result = vi.fn()
        const depthDataTexture = new DepthDataTexture(42, 42)
        depthDataTexture.updateDepth = result
        getMutableState(XRState).depthDataTexture.set(depthDataTexture)
        const depthTexture = { updateDepth: vi.fn() } as unknown as DepthCanvasTexture
        // Sanity check before running
        expect(frame).toBeTruthy()
        expect(referenceSpace).toBeTruthy()
        expect(frame.getDepthInformation({})).toBeTruthy()
        expect(result).not.toHaveBeenCalled()
        // Run and Check the result
        XRDepthOcclusion.updateDepthMaterials(frame, referenceSpace, depthTexture)
        expect(result).toHaveBeenCalled()
        expect(result).toHaveBeenCalledWith(frame.getDepthInformation({}))
      })

      it('.. should call XRDepthOcclusion.updateUniforms with XRDepthOcclusionMaterials and the value of frame.getDepthInformation(view)', () => {
        // Set the data as expected
        const viewerPose = {}
        const depthInfo = { normDepthBufferFromNormView: { matrix: new Matrix4() } }
        const frame = {
          getViewerPose() {
            return { views: [viewerPose] }
          },
          getDepthInformation(_val: any) {
            return depthInfo
          }
        } as XRFrame & any // @note getDepthInformationType is not exported
        const referenceSpace = {} as XRReferenceSpace
        const result = vi.spyOn(XRDepthOcclusion, 'updateUniforms')
        getMutableState(XRState).depthDataTexture.set(new DepthDataTexture(42, 42))
        const depthTexture = { updateDepth: vi.fn() } as unknown as DepthCanvasTexture
        // Sanity check before running
        expect(frame).toBeTruthy()
        expect(referenceSpace).toBeTruthy()
        expect(frame.getDepthInformation({})).toBeTruthy()
        expect(result).not.toHaveBeenCalled()
        // Run and Check the result
        XRDepthOcclusion.updateDepthMaterials(frame, referenceSpace, depthTexture)
        expect(result).toHaveBeenCalled()
        expect(result).toHaveBeenCalledWith(XRDepthOcclusion.XRDepthOcclusionMaterials, frame.getDepthInformation({}))
      })

      it('.. should call `@param depthTexture`.updateDepth with the value of frame.getDepthInformation(view)', () => {
        // Set the data as expected
        const viewerPose = {}
        const depthInfo = { normDepthBufferFromNormView: { matrix: new Matrix4() } }
        const frame = {
          getViewerPose() {
            return { views: [viewerPose] }
          },
          getDepthInformation(_val: any) {
            return depthInfo
          }
        } as XRFrame & any // @note getDepthInformationType is not exported
        const referenceSpace = {} as XRReferenceSpace
        const result = vi.fn()
        const depthTexture = { updateDepth: result } as unknown as DepthCanvasTexture
        // Sanity check before running
        expect(frame).toBeTruthy()
        expect(referenceSpace).toBeTruthy()
        expect(frame.getDepthInformation({})).toBeTruthy()
        expect(result).not.toHaveBeenCalled()
        // Run and Check the result
        XRDepthOcclusion.updateDepthMaterials(frame, referenceSpace, depthTexture)
        expect(result).toHaveBeenCalled()
        expect(result).toHaveBeenCalledWith(depthInfo)
      })

      it('.. should not do anything for the view if frame.getDepthInformation(view) is falsy', () => {
        const Initial = null
        // Set the data as expected
        getMutableState(XRState).depthDataTexture.set(Initial)
        const viewerPose = {}
        const depthInfo = undefined
        const frame = {
          getViewerPose() {
            return { views: [viewerPose] }
          },
          getDepthInformation(_val: any) {
            return depthInfo
          }
        } as XRFrame & any // @note getDepthInformationType is not exported
        const referenceSpace = {} as XRReferenceSpace
        const depthTexture = { updateDepth() {} } as unknown as DepthCanvasTexture
        // Sanity check before running
        expect(frame).toBeTruthy()
        expect(referenceSpace).toBeTruthy()
        expect(frame.getDepthInformation({})).toBeFalsy()
        const before = getMutableState(XRState).depthDataTexture.value
        expect(before).toBe(Initial)
        // Run and Check the result
        XRDepthOcclusion.updateDepthMaterials(frame, referenceSpace, depthTexture)
        const result = getMutableState(XRState).depthDataTexture.value
        expect(result).toBe(Initial)
      })
    })

    it('should not do anything if `@param frame`.getViewerPose(`@param referenceSpace`) is falsy', () => {
      const Initial = null
      // Set the data as expected
      getMutableState(XRState).depthDataTexture.set(Initial)
      const depthInfo = { normDepthBufferFromNormView: { matrix: new Matrix4() } }
      const frame = {
        getViewerPose() {
          return null
        },
        getDepthInformation(_val: any) {
          return depthInfo
        }
      } as XRFrame & any // @note getDepthInformationType is not exported
      const referenceSpace = {} as XRReferenceSpace
      const depthTexture = { updateDepth() {} } as unknown as DepthCanvasTexture
      // Sanity check before running
      expect(frame).toBeTruthy()
      expect(referenceSpace).toBeTruthy()
      expect(frame.getViewerPose({})).toBeFalsy()
      const before = getMutableState(XRState).depthDataTexture.value
      expect(before).toBe(Initial)
      // Run and Check the result
      XRDepthOcclusion.updateDepthMaterials(frame, referenceSpace, depthTexture)
      const result = getMutableState(XRState).depthDataTexture.value
      expect(result).toBe(Initial)
    })

    it('should not do anything if `@param frame` is falsy', () => {
      const Initial = null
      // Set the data as expected
      getMutableState(XRState).depthDataTexture.set(Initial)
      const depthInfo = { normDepthBufferFromNormView: { matrix: new Matrix4() } }
      const frame = {
        getViewerPose() {
          return null
        },
        getDepthInformation(_val: any) {
          return depthInfo
        }
      } as XRFrame & any // @note getDepthInformationType is not exported
      const referenceSpace = null as unknown as XRReferenceSpace
      const depthTexture = { updateDepth() {} } as unknown as DepthCanvasTexture
      // Sanity check before running
      expect(frame).toBeTruthy()
      expect(referenceSpace).toBeFalsy()
      const before = getMutableState(XRState).depthDataTexture.value
      expect(before).toBe(Initial)
      // Run and Check the result
      XRDepthOcclusion.updateDepthMaterials(frame, referenceSpace, depthTexture)
      const result = getMutableState(XRState).depthDataTexture.value
      expect(result).toBe(Initial)
    })

    it('should not do anything if `@param referenceSpace` is falsy', () => {
      const Initial = null
      // Set the data as expected
      getMutableState(XRState).depthDataTexture.set(Initial)
      const frame = null as XRFrame & any // @note getDepthInformationType is not exported
      const referenceSpace = {} as XRReferenceSpace
      const depthTexture = { updateDepth() {} } as unknown as DepthCanvasTexture
      // Sanity check before running
      expect(frame).toBeFalsy()
      expect(referenceSpace).toBeTruthy()
      const before = getMutableState(XRState).depthDataTexture.value
      expect(before).toBe(Initial)
      // Run and Check the result
      XRDepthOcclusion.updateDepthMaterials(frame, referenceSpace, depthTexture)
      const result = getMutableState(XRState).depthDataTexture.value
      expect(result).toBe(Initial)
    })
  }) //:: updateDepthMaterials

  describe('updateUniforms', () => {
    describe('for every material in the `@param materials` list ..', () => {
      it('.. should set the uResolution uniform of the mat.shader to the expected (width, height) for the window.devicePixelRatio', () => {
        const Expected = 1024
        const Initial = 42
        // Set the data as expected
        const uniform = {
          value: {
            data: Initial,
            set: (value: any) => (uniform.value.data = value),
            get: () => uniform.value.data
          }
        } as IUniform
        const shader = {
          uniforms: {
            uResolution: uniform,
            uUvTransform: { value: new Matrix4() } as IUniform,
            uRawValueToMeters: { value: 0.0 } as IUniform
          }
        }
        const materials = [
          {
            userData: {},
            shader: shader
          } as unknown as Material
        ]
        const depthMap = {} as DepthDataTexture
        const depthInfo = { normDepthBufferFromNormView: { matrix: new Matrix4() } }
        XRDepthOcclusion.addDepthOBCPlugin(materials[0], depthMap)
        // Sanity check before running
        expect(materials[0].userData.DepthOcclusionPlugin).toBeTruthy()
        expect(materials[0].shader).toBeTruthy()
        // Run and Check the result
        // @ts-expect-error The XRDepthOcclusionMaterialType is not exported from the file
        XRDepthOcclusion.updateUniforms(materials, depthInfo)
        const result = materials[0].shader.uniforms.uResolution.value.get()
        expect(result).toBe(Expected)
      })

      it('.. should set the uUvTransform uniform of the mat.shader to the inverse of `@param depthInfo`.normTextureFromNormViewMatrix.matrix', () => {
        const Expected = 42
        const Initial = -Expected
        // Set the data as expected
        const uniform = { value: new Matrix4() } as IUniform
        const shader = {
          uniforms: {
            uResolution: {
              value: {
                data: 1234,
                set: (value: any) => (shader.uniforms.uResolution.value.data = value),
                get: () => shader.uniforms.uResolution.value.data
              }
            } as IUniform,
            uUvTransform: uniform,
            uRawValueToMeters: { value: 0.0 } as IUniform
          }
        }
        const materials = [
          {
            userData: {},
            shader: shader
          } as unknown as Material
        ]
        const depthMap = {} as DepthDataTexture
        const depthInfo = {
          normDepthBufferFromNormView: {
            matrix: new Matrix4().compose(new Vector3(Initial), new Quaternion(), Vector3_One.clone()).toArray()
          }
        }
        XRDepthOcclusion.addDepthOBCPlugin(materials[0], depthMap)
        // Sanity check before running
        expect(materials[0].userData.DepthOcclusionPlugin).toBeTruthy()
        expect(materials[0].shader).toBeTruthy()
        // Run and Check the result
        // @ts-expect-error The XRDepthOcclusionMaterialType is not exported from the file
        XRDepthOcclusion.updateUniforms(materials, depthInfo)
        const uniformAfter = materials[0].shader.uniforms.uUvTransform.value as Matrix4
        const uniformAfterPosition = new Vector3()
        uniformAfter.decompose(uniformAfterPosition, new Quaternion(), Vector3_One.clone())
        const result = uniformAfterPosition.x
        expect(result).toEqual(Expected)
      })

      it('.. should set the uRawValueToMeters uniform of the mat.shader to `@param depthInfo`.rawValueToMeters', () => {
        const Expected = 42
        const Initial = 21
        // Set the data as expected
        const uniform = { value: Initial } as IUniform
        const shader = {
          uniforms: {
            uResolution: {
              value: {
                data: 1234,
                set: (value: any) => (shader.uniforms.uResolution.value.data = value),
                get: () => shader.uniforms.uResolution.value.data
              }
            } as IUniform,
            uUvTransform: { value: new Matrix4() } as IUniform,
            uRawValueToMeters: uniform
          }
        }
        const materials = [
          {
            userData: {},
            shader: shader
          } as unknown as Material
        ]
        const depthMap = {} as DepthDataTexture
        const depthInfo = { normDepthBufferFromNormView: { matrix: new Matrix4() }, rawValueToMeters: Expected }
        XRDepthOcclusion.addDepthOBCPlugin(materials[0], depthMap)
        // Sanity check before running
        expect(materials[0].userData.DepthOcclusionPlugin).toBeTruthy()
        expect(materials[0].shader).toBeTruthy()
        const before = materials[0].shader.uniforms.uRawValueToMeters.value
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // Run and Check the result
        // @ts-expect-error The XRDepthOcclusionMaterialType is not exported from the file
        XRDepthOcclusion.updateUniforms(materials, depthInfo)
        const result = materials[0].shader.uniforms.uRawValueToMeters.value
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })

      it('.. should not do anything for a material if mat.userData.DepthOcclusionPlugin is falsy', () => {
        const Initial = 42
        // Set the data as expected
        const uniform = {
          value: {
            data: Initial,
            set: (value: any) => (uniform.value.data = value),
            get: () => uniform.value.data
          }
        } as IUniform
        const shader = {
          uniforms: {
            uResolution: uniform,
            uUvTransform: { value: new Matrix4() } as IUniform,
            uRawValueToMeters: { value: 0.0 } as IUniform
          }
        }
        const materials = [
          {
            userData: {},
            shader: shader
          } as unknown as Material
        ]
        const depthMap = {} as DepthDataTexture
        const depthInfo = { normDepthBufferFromNormView: { matrix: new Matrix4() } }
        // XRDepthOcclusion.addDepthOBCPlugin(materials[0], depthMap)
        // Sanity check before running
        expect(materials[0].userData.DepthOcclusionPlugin).toBeFalsy()
        expect(materials[0].shader).toBeTruthy()
        // Run and Check the result
        // @ts-expect-error The XRDepthOcclusionMaterialType is not exported from the file
        XRDepthOcclusion.updateUniforms(materials, depthInfo)
        const result = materials[0].shader.uniforms.uResolution.value.get()
        expect(result).toBe(Initial)
      })
    })
  }) //:: updateUniforms
}) //:: XRDepthOcclusion

describe('XRDepthOcclusionSystem', () => {
  const System = SystemDefinitions.get(XRDepthOcclusionSystem)!

  beforeEach(async () => {
    createEngine()
    await mockEmulatedXREngine()
  })

  afterEach(() => {
    destroyEmulatedXREngine()
    destroyEngine()
  })

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      expect(System.uuid).toBe('ee.engine.XRDepthOcclusionSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(XRDepthOcclusionSystem).toBe('ee.engine.XRDepthOcclusionSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.after).not.toBe(undefined)
      expect(System.insert!.after!).toBe(XRSystem)
    })
  }) //:: Fields

  /** @todo */
  describe('execute,', () => {}) //:: execute
  describe('reactor,', () => {}) //:: reactor
}) //:: XRDepthOcclusionSystem
