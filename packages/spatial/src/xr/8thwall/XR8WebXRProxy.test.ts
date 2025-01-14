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

import { Matrix4, Quaternion, Vector3 } from 'three'
import { describe, expect, it } from 'vitest'
import { assertArray, assertMatrix } from '../../../tests/util/assert'
import { Q_IDENTITY, Vector3_One, Vector3_Zero } from '../../common/constants/MathConstants'
import { XRPose, XRRigidTransform } from './XR8WebXRProxy'

describe('XRRigidTransform', () => {
  describe('constructor', () => {
    it('should store the `@param position` into the result.position property when it is truthy', () => {
      const Expected = new Vector3(40, 41, 42)
      // Sanity check before running
      const other = new XRRigidTransform()
      expect(other.position).not.toBe(Expected)
      expect(other.position).not.toEqual(Expected)
      // Run and Check the result
      const result = new XRRigidTransform(Expected, new Quaternion(1, 2, 3, 4).normalize())
      expect(result.position).not.toBe(Expected)
      expect(result.position).toEqual(Expected)
    })

    it('should store the `@param orientation` into the result.orientation property when it is truthy', () => {
      const Expected = new Quaternion(1, 2, 3, 4).normalize()
      // Sanity check before running
      const other = new XRRigidTransform()
      expect(other.orientation).not.toBe(Expected)
      expect(other.orientation).not.toEqual(Expected)
      // Run and Check the result
      const result = new XRRigidTransform(new Vector3(40, 41, 42), Expected)
      expect(result.orientation).not.toBe(Expected)
      expect(result.orientation).toEqual(Expected)
    })

    it('should compose the internal `_matrix` property with the resulting position and orientation, and a scale of `Vector3_One`', () => {
      const position = new Vector3(40, 41, 42)
      const rotation = new Quaternion(1, 2, 3, 4).normalize()
      const scale = Vector3_One.clone()
      // Set the data as expected
      const Expected = new Matrix4().compose(position, rotation, scale)
      // Run and Check the result
      const result = new XRRigidTransform(position, rotation)
      assertMatrix.approxEq(result._matrix, Expected)
    })
  }) //:: constructor

  describe('position', () => {
    it('should have a default value of (0,0,0) when not specified by the constructor', () => {
      const Expected = new Vector3(0, 0, 0)
      // Run and Check the result
      const result = new XRRigidTransform().position
      expect(result).toEqual(Expected)
    })

    it('should contain the value of `@param position` when specified by the constructor', () => {
      const Expected = new Vector3(40, 41, 42)
      // Run and Check the result
      const result = new XRRigidTransform(Expected).position
      expect(result).not.toEqual(Vector3_Zero)
      expect(result).toEqual(Expected)
    })
  }) //:: position

  describe('orientation', () => {
    it('should have a default value of (0,0,0,1) when not specified by the constructor', () => {
      const Expected = new Quaternion(0, 0, 0, 1).normalize()
      // Run and Check the result
      const result = new XRRigidTransform().orientation
      expect(result).toEqual(Expected)
    })

    it('should contain the value of `@param orientation` when specified by the constructor', () => {
      const Expected = new Quaternion(1, 2, 3, 4).normalize()
      // Run and Check the result
      const result = new XRRigidTransform(undefined, Expected).orientation
      expect(result).not.toEqual(Q_IDENTITY)
      expect(result).toEqual(Expected)
    })
  }) //:: orientation

  describe('matrix', () => {
    it('should return the result as an array created with `XRRigidTransform._matrix.toArray`', () => {
      // Set the data as expected
      const transform = new XRRigidTransform(new Vector3(40, 41, 42), new Quaternion(1, 2, 3, 4).normalize())
      // Check the result
      const result = transform.matrix
      expect(Array.isArray(result)).toBe(true)
    })

    it('should return the ._matrix property as an array with the expected values', () => {
      const position = new Vector3(40, 41, 42)
      const rotation = new Quaternion(1, 2, 3, 4).normalize()
      const scale = Vector3_One.clone()
      const Expected = new Matrix4().compose(position, rotation, scale).toArray()
      // Set the data as expected
      const transform = new XRRigidTransform(position, rotation)
      // Check the result
      const result = transform.matrix
      expect(Array.isArray(result)).toBe(true)
      assertArray.eq(result, Expected)
    })
  }) //:: matrix

  /** @todo */
  describe('inverse', () => {}) //:: inverse
}) //:: XRRigidTransform

describe('XRPose', () => {
  describe('constructor', () => {
    it('should store the given XRRigidTransform into the result.transform property', () => {
      // Set the data as expected
      const Expected = new XRRigidTransform(new Vector3(40, 41, 42), new Quaternion(1, 2, 3, 4).normalize())
      // Sanity check before running
      const other = new XRPose(new XRRigidTransform())
      expect(other.transform).not.toBe(Expected)
      expect(other.transform).not.toEqual(Expected)
      // Run and Check the result
      const result = new XRPose(Expected)
      expect(result.transform).toBe(Expected)
      expect(result.transform).toEqual(Expected)
    })
  }) //:: XRPose.constructor
}) //:: XRPose

/** @todo */
describe('XRView', () => {
  describe('eye', () => {}) //:: eye
  describe('projectionMatrix', () => {}) //:: projectionMatrix
  describe('transform', () => {}) //:: transform
  describe('constructor', () => {}) //:: constructor
}) //:: XRView
describe('XRViewerPose', () => {
  describe('views', () => {}) //:: views
  describe('constructor', () => {}) //:: constructor
}) //:: XRViewerPose
describe('XRHitTestResultProxy', () => {
  describe('constructor', () => {}) //:: constructor
  describe('getPose', () => {}) //:: getPose
}) //:: XRHitTestResultProxy
describe('XRSpace', () => {
  describe('constructor', () => {}) //:: constructor
}) //:: XRSpace
describe('XRReferenceSpace', () => {
  describe('getOffsetReferenceSpace', () => {}) //:: getOffsetReferenceSpace
  describe('onreset', () => {}) //:: onreset
  describe('addEventListener', () => {}) //:: addEventListener
  describe('removeEventListener', () => {}) //:: removeEventListener
}) //:: XRReferenceSpace
describe('XRHitTestSource', () => {
  describe.todo('cancel', () => {}) //:: cancel
}) //:: XRHitTestSource
describe('XRSessionProxy', () => {
  describe('inputSources', () => {}) //:: inputSources
  describe('interactionMode', () => {}) //:: interactionMode
  describe('environmentBlendMode', () => {}) //:: environmentBlendMode
  describe('domOverlayState', () => {}) //:: domOverlayState
  describe('constructor', () => {}) //:: constructor
  describe('requestReferenceSpace', () => {}) //:: requestReferenceSpace
  describe('requestHitTestSource', () => {}) //:: requestHitTestSource
  describe('updateRenderState', () => {}) //:: updateRenderState
}) //:: XRSessionProxy
describe('XRFrameProxy', () => {
  describe('constructor', () => {}) //:: constructor
  describe('getHitTestResults', () => {}) //:: getHitTestResults
  describe('session', () => {}) //:: session
  describe('getPose', () => {}) //:: getPose
  describe('getViewerPose', () => {}) //:: getViewerPose
}) //:: XRFrameProxy
