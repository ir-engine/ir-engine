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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * @warning These next few lines affect this entire test file.
 * */
const setPluginSpy = vi.hoisted(() => vi.fn())
vi.mock('@ir-engine/spatial/src/renderer/materials/materialFunctions', async (Original) => {
  return { ...((await Original()) as any), setPlugin: setPluginSpy }
})
/** @warning end */

import {
  createEngine,
  createEntity,
  destroyEngine,
  EntityContext,
  removeEntity,
  setComponent,
  UndefinedEntity
} from '@ir-engine/ecs'
import { ReactorRoot, startReactor } from '@ir-engine/hyperflux'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { act, render } from '@testing-library/react'
import React from 'react'
import { MeshBasicMaterial } from 'three'
import { BoxProjectionPlugin, EnvMapComponent } from './EnvmapComponent'

describe('EnvMapComponent', () => {
  describe('Fields', () => {
    it('should have the expected name', () => {
      const result = EnvMapComponent.name
      expect(result).toBeTruthy()
      expect(result).toBe('EnvMapComponent')
    })

    it('should respect the naming convention for Components', () => {
      const result = EnvMapComponent.name
      expect(result).toBeTruthy()
      expect(result.endsWith('Component')).toBeTruthy()
    })

    it('should initialize the *Component.jsonID field with the expected value', () => {
      expect(EnvMapComponent.jsonID).toBe('EE_envmap')
    })
  }) //:: Fields

  describe('errors', () => {
    it('should contain the expected number of errors', () => {
      expect(EnvMapComponent.errors.length).toBe(1)
    })

    it('should contain the expected error at id [0]', () => {
      expect(EnvMapComponent.errors[0]).toBe('MISSING_FILE')
    })
  }) //:: errors
}) //:: EnvMapComponent

describe('BoxProjectionPlugin', () => {
  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEngine()
    })

    describe('on mount', () => {
      it('should call setPlugin with (entityContext.MaterialStateComponent, callback) as arguments', async () => {
        setComponent(testEntity, MaterialStateComponent, { material: new MeshBasicMaterial() })
        const Reactor = () => {
          return React.createElement(
            EntityContext.Provider,
            { value: testEntity },
            React.createElement(BoxProjectionPlugin.reactor, {})
          )
        }

        const root = startReactor(Reactor) as ReactorRoot
        await act(() => render(null))
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        expect(setPluginSpy).toHaveBeenCalled()
      })

      describe('on cleanup', () => {
        it.todo('.. should call setPlugin with (entityContext.MaterialStateComponent, callback) as arguments', () => {})
      })
    })
  }) //:: reactor
}) //:: BoxProjectionPlugin
