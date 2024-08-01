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

import {
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  removeEntity,
  setComponent
} from '@etherealengine/ecs'
import assert from 'assert'
import { Color, CubeTexture, FogBase, Texture } from 'three'
import { BackgroundComponent, EnvironmentMapComponent, FogComponent, SceneComponent } from './SceneComponents'

describe('SceneComponent', () => {
  describe('IDs', () => {
    it('should initialize the SceneComponent.name field with the expected value', () => {
      assert.equal(SceneComponent.name, 'SceneComponent')
    })
  }) //:: IDs
})

const BackgroundComponentDefaults = null! as Color | Texture | CubeTexture

function assertBackgroundComponentEq(A, B) {
  /** @todo Check their properties */
}

describe('BackgroundComponent', () => {
  describe('IDs', () => {
    it('should initialize the BackgroundComponent.name field with the expected value', () => {
      assert.equal(BackgroundComponent.name, 'BackgroundComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, BackgroundComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, BackgroundComponent)
      assertBackgroundComponentEq(data, BackgroundComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    // it('should change the values of an initialized BackgroundComponent', () => {})
    // it('should not change values of an initialized BackgroundComponent when the data passed had incorrect types', () => {})
  }) //:: onSet
}) //:: BackgroundComponent

const EnvironmentMapComponentDefaults = null! as Texture

function assertEnvironmentMapComponentEq(A, B) {
  /** @todo Check their properties */
}

describe('EnvironmentMapComponent', () => {
  describe('IDs', () => {
    it('should initialize the EnvironmentMapComponent.name field with the expected value', () => {
      assert.equal(EnvironmentMapComponent.name, 'EnvironmentMapComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, EnvironmentMapComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, EnvironmentMapComponent)
      assertEnvironmentMapComponentEq(data, EnvironmentMapComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    // it('should change the values of an initialized EnvironmentMapComponent', () => {})
    // it('should not change values of an initialized EnvironmentMapComponent when the data passed had incorrect types', () => {})
  }) //:: onSet
}) //:: EnvironmentMapComponent

const FogComponentDefaults = null! as FogBase

function assertFogComponentEq(A, B) {
  /** @todo Check their properties */
}

describe('FogComponent', () => {
  describe('IDs', () => {
    it('should initialize the FogComponent.name field with the expected value', () => {
      assert.equal(FogComponent.name, 'FogComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, FogComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, FogComponent)
      assertFogComponentEq(data, FogComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    // it('should change the values of an initialized FogComponent', () => {})
    // it('should not change values of an initialized FogComponent when the data passed had incorrect types', () => {})
  }) //:: onSet
}) //:: FogComponent
