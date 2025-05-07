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
import { mockGLB, mockGLBOptionsSetMissingDefaults } from '../../tests/util/mockGLTF'

import { GLTF } from '@gltf-transform/core'
import {
  createEngine,
  createEntity,
  defineComponent,
  destroyEngine,
  Entity,
  EntityContext,
  entityExists,
  EntityTreeComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  LayerComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { getMutableState, getState, startReactor } from '@ir-engine/hyperflux'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { act, render } from '@testing-library/react'
import React from 'react'
import { BoxGeometry, Mesh } from 'three'
import { startEngineReactor } from '../../tests/startEngineReactor'
import { overrideFileLoaderLoad, overrideTextureLoaderLoad } from '../../tests/util/loadGLTFAssetNode'
import { AssetLoaderState } from '../assets/state/AssetLoaderState'
import { AnimationComponent } from '../avatar/components/AnimationComponent'
import { SourceComponent, SourceID } from '../scene/components/SourceComponent'
import {
  BINARY_EXTENSION_HEADER_LENGTH,
  BINARY_EXTENSION_HEADER_MAGIC,
  getGLTFOptions,
  GLTFComponent,
  GLTFComponentFunctions,
  GLTFComponentHooks,
  GLTFComponentReactor,
  GLTFComponentReactors,
  parseBinaryData,
  useHasModelOrIndependentMesh
} from './GLTFComponent'
import { GLTFLoaderFunctions } from './GLTFLoaderFunctions'
import { AssetState } from './GLTFState'

describe('GLTFComponent', () => {
  type ComponentDependencies = any

  describe('useDependenciesLoaded', () => {
    let testEntity = UndefinedEntity
    beforeEach(() => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEngine()
    })

    it('should return the result of calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies', async () => {
      const dependencies = { componentDependencies: {} } as ComponentDependencies
      const Expected = GLTFComponentFunctions.componentDependenciesLoaded(dependencies)

      setComponent(testEntity, GLTFComponent, { dependencies: dependencies })
      let state: boolean = false
      const Reactor = () => {
        state = GLTFComponent.useDependenciesLoaded(testEntity)
        return null
      }
      const before = state
      expect(before).not.toBe(Expected)

      const root = startReactor(Reactor)
      await act(() => render(null))
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      const result = state
      expect(result).toBe(Expected)
    })
  }) //:: useDependenciesLoaded

  describe('useSceneLoaded', () => {
    let testEntity = UndefinedEntity
    beforeEach(() => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEngine()
    })

    it('should return false (return early) if `@param entity`.GLTFComponent is falsy', async () => {
      const Expected = false

      let state: boolean = false
      const Reactor = () => {
        state = GLTFComponent.useSceneLoaded(testEntity)
        return null
      }

      const root = startReactor(Reactor)
      await act(() => render(null))
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      const result = state
      expect(result).toBe(Expected)
    })

    describe('when progress is 100 ..', () => {
      const progress = 100

      it('should return false when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns false', async () => {
        const Expected = false

        const dependencies = { componentDependencies: { one: {} as any } } as ComponentDependencies
        setComponent(testEntity, GLTFComponent, { dependencies: dependencies, progress: progress })

        let state: boolean = false
        const Reactor = () => {
          state = GLTFComponent.useSceneLoaded(testEntity)
          return null
        }

        const root = startReactor(Reactor)
        await act(() => render(null))
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        const result = state
        expect(result).toBe(Expected)
      })

      it('should return true when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns true', async () => {
        const Expected = true

        const dependencies = { componentDependencies: {} } as ComponentDependencies
        setComponent(testEntity, GLTFComponent, { dependencies: dependencies, progress: progress })

        expect(hasComponent(testEntity, GLTFComponent)).true
        expect(getComponent(testEntity, GLTFComponent).progress).toBe(100)
        expect(
          GLTFComponentFunctions.componentDependenciesLoaded(getComponent(testEntity, GLTFComponent).dependencies)
        ).toBeTruthy()

        let state: boolean = false
        const Reactor = () => {
          state = GLTFComponent.useSceneLoaded(testEntity)
          return null
        }

        const root = startReactor(Reactor)
        await act(() => render(null))
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        const result = state
        expect(result).toBe(Expected)
      })
    })

    describe('when progress is not 100 ..', () => {
      const progress = 100 - 1

      it('should return false when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns false', async () => {
        const Expected = false

        const dependencies = { componentDependencies: { one: {} as any } } as ComponentDependencies
        setComponent(testEntity, GLTFComponent, { dependencies: dependencies, progress: progress })

        expect(hasComponent(testEntity, GLTFComponent)).true
        expect(getComponent(testEntity, GLTFComponent).progress).not.toBe(100)
        expect(
          GLTFComponentFunctions.componentDependenciesLoaded(getComponent(testEntity, GLTFComponent).dependencies)
        ).toBeFalsy()

        let state: boolean = false
        const Reactor = () => {
          state = GLTFComponent.useSceneLoaded(testEntity)
          return null
        }

        const root = startReactor(Reactor)
        await act(() => render(null))
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        const result = state
        expect(result).toBe(Expected)
      })

      it('should return false when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns true', async () => {
        const Expected = false

        const dependencies = { componentDependencies: {} } as ComponentDependencies
        setComponent(testEntity, GLTFComponent, { dependencies: dependencies, progress: progress })

        expect(hasComponent(testEntity, GLTFComponent)).true
        expect(getComponent(testEntity, GLTFComponent).progress).not.toBe(100)
        expect(
          GLTFComponentFunctions.componentDependenciesLoaded(getComponent(testEntity, GLTFComponent).dependencies)
        ).toBeTruthy()

        let state: boolean = false
        const Reactor = () => {
          state = GLTFComponent.useSceneLoaded(testEntity)
          return null
        }

        const root = startReactor(Reactor)
        await act(() => render(null))
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        const result = state
        expect(result).toBe(Expected)
      })
    })
  }) //:: useSceneLoaded

  describe('isSceneLoaded', () => {
    let testEntity = UndefinedEntity
    beforeEach(() => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEngine()
    })

    it('should return false (return early) if `@param entity`.GLTFComponent is falsy', () => {
      const Expected = false
      const result = GLTFComponent.isSceneLoaded(testEntity)
      expect(result).toBe(Expected)
    })

    describe('when progress is 100 ..', () => {
      const progress = 100

      it('should return false when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns false', () => {
        const Expected = false

        const dependencies = { componentDependencies: { one: {} as any } } as ComponentDependencies
        setComponent(testEntity, GLTFComponent, { dependencies: dependencies, progress: progress })

        const result = GLTFComponent.isSceneLoaded(testEntity)
        expect(result).toBe(Expected)
      })

      it('should return true when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns true', () => {
        const Expected = true

        const dependencies = { componentDependencies: {} } as ComponentDependencies
        setComponent(testEntity, GLTFComponent, { dependencies: dependencies, progress: progress })

        expect(hasComponent(testEntity, GLTFComponent)).true
        expect(getComponent(testEntity, GLTFComponent).progress).toBe(100)
        expect(
          GLTFComponentFunctions.componentDependenciesLoaded(getComponent(testEntity, GLTFComponent).dependencies)
        ).toBeTruthy()

        const result = GLTFComponent.isSceneLoaded(testEntity)
        expect(result).toBe(Expected)
      })
    })

    describe('when progress is not 100 ..', () => {
      const progress = 100 - 1

      it('should return false when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns false', () => {
        const Expected = false

        const dependencies = { componentDependencies: { one: {} as any } } as ComponentDependencies
        setComponent(testEntity, GLTFComponent, { dependencies: dependencies, progress: progress })

        expect(hasComponent(testEntity, GLTFComponent)).true
        expect(getComponent(testEntity, GLTFComponent).progress).not.toBe(100)
        expect(
          GLTFComponentFunctions.componentDependenciesLoaded(getComponent(testEntity, GLTFComponent).dependencies)
        ).toBeFalsy()

        const result = GLTFComponent.isSceneLoaded(testEntity)
        expect(result).toBe(Expected)
      })

      it('should return false when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns true', () => {
        const Expected = false

        const dependencies = { componentDependencies: {} } as ComponentDependencies
        setComponent(testEntity, GLTFComponent, { dependencies: dependencies, progress: progress })

        expect(hasComponent(testEntity, GLTFComponent)).true
        expect(getComponent(testEntity, GLTFComponent).progress).not.toBe(100)
        expect(
          GLTFComponentFunctions.componentDependenciesLoaded(getComponent(testEntity, GLTFComponent).dependencies)
        ).toBeTruthy()

        const result = GLTFComponent.isSceneLoaded(testEntity)
        expect(result).toBe(Expected)
      })
    })
  }) //:: isSceneLoaded

  describe('getInstanceID', () => {
    let testEntity = UndefinedEntity
    beforeEach(() => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEngine()
    })

    describe('when `@param entity` does not have a GLTFComponent ..', () => {
      it('.. should return `@param entity`.SourceComponent if it is truthy', () => {
        const Expected = 'SomeSourceID' as SourceID

        setComponent(testEntity, SourceComponent, Expected)

        const result = GLTFComponent.getInstanceID(testEntity)
        expect(result).toBe(Expected)
      })

      it(".. should return '' if `@param entity`.SourceComponent is falsy", () => {
        const Expected = '' as SourceID

        setComponent(testEntity, SourceComponent, Expected)

        const result = GLTFComponent.getInstanceID(testEntity)
        expect(result).toBe(Expected)
      })
    })

    describe('when `@param entity` has a GLTFComponent ..', () => {
      it(".. should return '' if `@param entity`.UUIDComponent is falsy", () => {
        const Expected = '' as SourceID

        setComponent(testEntity, SourceComponent, Expected)
        setComponent(testEntity, GLTFComponent)

        const result = GLTFComponent.getInstanceID(testEntity)
        expect(result).toBe(Expected)
      })

      it(".. should return '' if `@param entity`.GLTFComponent is falsy", () => {
        const Expected = '' as SourceID

        setComponent(testEntity, SourceComponent, Expected)
        setComponent(testEntity, GLTFComponent)
        getMutableComponent(testEntity, GLTFComponent).set(null as any)
        setComponent(testEntity, UUIDComponent, UUIDComponent.generateUUID())

        const result = GLTFComponent.getInstanceID(testEntity)
        expect(result).toBe(Expected)
      })

      it('.. should return the result of SourceComponent.getSourceID with entity.(UUIDCOmponent, GLTFComponent.src) as arguments', () => {
        const uuid = UUIDComponent.generateUUID()
        const src = 'SomeSourcePath'
        const Expected = `${uuid}-${src}` as SourceID

        setComponent(testEntity, SourceComponent, Expected)
        setComponent(testEntity, GLTFComponent, { src: src })
        setComponent(testEntity, UUIDComponent, uuid)

        const result = GLTFComponent.getInstanceID(testEntity)
        expect(result).toBe(Expected)
      })
    })
  }) //:: getInstanceID

  describe('useInstanceID', () => {
    let testEntity = UndefinedEntity
    beforeEach(() => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEngine()
    })

    describe('when `@param entity` does not have a GLTFComponent ..', () => {
      it('.. should return `@param entity`.SourceComponent if it is truthy', async () => {
        const Expected = 'SomeSourceID' as SourceID

        setComponent(testEntity, SourceComponent, Expected)

        let result = '' as SourceID
        const Reactor = () => {
          result = GLTFComponent.useInstanceID(testEntity)
          return null
        }
        const root = startReactor(Reactor)
        await act(() => render(null))
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        expect(result).toBe(Expected)
      })

      it(".. should return '' if `@param entity`.SourceComponent is falsy", async () => {
        const Expected = '' as SourceID

        setComponent(testEntity, SourceComponent, Expected)

        let result = '' as SourceID
        const Reactor = () => {
          result = GLTFComponent.useInstanceID(testEntity)
          return null
        }
        const root = startReactor(Reactor)
        await act(() => render(null))
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        expect(result).toBe(Expected)
      })
    })

    describe('when `@param entity` has a GLTFComponent ..', () => {
      it(".. should return '' if `@param entity`.UUIDComponent is falsy", async () => {
        const Expected = '' as SourceID

        setComponent(testEntity, SourceComponent, Expected)
        setComponent(testEntity, GLTFComponent)

        let result = '' as SourceID
        const Reactor = () => {
          result = GLTFComponent.useInstanceID(testEntity)
          return null
        }
        const root = startReactor(Reactor)
        await act(() => render(null))
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        expect(result).toBe(Expected)
      })

      it(".. should return '' if `@param entity`.GLTFComponent is falsy", async () => {
        const Expected = '' as SourceID

        setComponent(testEntity, SourceComponent, Expected)
        setComponent(testEntity, GLTFComponent)
        getMutableComponent(testEntity, GLTFComponent).set(null as any)
        setComponent(testEntity, UUIDComponent, UUIDComponent.generateUUID())

        let result = '' as SourceID
        const Reactor = () => {
          result = GLTFComponent.useInstanceID(testEntity)
          return null
        }
        const root = startReactor(Reactor)
        await act(() => render(null))
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        expect(result).toBe(Expected)
      })

      it('.. should return the result of SourceComponent.getSourceID with entity.(UUIDCOmponent, GLTFComponent.src) as arguments', async () => {
        const uuid = UUIDComponent.generateUUID()
        const src = 'SomeSourcePath'
        const Expected = `${uuid}-${src}` as SourceID

        setComponent(testEntity, SourceComponent, Expected)
        setComponent(testEntity, GLTFComponent, { src: src })
        setComponent(testEntity, UUIDComponent, uuid)

        let result = '' as SourceID
        const Reactor = () => {
          result = GLTFComponent.useInstanceID(testEntity)
          return null
        }
        const root = startReactor(Reactor)
        await act(() => render(null))
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        expect(result).toBe(Expected)
      })
    })
  }) //:: useInstanceID
}) //:: GLTFComponent

// ? componentDependenciesLoaded
// ? loadDependencies
// ? buildComponentDependencies
// ? useGLTFDocument
// ? ResourceReactor
// ? DependencyReactor
describe('GLTFComponentReactor', () => {
  /** @todo Switch to https://github.com/ir-engine/ir-engine/pull/1421 */
  overrideFileLoaderLoad()
  overrideTextureLoaderLoad()
  const TestScenePath: string = 'packages/engine/tests/assets/duck/Duck.gltf'

  let testEntity = UndefinedEntity
  beforeEach(() => {
    createEngine()
    startEngineReactor()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroyEngine()
  })

  describe('on change [gltfComponent.cameraOcclusion]', () => {
    it('should call ObjectLayerMaskComponent.disableLayer if entityContext.GLTFComponent.cameraOcclusion is falsy', async () => {
      setComponent(testEntity, GLTFComponent, {
        progress: 100,
        dependencies: { componentDependencies: {} },
        cameraOcclusion: false
      })
      const resultSpy = vi.spyOn(ObjectLayerMaskComponent, 'disableLayer')
      const Reactor = () => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(GLTFComponentReactor, {})
        )
      }

      const root = startReactor(Reactor)
      await act(() => render(null))
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(resultSpy).toHaveBeenCalled()
    })

    it('should call ObjectLayerMaskComponent.enableLayer if entityContext.GLTFComponent.cameraOcclusion is truthy', async () => {
      setComponent(testEntity, GLTFComponent, {
        progress: 100,
        dependencies: { componentDependencies: {} },
        cameraOcclusion: true
      })
      const resultSpy = vi.spyOn(ObjectLayerMaskComponent, 'enableLayer')
      const Reactor = () => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(GLTFComponentReactor, {})
        )
      }

      const root = startReactor(Reactor)
      await act(() => render(null))
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(resultSpy).toHaveBeenCalled()
    })
  }) //:: [gltfComponent.cameraOcclusion]

  it('should call useGLTFDocument with entityContext as arguments', async () => {
    const resultSpy = vi.spyOn(GLTFComponentHooks, 'useGLTFDocument')
    const uuid = UUIDComponent.generateUUID()
    const src = TestScenePath
    setComponent(testEntity, UUIDComponent, uuid)
    setComponent(testEntity, GLTFComponent, { src: src })
    const Reactor = () => {
      return React.createElement(
        EntityContext.Provider,
        { value: testEntity },
        React.createElement(GLTFComponentReactor, {})
      )
    }

    const root = startReactor(Reactor)
    await act(() => render(null))
    expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
    expect(resultSpy).toHaveBeenCalledWith(testEntity)
  })

  describe('on change [gltfComponent.src]', () => {
    // @warning This test passes only intermitently. Don't know why
    it.todo('should set AssetState[GLTFComponent.getInstanceID(entityContext)] to entityContext', async () => {
      const Expected = testEntity
      const Initial = createEntity()

      const uuid = UUIDComponent.generateUUID()
      const src = TestScenePath
      setComponent(testEntity, UUIDComponent, uuid)
      setComponent(testEntity, GLTFComponent, { src: src })
      setComponent(testEntity, AnimationComponent)
      const sourceID = GLTFComponent.getInstanceID(testEntity)
      getMutableState(AssetState)[sourceID].set(Initial)
      const Reactor = () => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(GLTFComponentReactor, {})
        )
      }

      const root = startReactor(Reactor)
      await vi.waitFor(() => {
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        const result = getState(AssetState)[sourceID]
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })
    })

    describe('on cleanup', () => {
      it('should set AssetState[GLTFComponent.getInstanceID(entityContext)] to none', async () => {
        const Expected = undefined
        const Initial = createEntity()

        const uuid = UUIDComponent.generateUUID()
        const src = TestScenePath
        const sourceID = `${uuid}-${src}` as SourceID
        getMutableState(AssetState)[sourceID].set(Initial)
        setComponent(testEntity, UUIDComponent, uuid)
        setComponent(testEntity, GLTFComponent, {
          src: src,
          progress: 100,
          dependencies: { componentDependencies: {} }
        })
        const Reactor = () => {
          return React.createElement(
            EntityContext.Provider,
            { value: testEntity },
            React.createElement(GLTFComponentReactor, {})
          )
        }

        const root = startReactor(Reactor)
        await act(() => render(null))
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        root.stop()
        const result = getState(AssetState)[sourceID]
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })
    })
  }) //:: [gltfComponent.src]

  describe('on change [gltfComponent.document]', () => {
    // dep: entityContext.GLTFComponent
    // dep: entityContext.GLTFComponent.src
    // dep: entityContext.GLTFComponent.document
    // dep: entityContext.GLTFComponent.body
    // dep: AssetLoaderState.manager
    // dep: entityContext.GLTFComponent.document.scene || 0
    it('should remove the AnimationComponent of entityContext', async () => {
      const Expected = false
      const Initial = !Expected

      const uuid = UUIDComponent.generateUUID()
      const src = TestScenePath
      setComponent(testEntity, UUIDComponent, uuid)
      setComponent(testEntity, GLTFComponent, { src: src })
      setComponent(testEntity, AnimationComponent)
      const Reactor = () => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(GLTFComponentReactor, {})
        )
      }

      const root = startReactor(Reactor)
      await act(() => render(null))
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      const result = hasComponent(testEntity, AnimationComponent)
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    /** @todo How to setup this test correctly ? */
    it.todo('should not do anything (return early) if entityContext.GLTFComponent.document is falsy', async () => {
      const Initial = true

      const uuid = UUIDComponent.generateUUID()
      const src = TestScenePath
      const json = null as unknown as GLTF.IGLTF
      setComponent(testEntity, UUIDComponent, uuid)
      setComponent(testEntity, GLTFComponent, {
        src: src
        // document: json,
        // progress: 100,
        // dependencies: { componentDependencies: {} }
      })
      setComponent(testEntity, AnimationComponent)
      getMutableComponent(testEntity, GLTFComponent).document.set(json)
      const Reactor = () => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(GLTFComponentReactor, {})
        )
      }
      expect(hasComponent(testEntity, AnimationComponent)).toBeTruthy()
      expect(getComponent(testEntity, GLTFComponent).document).toBeFalsy()

      const root = startReactor(Reactor)
      await act(() => render(null))
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      const result = hasComponent(testEntity, AnimationComponent)
      expect(result).toBe(Initial)
    })

    // dep: entityContext.GLTFComponent
    // dep: entityContext.GLTFComponent.src
    // dep: entityContext.GLTFComponent.document
    // dep: entityContext.GLTFComponent.body
    // dep: AssetLoaderState.manager
    // dep: entityContext.GLTFComponent.document.scene || 0

    /** @todo Why is this test failing ? */
    it.todo(
      'should call GLTFLoaderFunctions.loadScene with the generated glTF loader options and sceneIndex as arguments',
      async () => {
        // 3. Set input & dependencies data
        const resultSpy = vi.spyOn(GLTFLoaderFunctions, 'loadScene')
        const uuid = UUIDComponent.generateUUID()
        const src = TestScenePath
        setComponent(testEntity, UUIDComponent, uuid)
        setComponent(testEntity, GLTFComponent, { src: src })
        setComponent(testEntity, AnimationComponent)
        const Reactor = () => {
          return React.createElement(
            EntityContext.Provider,
            { value: testEntity },
            React.createElement(GLTFComponentReactor, {})
          )
        }
        // 1. Sanity check (input & dependencies)
        expect(hasComponent(testEntity, GLTFComponent)).toBeTruthy()
        expect(resultSpy).not.toHaveBeenCalled()
        // 2. Run the process
        const root = startReactor(Reactor)
        await act(() => render(null))
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        await vi.waitUntil(() => getComponent(testEntity, GLTFComponent).progress === 100, { timeout: 1_000 })
        expect(resultSpy).toHaveBeenCalled()
      }
    )

    describe('on cleanup', () => {
      it('should call GLTFLoaderFunctions.unloadScene with (entityContex.GLTFDocument.src, entityContext) as arguments', async () => {
        // 3. Set input & dependencies data
        const resultSpy = vi.spyOn(GLTFLoaderFunctions, 'unloadScene')
        const uuid = UUIDComponent.generateUUID()
        const src = TestScenePath
        setComponent(testEntity, UUIDComponent, uuid)
        setComponent(testEntity, GLTFComponent, { src: src })
        setComponent(testEntity, AnimationComponent)
        const Reactor = () => {
          return React.createElement(
            EntityContext.Provider,
            { value: testEntity },
            React.createElement(GLTFComponentReactor, {})
          )
        }
        // 1. Sanity check (input & dependencies)
        expect(resultSpy).not.toHaveBeenCalled()
        // 2. Run the process
        const root = startReactor(Reactor)
        await act(() => render(null))
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        // 4. Check the result (output)
        expect(resultSpy).toHaveBeenCalled()
        // 5? Cleanup (dependencies)
      })

      it('should should call removeEntity on all entities in SourceComponent.getEntitiesBySource(sourceID, layer)', async () => {
        // 3. Set input & dependencies data
        const uuid = UUIDComponent.generateUUID()
        const src = TestScenePath
        setComponent(testEntity, UUIDComponent, uuid)
        setComponent(testEntity, GLTFComponent, { src: src })
        setComponent(testEntity, AnimationComponent)
        const Reactor = () => {
          return React.createElement(
            EntityContext.Provider,
            { value: testEntity },
            React.createElement(GLTFComponentReactor, {})
          )
        }
        const layer = LayerComponent.get(testEntity)
        const sourceID = GLTFComponent.getInstanceID(testEntity)
        const sourceEntitiesCount = 10
        const sourceEntities: Entity[] = []
        for (let id = 0; id < sourceEntitiesCount; ++id) {
          const entity = createEntity(layer)
          setComponent(entity, SourceComponent, sourceID)
          sourceEntities.push(entity)
        }
        expect(SourceComponent.getEntitiesBySource(sourceID, layer).length).toBe(sourceEntitiesCount)
        // 1. Sanity check (input & dependencies)
        for (const entity of sourceEntities) expect(entityExists(entity)).toBeTruthy()
        // 2. Run the process
        const root = startReactor(Reactor)
        await act(() => render(null))
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        // 4. Check the result (output)
        for (const result of sourceEntities) expect(entityExists(result)).toBeFalsy()
        // 5? Cleanup (dependencies)
      })

      it('should set entityContext.GLTFComponent.progress to 0 if entityContext has a GLTFComponent', async () => {
        const Expected = 0
        const Initial = 42

        const uuid = UUIDComponent.generateUUID()
        const src = TestScenePath
        setComponent(testEntity, UUIDComponent, uuid)
        setComponent(testEntity, GLTFComponent, { src: src, progress: Initial })
        setComponent(testEntity, AnimationComponent)
        const Reactor = () => {
          return React.createElement(
            EntityContext.Provider,
            { value: testEntity },
            React.createElement(GLTFComponentReactor, {})
          )
        }

        const root = startReactor(Reactor)
        await act(() => render(null))
        root.stop()
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        const result = getComponent(testEntity, GLTFComponent).progress
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })
    })
  }) //:: [gltfComponent.document]

  // dep: entityContext.GLTFComponent.dependencies
  // dep: entityContext.SceneComponent
  describe('on change [sceneLoaded, !!scene]', () => {
    it('should set a SceneComponent to entityContext with {active:true}', async () => {
      const Expected = true
      const Initial = !Expected

      const uuid = UUIDComponent.generateUUID()
      const src = TestScenePath
      setComponent(testEntity, UUIDComponent, uuid)
      setComponent(testEntity, GLTFComponent, { src: src, progress: 100, dependencies: { componentDependencies: {} } })
      setComponent(testEntity, SceneComponent, { active: Initial })
      const Reactor = () => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(GLTFComponentReactor, {})
        )
      }

      const root = startReactor(Reactor)
      await act(() => render(null))
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      const result = getComponent(testEntity, SceneComponent).active
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should not do anything (return early) if sceneLoaded is falsy', async () => {
      const Initial = false

      const uuid = UUIDComponent.generateUUID()
      const src = TestScenePath
      setComponent(testEntity, UUIDComponent, uuid)
      setComponent(testEntity, GLTFComponent, { src: src, progress: 99, dependencies: { componentDependencies: {} } })
      setComponent(testEntity, SceneComponent, { active: Initial })
      const Reactor = () => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(GLTFComponentReactor, {})
        )
      }

      const root = startReactor(Reactor)
      await act(() => render(null))
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      const result = getComponent(testEntity, SceneComponent).active
      expect(result).toBe(Initial)
    })

    it('should not do anything (return early) if entityContext does not have an SceneComponent', async () => {
      const Initial = false

      const uuid = UUIDComponent.generateUUID()
      const src = TestScenePath
      setComponent(testEntity, UUIDComponent, uuid)
      setComponent(testEntity, GLTFComponent, { src: src, progress: 99, dependencies: { componentDependencies: {} } })
      const Reactor = () => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(GLTFComponentReactor, {})
        )
      }

      const root = startReactor(Reactor)
      await act(() => render(null))
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      const result = hasComponent(testEntity, SceneComponent)
      expect(result).toBe(Initial)
    })
  }) //:: [sceneLoaded, !!scene]

  describe('on cleanup', () => {
    describe('when entityContext.GLTFDocument.dependencies is truthy and componentDependenciesLoaded is falsy', () => {
      it('should call ResourceReactor with sourceID as props.documentID, entityContext as props.entity and documentLoaded as props.documentLoaded', async () => {
        const src = TestScenePath
        const uuid = UUIDComponent.generateUUID()
        setComponent(testEntity, GLTFComponent, { src: src })
        setComponent(testEntity, UUIDComponent, uuid)
        const resultSpy = vi.spyOn(GLTFComponentReactors, 'ResourceReactor')
        const Reactor = () => {
          return React.createElement(
            EntityContext.Provider,
            { value: testEntity },
            React.createElement(GLTFComponentReactor, {})
          )
        }

        const root = startReactor(Reactor)
        await act(() => render(null))
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        root.stop()
        expect(resultSpy).toHaveBeenCalled()
      })

      it('should call DependencyReactor with entityContext as key, entityContext as props.gltfComponentEntity and entityContext.GLTFDocument.dependencies as props.dependencies', async () => {
        const uuid = UUIDComponent.generateUUID()
        const src = TestScenePath
        const TestComponent = defineComponent({ name: 'TestComponent' })
        const dependencies = { componentDependencies: { [uuid]: [TestComponent] } }
        setComponent(testEntity, GLTFComponent, { src: src, dependencies: dependencies })
        setComponent(testEntity, UUIDComponent, uuid)
        const resultSpy = vi.spyOn(GLTFComponentReactors, 'DependencyReactor')
        const Reactor = () => {
          return React.createElement(
            EntityContext.Provider,
            { value: testEntity },
            React.createElement(GLTFComponentReactor, {})
          )
        }

        const root = startReactor(Reactor)
        await act(() => render(null))
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        root.stop()
        expect(resultSpy).toHaveBeenCalled()
      })
    })
  })
}) //:: GLTFComponentReactor

describe('loadGLTFFile', () => {
  /** @note Unit Tests for gltf loading are stored in separate files, and dictated by the spec requirements */
}) //:: loadGLTFFile

describe('parseBinaryData', () => {
  it('should throw an error if the first 4 bytes of `@param data` are not equal to BINARY_EXTENSION_HEADER_MAGIC', () => {
    const data = mockGLB({ magic: 'STAR' })
    expect(() => {
      parseBinaryData(data)
    }).toThrowError()
  })

  it('should throw an error if the first 4 bytes of `@param data` are equal to BINARY_EXTENSION_HEADER_MAGIC and the uint32 at byte 4 is less than 2.0', () => {
    const data = mockGLB({ version: 1 })
    const view = new DataView(data.buffer)
    expect(new TextDecoder().decode(data.slice(0, 4))).toBe(BINARY_EXTENSION_HEADER_MAGIC)
    expect(view.getUint32(4, true)).toBeLessThan(2.0)
    expect(() => {
      parseBinaryData(data)
    }).toThrowError()
  })

  it('should decode and parse the BINARY_EXTENSION_CHUNK_TYPES.JSON chunk data into the result.json object', () => {
    const Expected = { one: 42 }
    const data = mockGLB({ json: Expected })

    let result: any
    expect(() => {
      result = parseBinaryData(data.buffer)
    }).not.toThrowError()
    expect(result.json).toEqual(Expected)
  })

  it('should throw an error if the BINARY_EXTENSION_CHUNK_TYPES.JSON chunk was not found', () => {
    const Expected = { one: 42 }
    const data = mockGLB({ json: Expected })
    const view = new DataView(data.buffer)
    view.setUint32(BINARY_EXTENSION_HEADER_LENGTH + 4, 0x12_34_56_78) // Set the chunk type to an incorrect value, so it is skipped

    let result: any
    expect(() => {
      result = parseBinaryData(data.buffer)
    }).toThrowError()
  })

  it('should copy the entire BINARY_EXTENSION_CHUNK_TYPES.BIN chunk data into the result.body object', async () => {
    const Expected = [1, 2, 3, 4]
    const bin = new Uint8Array(Expected).buffer
    const args = { bin: bin }
    mockGLBOptionsSetMissingDefaults(args)
    const data = mockGLB(args)

    let parsed: { json: string; body: ArrayBuffer | null }
    expect(() => {
      parsed = parseBinaryData(data.buffer)
    }).not.toThrowError()
    const result = [...new Uint8Array(parsed!.body!)]
    expect(result).toEqual(Expected)
  })
}) //:: parseBinaryData

describe('useHasModelOrIndependentMesh', () => {
  let testEntity = UndefinedEntity
  beforeEach(() => {
    createEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroyEngine()
  })

  it('should return true if `@param entity` has a GLTFComponent', async () => {
    const Expected = true
    setComponent(testEntity, GLTFComponent)

    let result = !Expected
    const Reactor = () => {
      result = useHasModelOrIndependentMesh(testEntity)
      return null
    }
    const root = startReactor(Reactor)
    await act(() => render(null))
    expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
    expect(result).toBe(Expected)
  })

  it('should return true if `@param entity` does not have a GLTFComponent, it has a MeshComponent and it does not have an ancestor with components [GLTFComponent, SceneComponent]', async () => {
    const Expected = true
    setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))

    let result = !Expected
    const Reactor = () => {
      result = useHasModelOrIndependentMesh(testEntity)
      return null
    }
    const root = startReactor(Reactor)
    await act(() => render(null))
    expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
    expect(result).toBe(Expected)
  })

  it('should return false if `@param entity` does not have a GLTFComponent, it has a MeshComponent and it has an ancestor with components [GLTFComponent, SceneComponent]', async () => {
    const Expected = false

    const parentEntity = createEntity()
    setComponent(parentEntity, GLTFComponent)
    setComponent(parentEntity, SceneComponent)
    setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
    setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })

    let result = !Expected
    const Reactor = () => {
      result = useHasModelOrIndependentMesh(testEntity)
      return null
    }
    const root = startReactor(Reactor)
    await act(() => render(null))
    expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
    expect(result).toBe(Expected)
  })

  it('should return false if `@param entity` does not have a GLTFComponent, a MeshComponent or an ancestor with components [GLTFComponent, SceneComponent]', async () => {
    const Expected = false

    const parentEntity = createEntity()
    setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })

    let result = !Expected
    const Reactor = () => {
      result = useHasModelOrIndependentMesh(testEntity)
      return null
    }
    const root = startReactor(Reactor)
    await act(() => render(null))
    expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
    expect(result).toBe(Expected)
  })
}) //:: useHasModelOrIndependentMesh

describe('getGLTFOptions', () => {
  let testEntity = UndefinedEntity
  beforeEach(() => {
    createEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroyEngine()
  })

  // dep: `@param entity`.GLTFComponent
  // dep: `@param entity`.GLTFComponent.src
  // dep: `@param entity`.GLTFComponent.document
  // dep: `@param entity`.GLTFComponent.body
  // dep: AssetLoaderState.manager
  it('should return an object that has `@param entity` in its .entity field', () => {
    const Expected = testEntity
    const gltf = {
      src: 'SomeTestSource',
      document: {} as GLTF.IGLTF,
      body: {} as ArrayBuffer
    }

    setComponent(testEntity, GLTFComponent, { src: gltf.src, document: gltf.document, body: gltf.body })

    const result = getGLTFOptions(testEntity).entity
    expect(result).toBe(Expected)
  })

  it('should return an object that has `@param entity`.GLTFComponent.document in its .document field', () => {
    const Expected = {} as GLTF.IGLTF
    const gltf = {
      src: 'SomeTestSource',
      document: Expected,
      body: {} as ArrayBuffer
    }

    setComponent(testEntity, GLTFComponent, { src: gltf.src, document: gltf.document, body: gltf.body })

    const result = getGLTFOptions(testEntity).document
    expect(result).toBe(Expected)
  })

  it('should return an object that has `@param entity`.instanceID in its .documentID field', () => {
    const uuid = UUIDComponent.generateUUID()
    const src = 'SomeSourcePath'
    const Expected = `${uuid}-${src}` as SourceID
    const gltf = {
      src: src,
      document: {} as GLTF.IGLTF,
      body: {} as ArrayBuffer
    }

    setComponent(testEntity, GLTFComponent, { src: gltf.src, document: gltf.document, body: gltf.body })
    setComponent(testEntity, SourceComponent, Expected)
    setComponent(testEntity, UUIDComponent, uuid)

    const result = getGLTFOptions(testEntity).documentID
    expect(result).toBe(Expected)
  })

  it('should return an object that has `@param entity`.GLTFComponent.src in its .url field', () => {
    const uuid = UUIDComponent.generateUUID()
    const src = 'SomeSourcePath'
    const sourceID = `${uuid}-${src}` as SourceID
    const Expected = src
    const gltf = {
      src: src,
      document: {} as GLTF.IGLTF,
      body: {} as ArrayBuffer
    }

    setComponent(testEntity, GLTFComponent, { src: gltf.src, document: gltf.document, body: gltf.body })
    setComponent(testEntity, SourceComponent, sourceID)
    setComponent(testEntity, UUIDComponent, uuid)

    const result = getGLTFOptions(testEntity).url
    expect(result).toBe(Expected)
  })

  it('should return an object that has the result of calling LoaderUtils.extractUrlBase with `@param entity`.GLTFComponent.src as arguments in its .path field', () => {
    const uuid = UUIDComponent.generateUUID()
    const urlBase = 'http://some.domain.url/'
    const src = urlBase + 'SomeSourcePath'
    const sourceID = `${uuid}-${src}` as SourceID
    const Expected = urlBase
    const gltf = {
      src: src,
      document: {} as GLTF.IGLTF,
      body: {} as ArrayBuffer
    }

    setComponent(testEntity, GLTFComponent, { src: gltf.src, document: gltf.document, body: gltf.body })
    setComponent(testEntity, SourceComponent, sourceID)
    setComponent(testEntity, UUIDComponent, uuid)

    const result = getGLTFOptions(testEntity).path
    expect(result).toBe(Expected)
  })

  it('should return an object that has `@param entity`.GLTFComponent.body in its .body field', () => {
    const uuid = UUIDComponent.generateUUID()
    const urlBase = 'http://some.domain.url/'
    const src = urlBase + 'SomeSourcePath'
    const sourceID = `${uuid}-${src}` as SourceID
    const Expected = {} as ArrayBuffer
    const gltf = {
      src: src,
      document: {} as GLTF.IGLTF,
      body: Expected
    }

    setComponent(testEntity, GLTFComponent, { src: gltf.src, document: gltf.document, body: gltf.body })
    setComponent(testEntity, SourceComponent, sourceID)
    setComponent(testEntity, UUIDComponent, uuid)

    const result = getGLTFOptions(testEntity).body
    expect(result).toBe(Expected)
  })

  it('should return an object that has an empty object in its .requestHeader field', () => {
    const uuid = UUIDComponent.generateUUID()
    const urlBase = 'http://some.domain.url/'
    const src = urlBase + 'SomeSourcePath'
    const sourceID = `${uuid}-${src}` as SourceID
    const Expected = {}
    const gltf = {
      src: src,
      document: {} as GLTF.IGLTF,
      body: {} as ArrayBuffer
    }

    setComponent(testEntity, GLTFComponent, { src: gltf.src, document: gltf.document, body: gltf.body })
    setComponent(testEntity, SourceComponent, sourceID)
    setComponent(testEntity, UUIDComponent, uuid)

    const result = getGLTFOptions(testEntity).requestHeader
    expect(result).toEqual(Expected)
  })

  it('should return an object that has AssetLoaderState.manager in its .manager field', () => {
    const uuid = UUIDComponent.generateUUID()
    const urlBase = 'http://some.domain.url/'
    const src = urlBase + 'SomeSourcePath'
    const sourceID = `${uuid}-${src}` as SourceID
    const Expected = getState(AssetLoaderState).manager
    const gltf = {
      src: src,
      document: {} as GLTF.IGLTF,
      body: {} as ArrayBuffer
    }

    setComponent(testEntity, GLTFComponent, { src: gltf.src, document: gltf.document, body: gltf.body })
    setComponent(testEntity, SourceComponent, sourceID)
    setComponent(testEntity, UUIDComponent, uuid)

    const result = getGLTFOptions(testEntity).manager
    expect(result).toBe(Expected)
  })
}) //:: getGLTFOptions
