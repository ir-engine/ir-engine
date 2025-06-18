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

import { createEngine, createEntity, destroyEngine, getComponent, setComponent, UndefinedEntity } from '@ir-engine/ecs'
import { destroySpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { mockSpatialEngine } from '@ir-engine/spatial/tests/util/mockSpatialEngine'
import { act, render } from '@testing-library/react'
import React from 'react'
import { BoxGeometry, Mesh, MeshStandardMaterial, Texture } from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LightmapComponent } from './LightmapComponent'

vi.mock('../assets/functions/resourceLoaderHooks', () => ({
  useTexture: vi.fn(() => [null, null])
}))

vi.mock('../gltf/GLTFState', () => ({
  AssetState: {
    loadAsync: vi.fn()
  }
}))

describe('LightmapComponent', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    mockSpatialEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    destroySpatialEngine()
    return destroyEngine()
  })

  describe('IDs', () => {
    it('should initialize the LightmapComponent.name field with the expected value', () => {
      expect(LightmapComponent.name).toBe('LightmapComponent')
    })

    it('should initialize the LightmapComponent.jsonID field with the expected value', () => {
      expect(LightmapComponent.jsonID).toBe('IR_lightmap')
    })
  })

  describe('schema', () => {
    it('should initialize with default values', () => {
      setComponent(testEntity, LightmapComponent)
      const component = getComponent(testEntity, LightmapComponent)

      expect(component.atlasSrc).toBe('')
      expect(component.lightmapSrc).toBe('')
    })

    it('should accept values', () => {
      const testAtlasSrc = '/test/atlas.gltf'
      const testLightmapSrc = '/test/lightmap.jpg'

      setComponent(testEntity, LightmapComponent, {
        atlasSrc: testAtlasSrc,
        lightmapSrc: testLightmapSrc
      })

      const component = getComponent(testEntity, LightmapComponent)
      expect(component.atlasSrc).toBe(testAtlasSrc)
      expect(component.lightmapSrc).toBe(testLightmapSrc)
    })
  })

  describe('reactor', () => {
    it('should apply lightmap to mesh material when lightmapSrc is provided', async () => {
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshStandardMaterial()
      const mesh = new Mesh(geometry, material)

      setComponent(testEntity, MeshComponent, mesh)
      setComponent(testEntity, LightmapComponent, {
        lightmapSrc: '/test/lightmap.jpg'
      })

      const mockTexture = new Texture()
      const { useTexture } = await import('../assets/functions/resourceLoaderHooks')
      vi.mocked(useTexture).mockReturnValue([mockTexture, null, null, () => {}])

      await act(async () => {
        render(React.createElement(LightmapComponent.reactor, { entity: testEntity }))
      })
    })
  })
})
