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

import { describe } from 'vitest'

describe('XRPose', () => {}) //:: XRPose
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
describe('XRRigidTransform', () => {
  describe('position', () => {}) //:: position
  describe('orientation', () => {}) //:: orientation
  describe('constructor', () => {}) //:: constructor
  describe('matrix', () => {}) //:: matrix
  describe('inverse', () => {}) //:: inverse
}) //:: XRRigidTransform
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
