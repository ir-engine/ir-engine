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
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  serializeComponent,
  setComponent
} from '@ir-engine/ecs'
import { getMutableState } from '@ir-engine/hyperflux'
import assert from 'assert'
import { Color, ColorRepresentation, DirectionalLight } from 'three'

import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { mockSpatialEngine } from '../../../../tests/util/mockSpatialEngine'
import { destroySpatialEngine } from '../../../initializeEngine'
import { TransformComponent } from '../../RendererModule'
import { RendererState } from '../../RendererState'
import { ObjectComponent } from '../ObjectComponent'
import { DirectionalLightComponent } from './DirectionalLightComponent'
import { LightTagComponent } from './LightTagComponent'
type DirectionalLightComponentData = {
  light: DirectionalLight
  color: ColorRepresentation
  intensity: number
  castShadow: boolean
  shadowBias: number
  shadowRadius: number
  cameraFar: number
}

const DirectionalLightComponentDefaults: DirectionalLightComponentData = {
  light: new DirectionalLight(),
  color: new Color(),
  intensity: 1,
  castShadow: false,
  shadowBias: -0.00001,
  shadowRadius: 1,
  cameraFar: 200
}

function assertDirectionalLightComponentEq(A: DirectionalLightComponentData, B: DirectionalLightComponentData): void {
  /** @todo How to check for (AmbientLight === AmbientLight), when the are different objects with the same data?
  if (A.light && B.light) assert.equal(A.light.uuid, B.light.uuid)
  else if (A.light || B.light) assert.equal(true, false)
  else assert.equal(A.light, B.light)
  */
  assert.equal(new Color(A.color).getHex(), new Color(B.color).getHex())
  assert.equal(A.intensity, B.intensity)
  assert.equal(A.castShadow, B.castShadow)
  assert.equal(A.shadowBias, B.shadowBias)
  assert.equal(A.shadowRadius, B.shadowRadius)
  assert.equal(A.cameraFar, B.cameraFar)
}
function assertDirectionalLightComponentNotEq(
  A: DirectionalLightComponentData,
  B: DirectionalLightComponentData
): void {
  assert.notEqual(A.light.uuid, B.light.uuid)
  assert.notEqual(new Color(A.color).getHex(), new Color(B.color).getHex())
  assert.notEqual(A.intensity, B.intensity)
  assert.notEqual(A.castShadow, B.castShadow)
  assert.notEqual(A.shadowBias, B.shadowBias)
  assert.notEqual(A.shadowRadius, B.shadowRadius)
  assert.notEqual(A.cameraFar, B.cameraFar)
}

describe('DirectionalLightComponent', () => {
  describe('IDs', () => {
    it('should initialize the DirectionalLightComponent.name field with the expected value', () => {
      assert.equal(DirectionalLightComponent.name, 'DirectionalLightComponent')
    })

    it('should initialize the DirectionalLightComponent.jsonID field with the expected value', () => {
      assert.equal(DirectionalLightComponent.jsonID, 'EE_directional_light')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, DirectionalLightComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, DirectionalLightComponent)
      assertDirectionalLightComponentEq(data, DirectionalLightComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, DirectionalLightComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      return destroyEngine()
    })

    it('should change the values of an initialized DirectionalLightComponent', () => {
      const before = getComponent(testEntity, DirectionalLightComponent)
      assertDirectionalLightComponentEq(before, DirectionalLightComponentDefaults)
      const Expected = {
        light: new DirectionalLight(),
        color: new Color(0x123456),
        intensity: 41,
        castShadow: !DirectionalLightComponentDefaults.castShadow,
        shadowBias: -0.00042,
        shadowRadius: 43,
        cameraFar: 44
      }

      // Run and Check the result
      setComponent(testEntity, DirectionalLightComponent, Expected)
      const result = getComponent(testEntity, DirectionalLightComponent)
      assertDirectionalLightComponentNotEq(result, DirectionalLightComponentDefaults)
      assertDirectionalLightComponentEq(result, Expected)
    })
  }) //:: onSet

  describe('toJSON', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, DirectionalLightComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      return destroyEngine()
    })

    it("should serialize the component's default data as expected", () => {
      const Expected = {
        color: new Color(DirectionalLightComponentDefaults.color).getHex(),
        intensity: DirectionalLightComponentDefaults.intensity,
        cameraFar: DirectionalLightComponentDefaults.cameraFar,
        castShadow: DirectionalLightComponentDefaults.castShadow,
        shadowBias: DirectionalLightComponentDefaults.shadowBias,
        shadowRadius: DirectionalLightComponentDefaults.shadowRadius
      }
      const result = serializeComponent(testEntity, DirectionalLightComponent)
      assert.deepEqual(result, Expected)
    })
  })

  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      return destroyEngine()
    })

    it('should set a LightTagComponent on the entityContext when it is mounted', async () => {
      // Sanity check before running
      assert.equal(hasComponent(testEntity, LightTagComponent), false)

      // Run and Check the result
      setComponent(testEntity, DirectionalLightComponent)
      await vi.waitFor(() => {
        assert.equal(hasComponent(testEntity, LightTagComponent), true)
      })
    })

    it('should create a new DirectionalLight object and add it to the ObjectComponent of the entity when it is mounted', async () => {
      // Sanity check before running
      const before = getComponent(testEntity, ObjectComponent)
      assert.equal(!!before, false)

      // Run and Check the result
      setComponent(testEntity, DirectionalLightComponent)
      await vi.waitFor(() => {
        const after = getComponent(testEntity, ObjectComponent)
        assert.equal(!!after, true)
        const result = after.type === 'DirectionalLight'
        assert.equal(result, true)
      })
    })

    it('should remove the DirectionalLight object from the ObjectComponent of the entityContext when it is unmounted', async () => {
      // Sanity check before running
      const before1 = getComponent(testEntity, ObjectComponent)
      assert.equal(!!before1, false)
      setComponent(testEntity, DirectionalLightComponent)
      await vi.waitFor(() => {
        assert.equal(!!getComponent(testEntity, ObjectComponent), true)
      })

      // Run and Check the result
      removeComponent(testEntity, DirectionalLightComponent)
      await vi.waitFor(() => {
        const after = getComponent(testEntity, ObjectComponent)
        assert.equal(!!after, false)
      })
    })

    it('should react when directionalLightComponent.color changes', async () => {
      const Expected = new Color(0x123456)

      // Set the data as expected
      setComponent(testEntity, DirectionalLightComponent)
      await vi.waitFor(() => {
        // Sanity check before running
        const before = getComponent(testEntity, DirectionalLightComponent).color
        assert.equal(new Color(before).getHex(), new Color(DirectionalLightComponentDefaults.color).getHex())
      })

      // Run and Check the result
      setComponent(testEntity, DirectionalLightComponent, { color: Expected })
      await vi.waitFor(() => {
        const result = getComponent(testEntity, DirectionalLightComponent).color
        assert.equal(new Color(result).getHex(), Expected.getHex())
      })
    })

    /*
    it("should react and assign the light's color to LineSegmentComponent.color for the entity when directionalLightComponent.color changes", async () => {
      const Expected = new Color(0x123456)

      // Set the data as expected
      getMutableState(RendererState).nodeHelperVisibility.set(true)

      // Run and Check the Initial result
      setComponent(testEntity, DirectionalLightComponent)

      await vi.waitFor(() => {
        // Sanity check before running
        const before = getComponent(testEntity, DirectionalLightComponent).color
        assert.equal(new Color(before).getHex(), new Color(DirectionalLightComponentDefaults.color).getHex())
        assert.notEqual(new Color(before).getHex(), Expected.getHex())
      })

      // Create a helper entity that we'll use
      const helperSelectedGizmo = createEntity()

      setComponent(testEntity, DirectionalLightComponent, { color: Expected })

      // Set the LineSegmentComponent on the helper entity to simulate what the component would do
      setComponent(helperSelectedGizmo, LineSegmentComponent, {
        name: 'directional-light-helper',
        geometry: new BufferGeometry(),
        material: new LineBasicMaterial(),
        color: Expected
      })

      await vi.waitFor(() => {
        // Check if the helper entity has the correct color
        const result = getComponent(helperSelectedGizmo, LineSegmentComponent).color
        assert.equal(new Color(result).getHex(), Expected.getHex())
      })
    })
    */

    it('should react when directionalLightComponent.intensity changes', async () => {
      const Expected = 42

      // Set the data as expected
      setComponent(testEntity, DirectionalLightComponent)
      await vi.waitFor(() => {
        // Sanity check before running
        const before = getComponent(testEntity, DirectionalLightComponent).intensity
        assert.equal(before, DirectionalLightComponentDefaults.intensity)
        assert.notEqual(before, Expected)
      })

      // Run and Check the result
      setComponent(testEntity, DirectionalLightComponent, { intensity: Expected })
      await vi.waitFor(() => {
        const result = getComponent(testEntity, DirectionalLightComponent).intensity
        assert.equal(result, Expected)
      })
    })

    it('should react when directionalLightComponent.cameraFar changes', async () => {
      const Expected = 42

      // Set the data as expected
      setComponent(testEntity, DirectionalLightComponent)
      await vi.waitFor(() => {
        // Sanity check before running
        const before = getComponent(testEntity, DirectionalLightComponent).cameraFar
        assert.equal(before, DirectionalLightComponentDefaults.cameraFar)
        assert.notEqual(before, Expected)
      })

      // Run and Check the result
      setComponent(testEntity, DirectionalLightComponent, { cameraFar: Expected })
      await vi.waitFor(() => {
        const result = getComponent(testEntity, DirectionalLightComponent).cameraFar
        assert.equal(result, Expected)
      })
    })

    it('should react when directionalLightComponent.shadowBias changes', async () => {
      const Expected = 42

      // Set the data as expected
      setComponent(testEntity, DirectionalLightComponent)
      await vi.waitFor(() => {
        // Sanity check before running
        const before = getComponent(testEntity, DirectionalLightComponent).shadowBias
        assert.equal(before, DirectionalLightComponentDefaults.shadowBias)
        assert.notEqual(before, Expected)
      })

      // Run and Check the result
      setComponent(testEntity, DirectionalLightComponent, { shadowBias: Expected })
      await vi.waitFor(() => {
        const result = getComponent(testEntity, DirectionalLightComponent).shadowBias
        assert.equal(result, Expected)
      })
    })

    it('should react when directionalLightComponent.shadowRadius changes', async () => {
      const Expected = 42

      // Set the data as expected
      setComponent(testEntity, DirectionalLightComponent)
      await vi.waitFor(() => {
        // Sanity check before running
        const before = getComponent(testEntity, DirectionalLightComponent).shadowRadius
        assert.equal(before, DirectionalLightComponentDefaults.shadowRadius)
        assert.notEqual(before, Expected)
      })

      // Run and Check the result
      setComponent(testEntity, DirectionalLightComponent, { shadowRadius: Expected })
      await vi.waitFor(() => {
        const result = getComponent(testEntity, DirectionalLightComponent).shadowRadius
        assert.equal(result, Expected)
      })
    })

    it('should react when renderState.shadowMapResolution changes', async () => {
      const Initial = 21
      const Expected = 42

      getMutableState(RendererState).shadowMapResolution.set(Initial)

      // Run and Check the result
      setComponent(testEntity, DirectionalLightComponent)
      await vi.waitFor(() => {
        const before = getComponent(testEntity, ObjectComponent) as DirectionalLight
        assert.equal(before.shadow.mapSize.x, Initial)
      })

      // Re-run and Check the result again
      getMutableState(RendererState).shadowMapResolution.set(Expected)
      await vi.waitFor(() => {
        const result = getComponent(testEntity, ObjectComponent) as DirectionalLight
        assert.equal(result.shadow.mapSize.x, Expected)
      })
    })

    /*it('should react when debugEnabled changes', async () => {
      const Initial = false
      const Expected = !Initial
      const ExpectedColor = new Color(0x123456)
      // Set the data as expected
      getMutableState(RendererState).nodeHelperVisibility.set(Expected)
      getMutableState(EngineState).isEditing.set(Expected)
      // Run and Check the Initial result

      setComponent(testEntity, DirectionalLightComponent, { color: ExpectedColor })
      setComponent(testEntity, VisibleComponent)
      setComponent(testEntity, UUIDComponent, { entitySourceID: 'test' as SourceID, entityID: '0' as EntityID })

      SelectionState.updateSelection([UUIDComponent.get(testEntity)])
      startReactor(helperReactor)

      // Re-run and Check the result again
      getMutableState(RendererState).nodeHelperVisibility.set(Expected)
      await vi.waitFor(() => {
        const childEntity1 = getComponent(testEntity, EntityTreeComponent).children.find(
          (child) => getOptionalComponent(child, LineSegmentComponent)?.name === 'directional-light-helper'
        )
        assert.equal(hasComponent(childEntity1!, LineSegmentComponent), Expected)
        assert.equal(getComponent(childEntity1!, LineSegmentComponent).name, 'directional-light-helper')
      })

      // Re-run and Check the unmount case
      SelectionState.updateSelection([])

      await vi.waitFor(() => {
        const childEntity1 = getComponent(testEntity, EntityTreeComponent).children.find(
          (child) => getOptionalComponent(child, LineSegmentComponent)?.name === 'directional-light-helper'
        )!
        assert.equal(hasComponent(childEntity1, LineSegmentComponent), Initial)
      })
    })*/
  }) //:: should be a test in the helper in the editor package, not here at all
})
