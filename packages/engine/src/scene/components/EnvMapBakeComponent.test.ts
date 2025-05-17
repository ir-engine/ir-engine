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

import { createEngine, createEntity, destroyEngine, EntityContext, removeEntity, UndefinedEntity } from '@ir-engine/ecs'
import { startReactor } from '@ir-engine/hyperflux'
import { act, render } from '@testing-library/react'
import React from 'react'
import { EnvMapBakeComponent } from './EnvMapBakeComponent'

/**
 * @warning These next few lines affect this entire test file.
 * */
const useHelperEntitySpy = vi.hoisted(() => vi.fn())
vi.mock('@ir-engine/spatial/src/common/debug/useHelperEntity', async (Original) => {
  return { ...((await Original()) as any), useHelperEntity: useHelperEntitySpy }
})
/** end */

describe('EnvMapBakeComponent', () => {
  describe('Fields', () => {
    it('should have the expected name', () => {
      const result = EnvMapBakeComponent.name
      expect(result).toBeTruthy()
      expect(result).toBe('EnvMapBakeComponent')
    })

    it('should respect the naming convention for Components', () => {
      const result = EnvMapBakeComponent.name
      expect(result).toBeTruthy()
      expect(result.endsWith('Component')).toBeTruthy()
    })

    it('should initialize the *Component.jsonID field with the expected value', () => {
      expect(EnvMapBakeComponent.jsonID).toBe('EE_envmapbake')
    })
  }) //:: Fields

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

    it('should call useHelperEntity with (entityContext, helperFactory) as arguments', async () => {
      const Reactor = () => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(EnvMapBakeComponent.reactor, {})
        )
      }
      const root = startReactor(Reactor)
      await act(() => render(null))
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(useHelperEntitySpy).toHaveBeenCalledOnce()
    })
  }) //:: reactor
}) //:: EnvMapBakeComponent
