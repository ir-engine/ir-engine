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

/*
ObjectFitFunctions
computeContentFitScale(contentWidth: number,
    contentHeight: number,
    containerWidth: number,
    containerHeight: number,
    fit: ContentFitType = 'contain'): number


computeFrustumSizeAtDistance: (
    distance: number,
    camera = getComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent)
  ): Vector2

computeContentFitScaleForCamera: (
    distance: number,
    contentWidth: number,
    contentHeight: number,
    fit: ContentFitType = 'contain',
    camera = getComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent)
  ): void

snapToSideOfScreen: (
    entity: Entity,
    contentSize: Vector2,
    contentScale: number,
    distance: number,
    horizontalSnap: 'left' | 'right' | 'center' | number, // where number is range from -1 to 1
    verticalSnap: 'top' | 'bottom' | 'center' | number, // where number is range from -1 to 1
    cameraEntity = getState(ReferenceSpaceState).viewerEntity
  ): void

  attachObjectInFrontOfCamera: (entity: Entity, scale: number, distance: number): void

  lookAtCameraFromPosition: (container: WebContainer3D, position: Vector3): void
*/

import { createEngine, createEntity, destroyEngine, getComponent, setComponent } from '@ir-engine/ecs'
import { WebContainer3D } from '@ir-engine/xrui'
import { Object3D, Vector2, Vector3 } from 'three'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mockSpatialEngine } from '../../../tests/util/mockSpatialEngine'
import { TransformComponent } from '../components/TransformComponent'
import { ContentFitType, ObjectFitFunctions } from './ObjectFitFunctions'

describe('ObjectFitFunctions', () => {
  beforeEach(() => {
    createEngine()
    mockSpatialEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should lookAtCameraFromPosition', () => {
    // Test that billboard function does correct operations
    // Since XRUI container is a superSet of Object3D I just used that
    const container = new Object3D()
    ObjectFitFunctions.lookAtCameraFromPosition(container as WebContainer3D, new Vector3(12, 1, 1))
    expect(container.scale).toEqual(new Vector3(4.0276819911981905, 4.0276819911981905, 4.0276819911981905))
    expect(container.position).toEqual(new Vector3(12, 1, 1))
    expect(container.rotation.x).toEqual(-0)
  })

  it('should attachObjectInFrontOfCamera', () => {
    // Test that the object is parented to the camera and settings we provide
    const entity = createEntity()
    setComponent(entity, TransformComponent)
    ObjectFitFunctions.attachObjectInFrontOfCamera(entity, 10, 10)
    const transform = getComponent(entity, TransformComponent)
    expect(transform.position).toEqual(new Vector3(0, 0, -10))
    expect(transform.scale).toEqual(new Vector3(10, 10, 1))
  })

  const horizontalSnapOptions: Array<'left' | 'right' | 'center' | number> = ['left', 'right', 'center', 0.5]
  const horizontalResults = [
    new Vector3(41.967689233949855, 0, -10),
    new Vector3(-41.967689233949855, 0, -10),
    new Vector3(0, 0, -10),
    new Vector3(-44.29922752472484, 0, -10)
  ]
  for (const [i, hoOpt] of horizontalSnapOptions.entries()) {
    it('should horizontal snapToSideOfScreen', () => {
      const entity = createEntity()
      setComponent(entity, TransformComponent)

      const contentSize = new Vector2(1, 1)
      const contentScale = 10
      const distance = 10

      ObjectFitFunctions.snapToSideOfScreen(entity, contentSize, contentScale, distance, hoOpt, 'center')
      const transform = getComponent(entity, TransformComponent)
      expect(transform.position).toEqual(horizontalResults[i])
    })
  }

  const verticalSnapOptions: Array<'top' | 'bottom' | 'center' | number> = ['top', 'bottom', 'center', 0.5]
  const verticalResults = [
    new Vector3(0, -41.967689233949855, -10),
    new Vector3(0, 41.967689233949855, -10),
    new Vector3(0, 0, -10),
    new Vector3(0, -44.29922752472484, -10)
  ]
  for (const [i, veOpt] of verticalSnapOptions.entries()) {
    it('should vertical snapToSideOfScreen', () => {
      const entity = createEntity()
      setComponent(entity, TransformComponent)

      const contentSize = new Vector2(1, 1)
      const contentScale = 10
      const distance = 10

      ObjectFitFunctions.snapToSideOfScreen(entity, contentSize, contentScale, distance, 'center', veOpt)
      const transform = getComponent(entity, TransformComponent)
      expect(transform.position).toEqual(verticalResults[i])
    })
  }

  it('should computeContentFitScale', () => {
    const result = ObjectFitFunctions.computeContentFitScale(1, 1, 10, 10)
    expect(result).toEqual(10)
  })

  it('should computeFrustumSizeAtDistance', () => {
    const result = ObjectFitFunctions.computeFrustumSizeAtDistance(2)
    expect(result).toEqual(new Vector2(1.8652306326199934, 1.8652306326199934))
  })

  const fitOptions: Array<ContentFitType> = ['cover', 'contain', 'stretch', 'vertical', 'horizontal']
  const fitResults = [0.09326153163099968, 0.09326153163099968, 1, 0.09326153163099968, 0.09326153163099968]
  for (const [i, fit] of fitOptions.entries()) {
    it('should computeContentFitScaleForCamera:' + fit, async () => {
      const result = ObjectFitFunctions.computeContentFitScaleForCamera(1, 10, 10, fit)
      expect(result).toEqual(fitResults[i])
    })
  }
})
