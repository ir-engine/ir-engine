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

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { assertVec } from '../../../../spatial/tests/util/assert'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../../../spatial/tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from '../../../../spatial/tests/webxr/emulator'

import {
  AnimationSystemGroup,
  createEngine,
  createEntity,
  defineQuery,
  destroyEngine,
  EntityContext,
  EntityTreeComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeEntity,
  setComponent,
  SystemDefinitions,
  SystemUUID,
  UndefinedEntity
} from '@ir-engine/ecs'
import { getMutableState, getState, none, ReactorRoot, startReactor } from '@ir-engine/hyperflux'
import {
  DirectionalLightComponent,
  MeshBVHSystem,
  ReferenceSpaceState,
  TransformComponent,
  TransformSystem
} from '@ir-engine/spatial'
import { Vector3_Back } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { destroySpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { RenderModes } from '@ir-engine/spatial/src/renderer/constants/RenderModes'
import { CSM } from '@ir-engine/spatial/src/renderer/csm/CSM'
import { getShadowsEnabled } from '@ir-engine/spatial/src/renderer/functions/RenderSettingsFunction'
import { XRLightProbeState } from '@ir-engine/spatial/src/xr/XRLightProbeSystem'
import { mockSpatialEngine } from '@ir-engine/spatial/tests/util/mockSpatialEngine'
import React from 'react'
import { BoxGeometry, Color, Material, Mesh, Quaternion, Raycaster, Vector2, Vector3 } from 'three'
import { getTextureAsync } from '../../assets/functions/resourceLoaderHooks'
import { DomainConfigState } from '../../assets/state/DomainConfigState'
import { NodeFunctions } from '../../gltf/NodeFunctions'
import { NodeID, NodeIDComponent, NodesBySourceState } from '../../gltf/NodeIDComponent'
import { DropShadowComponent } from '../components/DropShadowComponent'
import { RenderSettingsComponent } from '../components/RenderSettingsComponent'
import { ShadowComponent } from '../components/ShadowComponent'
import { SourceComponent, SourceID } from '../components/SourceComponent'
import {
  DropShadowSystem,
  ShadowSystem,
  ShadowSystemData,
  ShadowSystemFunctions,
  ShadowSystemReactors,
  ShadowSystemState
} from './ShadowSystem'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('ShadowSystemState', () => {
  describe('name', () => {
    it('should have the expected name', () => {
      const Expected = 'ee.engine.scene.ShadowSystemState'
      const result = ShadowSystemState.name
      expect(result).toBe(Expected)
    })
  }) //:: name

  describe('initial', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    /**
     * @todo
     * vi.mock is hoisted, and calling it (even inside a disabled test) affects EVERY OTHER TEST in this file, and cannot be reverted.
     * vi.mock should be the solution, but its sideeffects are file-wide.
     * Calling vi.mock again, and/or calling vi.clearAllMocks, does not work
     * vi.doMock sets the value of `isMobileXRHeadset` for this test, but not for the original import
     *
     * ? Solution: Make the variable an export from an object with readonly ?
     * */
    it.skip('should have an accumulationBudget of 4 when isMobileXRHeadset is truthy', async () => {
      const Expected = 4
      vi.doMock('@ir-engine/spatial/src/xr/XRState', async (importOriginal) => {
        const original = (await importOriginal()) as any
        return { ...original, isMobileXRHeadset: true }
      })
      const mobile = await import('@ir-engine/spatial/src/xr/XRState')
      const result = (await ShadowSystemState.initial()).priorityQueue.accumulationBudget
      expect(result).toEqual(Expected)
      vi.doUnmock('@ir-engine/spatial/src/xr/XRState')
    })

    it('should have an accumulationBudget of 20 when isMobileXRHeadset is falsy', async () => {
      const Expected = 20
      const result = (await ShadowSystemState.initial()).priorityQueue.accumulationBudget
      expect(result).toEqual(Expected)
    })
  }) //:: initial
}) //:: ShadowSystemState

describe('EntityChildCSMReactor', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    mockSpatialEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroySpatialEngine()
    destroyEngine()
  })

  describe('on change [shadowComponent.receive, csm]', () => {
    it('should not do anything (return early) if `@param props.rendererEntity`.RendererComponent.csm is falsy', () => {
      const resultSpy = vi.fn()
      const csm = new CSM({})
      csm.setupMaterial = resultSpy
      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: csm })
      getMutableComponent(rendererEntity, RendererComponent).csm.set(null)
      setComponent(testEntity, ShadowComponent)
      setComponent(testEntity, ObjectComponent, new Mesh(new BoxGeometry()))
      const Reactor = () => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ShadowSystemReactors.EntityChildCSMReactor, { rendererEntity: rendererEntity })
        )
      }

      const root = startReactor(Reactor) as ReactorRoot
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(resultSpy).not.toHaveBeenCalled()
    })

    it('should not do anything (return early) if entityContext.ShadowComponent.receive is falsy', () => {
      const resultSpy = vi.fn()
      const csm = new CSM({})
      csm.setupMaterial = resultSpy
      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: csm })
      setComponent(testEntity, ShadowComponent, { receive: false })
      setComponent(testEntity, ObjectComponent, new Mesh(new BoxGeometry()))
      const Reactor = () => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ShadowSystemReactors.EntityChildCSMReactor, { rendererEntity: rendererEntity })
        )
      }

      const root = startReactor(Reactor) as ReactorRoot
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(resultSpy).not.toHaveBeenCalled()
    })

    it('should not do anything (return early) if entityContext.ObjectComponent is falsy', () => {
      const resultSpy = vi.fn()
      const csm = new CSM({})
      csm.setupMaterial = resultSpy
      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: csm })
      setComponent(testEntity, ShadowComponent, { receive: false })
      setComponent(testEntity, ObjectComponent, new Mesh(new BoxGeometry()))
      getMutableComponent(testEntity, ObjectComponent).set(null as unknown as Mesh)
      const Reactor = () => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ShadowSystemReactors.EntityChildCSMReactor, { rendererEntity: rendererEntity })
        )
      }

      const root = startReactor(Reactor)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(resultSpy).not.toHaveBeenCalled()
    })

    it('should call `@param props.rendererEntity`.RendererComponent.csm.setupMaterial if entityContext.ObjectComponent.material is truthy', () => {
      const resultSpy = vi.fn()
      const csm = new CSM({})
      csm.setupMaterial = resultSpy
      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: csm })
      setComponent(testEntity, ShadowComponent)
      setComponent(testEntity, ObjectComponent, new Mesh(new BoxGeometry()))
      const Reactor = () => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ShadowSystemReactors.EntityChildCSMReactor, { rendererEntity: rendererEntity })
        )
      }

      const root = startReactor(Reactor)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(resultSpy).toHaveBeenCalledTimes(1)
    })

    describe('on cleanup ..', () => {
      it('.. should call `@param props.rendererEntity`.RendererComponent.csm.teardownMaterial if entityContext.ObjectComponent.material is truthy', () => {
        const resultSpy = vi.fn()
        const csm = new CSM({})
        csm.teardownMaterial = resultSpy
        const rendererEntity = createEntity()
        setComponent(rendererEntity, RendererComponent, { csm: csm })
        setComponent(testEntity, ShadowComponent)
        setComponent(testEntity, ObjectComponent, new Mesh(new BoxGeometry()))
        const Reactor = () => {
          return React.createElement(
            EntityContext.Provider,
            { value: testEntity },
            React.createElement(ShadowSystemReactors.EntityChildCSMReactor, { rendererEntity: rendererEntity })
          )
        }

        const root = startReactor(Reactor)
        root.stop()
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        expect(resultSpy).toHaveBeenCalledTimes(1)
      })
    })
  })
}) //:: EntityChildCSMReactor

describe('EntityCSMReactor', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    mockSpatialEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroySpatialEngine()
    destroyEngine()
  })

  describe('on change [directionalLight, directionalLightComponent?.castShadow.value]', () => {
    it('should not do anything (return early) if `@param props.entity`.DirectionalLightComponent.light is falsy', () => {
      const Initial = new CSM({})

      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: Initial })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: true })
      getMutableComponent(testEntity, DirectionalLightComponent).light.set(null as any)
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      const result = getComponent(rendererEntity, RendererComponent).csm
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).toBe(Initial)
    })

    it('should not do anything (return early) if `@param props.entity`.DirectionalLightComponent.castShadow is falsy', () => {
      const Initial = new CSM({})

      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: Initial })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: false })
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      const result = getComponent(rendererEntity, RendererComponent).csm
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).toBe(Initial)
    })

    it('should call `@param props.rendererEntity`.RendererComponent.csm.set with a newly created CSM instance', () => {
      const Initial = new CSM({})

      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: Initial })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: true })
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      const result = getComponent(rendererEntity, RendererComponent).csm
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).not.toBe(Initial)
    })

    it('should set `@param props.rendererEntity`.RendererComponent.csm.light to `@param props.entity`.DirectionalLightComponent.light', () => {
      const Initial = undefined

      const csm = new CSM({})
      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: csm })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: true, light: Initial })
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      const result = getComponent(rendererEntity, RendererComponent).csm?.sourceLight
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).not.toBe(Initial)
    })

    it('should set `@param props.rendererEntity`.RendererComponent.csm.shadowMapSize to RendererState.shadowMapResolution', () => {
      const Expected = getState(RendererState).shadowMapResolution
      const Initial = 42_000

      const csm = new CSM({ shadowMapSize: Initial })
      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: csm })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: true })
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      const result = getComponent(rendererEntity, RendererComponent).csm?.shadowMapSize
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should set `@param props.rendererEntity`.RendererComponent.csm.shadowBias to `@param props.entity`.DirectionalLightComponent.shadowBias', () => {
      const Expected = 42_000
      const Initial = 21_000

      const csm = new CSM({ shadowBias: Initial })
      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: csm })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: true, shadowBias: Expected })
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      const result = getComponent(rendererEntity, RendererComponent).csm?.shadowBias
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should set `@param props.rendererEntity`.RendererComponent.csm.maxFar to `@param props.entity`.DirectionalLightComponent.cameraFar', () => {
      const Expected = 42_000
      const Initial = 21_000

      const csm = new CSM({ maxFar: Initial })
      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: csm })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: true, cameraFar: Expected })
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      const result = getComponent(rendererEntity, RendererComponent).csm?.maxFar
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should set `@param props.rendererEntity`.RendererComponent.csm.lightIntensity to `@param props.entity`.DirectionalLightComponent.intensity', () => {
      const Expected = 42_000
      const Initial = 21_000

      const csm = new CSM({ lightIntensity: Initial })
      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: csm })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: true, intensity: Expected })
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      const result = getComponent(rendererEntity, RendererComponent).csm?.lightIntensity
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should set `@param props.rendererEntity`.RendererComponent.csm.lightColor to `@param props.entity`.DirectionalLightComponent.color', () => {
      const Expected = new Color(42_000)
      const Initial = 21_000

      const csm = new CSM({ lightColor: Initial })
      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: csm })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: true, color: Expected })
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      const result = getComponent(rendererEntity, RendererComponent).csm?.lightColor
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).not.toBe(Initial)
      expect(result).toEqual(Expected)
    })

    it('should set `@param props.rendererEntity`.RendererComponent.csm.cascades to `@param props.renderSettingsEntity`.RenderSettingsComponent.cascades', () => {
      const Expected = 4.2
      const Initial = 2.1

      const csm = new CSM({ cascades: Initial })
      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: csm })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent, { cascades: Expected })
      setComponent(testEntity, DirectionalLightComponent, { castShadow: true })
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      const result = getComponent(rendererEntity, RendererComponent).csm?.cascades
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).not.toBe(Initial)
      expect(result).toEqual(Expected)
    })

    describe('on cleanup ..', () => {
      it('.. should dispose of `@param props.rendererEntity`.RendererComponent.csm and set it to `null`', () => {
        const Expected = null
        const Initial = new CSM({})

        const rendererEntity = createEntity()
        setComponent(rendererEntity, RendererComponent, { csm: Initial })
        const renderSettingsEntity = createEntity()
        setComponent(renderSettingsEntity, RenderSettingsComponent)
        setComponent(testEntity, DirectionalLightComponent, { castShadow: true })
        const Reactor = () => {
          return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
            entity: testEntity,
            rendererEntity: rendererEntity,
            renderSettingsEntity: renderSettingsEntity
          })
        }

        const root = startReactor(Reactor)
        root.stop()
        const result = getComponent(rendererEntity, RendererComponent).csm
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        expect(result).not.toBe(Initial)
        expect(result).toEqual(Expected)
      })
    })
  })

  describe('after SceneObjectSystem ..', () => {
    it('should not do anything (return early) if `@param props.entity`.DirectionalLightComponent.light is falsy', () => {
      const Initial = undefined

      const rendererEntity = defineQuery([RendererComponent])()[0]
      setComponent(rendererEntity, RendererComponent, { csm: new CSM({}) })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: true })
      getMutableComponent(testEntity, DirectionalLightComponent).light.set(none)
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      const systems = SystemDefinitions.values().toArray()
      const system = systems[systems.length - 1]
      system.execute()
      const result = getComponent(testEntity, DirectionalLightComponent).light?.visible
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).toBe(Initial)
    })

    it('should not do anything (return early) if `@param props.entity`.DirectionalLightComponent.castShadow is falsy', () => {
      const Initial = true

      const rendererEntity = defineQuery([RendererComponent])()[0]
      setComponent(rendererEntity, RendererComponent, { csm: new CSM({}) })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: false })
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      const systems = SystemDefinitions.values().toArray()
      const system = systems[systems.length - 1]
      system.execute()
      const result = getComponent(testEntity, DirectionalLightComponent).light.visible
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).toBe(Initial)
    })

    it('should set `@param props.entity`.DirectionalLightComponent.light.visible to false', () => {
      const Expected = false

      const rendererEntity = defineQuery([RendererComponent])()[0]
      setComponent(rendererEntity, RendererComponent, { csm: new CSM({}) })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: true })

      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      const systems = SystemDefinitions.values().toArray()
      const system = systems[systems.length - 1]
      system.execute()
      const result = getComponent(testEntity, DirectionalLightComponent).light.visible
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).toBe(Expected)
    })
  })

  describe('on change [ rendererComponent.csm, shadowMapResolution, directionalLight, directionalLightComponent.shadowBias, directionalLightComponent.intensity, directionalLightComponent.color, directionalLightComponent.castShadow, directionalLightComponent.shadowRadius, directionalLightComponent.cameraFar ]', () => {
    it('should not do anything (return early) and not crash if `@param props.rendererEntity`.RendererComponent.csm is falsy', () => {
      const Initial = undefined

      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: undefined })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: true })
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      setComponent(rendererEntity, RendererComponent, { csm: undefined })
      root.run()
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      const result = getComponent(rendererEntity, RendererComponent).csm?.needsUpdate
      expect(result).toBe(Initial)
    })

    it('should not do anything (return early) if `@param props.entity`.DirectionalLightComponent.light is falsy', () => {
      const Initial = false

      const rendererEntity = createEntity()
      const csm = new CSM({})
      csm.needsUpdate = Initial
      setComponent(rendererEntity, RendererComponent, { csm: csm })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: true })
      getMutableComponent(testEntity, DirectionalLightComponent).light.set(null as any) // Coerce the light to be falsy
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      getMutableComponent(rendererEntity, RendererComponent).csm.merge({ needsUpdate: Initial })
      root.run()
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      const result = getComponent(rendererEntity, RendererComponent).csm?.needsUpdate
      expect(result).toBe(Initial)
    })

    it('should not do anything (return early) if `@param props.entity`.DirectionalLightComponent.castShadow is falsy', () => {
      const Initial = false

      const rendererEntity = createEntity()
      const csm = new CSM({})
      csm.needsUpdate = Initial
      setComponent(rendererEntity, RendererComponent, { csm: csm })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: false })
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      getMutableComponent(rendererEntity, RendererComponent).csm.merge({ needsUpdate: Initial })
      root.run()
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      const result = getComponent(rendererEntity, RendererComponent).csm?.needsUpdate
      expect(result).toBe(Initial)
    })

    it('should set `@param props.rendererEntity`.RendererComponent.csm.shadowBias to `@param props.entity`.DirectionalLightComponent.light.shadow.bias', () => {
      const Expected = 42_000
      const Initial = 21_000

      const csm = new CSM({ shadowBias: Initial })
      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: csm })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: true, shadowBias: Initial })
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      setComponent(testEntity, DirectionalLightComponent, { shadowBias: Expected })
      root.run()
      const result = getComponent(rendererEntity, RendererComponent).csm?.shadowBias
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should set `@param props.rendererEntity`.RendererComponent.csm.maxFar to `@param props.entity`.DirectionalLightComponent.cameraFar', () => {
      const Expected = 42_000
      const Initial = 21_000

      const csm = new CSM({ maxFar: Initial })
      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: csm })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: true, cameraFar: Initial })
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      setComponent(testEntity, DirectionalLightComponent, { cameraFar: Expected })
      root.run()
      const result = getComponent(rendererEntity, RendererComponent).csm?.maxFar
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should set `@param props.rendererEntity`.RendererComponent.csm.shadowMapSize to RendererState.shadowMapResolution', () => {
      const Expected = 42
      const Initial = 21_000

      getMutableState(RendererState).shadowMapResolution.set(Initial)
      const csm = new CSM({ shadowMapSize: Initial })
      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: csm })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: true })
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      getMutableState(RendererState).shadowMapResolution.set(Expected)
      root.run()
      const result = getComponent(rendererEntity, RendererComponent).csm?.shadowMapSize
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    describe('for every light in the `@param props.rendererEntity`.RendererComponent.csm.lights list ..', () => {
      it('.. should set light.color to a new color from `@param props.entity`.DirectionalLightComponent.color', () => {
        const Expected = 42
        const Initial = 21_000

        const csm = new CSM({ shadowMapSize: Initial })
        for (const light of csm.lights) light.color.setHex(Initial)
        const rendererEntity = createEntity()
        setComponent(rendererEntity, RendererComponent, { csm: csm })
        const renderSettingsEntity = createEntity()
        setComponent(renderSettingsEntity, RenderSettingsComponent)
        setComponent(testEntity, DirectionalLightComponent, { castShadow: true })
        const Reactor = () => {
          return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
            entity: testEntity,
            rendererEntity: rendererEntity,
            renderSettingsEntity: renderSettingsEntity
          })
        }

        const root = startReactor(Reactor)
        setComponent(testEntity, DirectionalLightComponent, { color: Expected })
        root.run()
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        for (const light of getComponent(rendererEntity, RendererComponent).csm!.lights!) {
          const result = light.color.getHex()
          expect(result).not.toBe(Initial)
          expect(result).toBe(Expected)
        }
      })

      it('.. should set light.intensity to `@param props.entity`.DirectionalLightComponent.intensity', () => {
        const Expected = 42
        const Initial = 21_000

        const csm = new CSM({ shadowMapSize: Initial })
        for (const light of csm.lights) light.intensity = Initial
        const rendererEntity = createEntity()
        setComponent(rendererEntity, RendererComponent, { csm: csm })
        const renderSettingsEntity = createEntity()
        setComponent(renderSettingsEntity, RenderSettingsComponent)
        setComponent(testEntity, DirectionalLightComponent, { castShadow: true })
        const Reactor = () => {
          return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
            entity: testEntity,
            rendererEntity: rendererEntity,
            renderSettingsEntity: renderSettingsEntity
          })
        }

        const root = startReactor(Reactor)
        setComponent(testEntity, DirectionalLightComponent, { intensity: Expected })
        root.run()
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        for (const light of getComponent(rendererEntity, RendererComponent).csm!.lights!) {
          const result = light.intensity
          expect(result).not.toBe(Initial)
          expect(result).toBe(Expected)
        }
      })

      it('.. should set all components of light.shadow.mapSize to RendererState.shadowMapResolution', () => {
        const Expected = 42
        const Initial = 21_000

        getMutableState(RendererState).shadowMapResolution.set(Initial)
        const csm = new CSM({ shadowMapSize: Initial })
        for (const light of csm.lights) light.shadow.mapSize.setScalar(Initial)
        const rendererEntity = createEntity()
        setComponent(rendererEntity, RendererComponent, { csm: csm })
        const renderSettingsEntity = createEntity()
        setComponent(renderSettingsEntity, RenderSettingsComponent)
        setComponent(testEntity, DirectionalLightComponent, { castShadow: true })
        const Reactor = () => {
          return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
            entity: testEntity,
            rendererEntity: rendererEntity,
            renderSettingsEntity: renderSettingsEntity
          })
        }

        const root = startReactor(Reactor)
        getMutableState(RendererState).shadowMapResolution.set(Expected)
        root.run()
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        for (const light of getComponent(rendererEntity, RendererComponent).csm!.lights!) {
          const result = light.shadow.mapSize
          expect(result).not.toEqual(new Vector2(Initial, Initial))
          expect(result).toEqual(new Vector2(Expected, Expected))
        }
      })

      it('.. should set light.shadow.radius to `@param props.entity`.DirectionalLightComponent.shadowRadius', () => {
        const Expected = 42
        const Initial = 21_000

        const csm = new CSM({ shadowMapSize: Initial })
        for (const light of csm.lights) light.shadow.radius = Initial
        const rendererEntity = createEntity()
        setComponent(rendererEntity, RendererComponent, { csm: csm })
        const renderSettingsEntity = createEntity()
        setComponent(renderSettingsEntity, RenderSettingsComponent)
        setComponent(testEntity, DirectionalLightComponent, { castShadow: true })
        const Reactor = () => {
          return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
            entity: testEntity,
            rendererEntity: rendererEntity,
            renderSettingsEntity: renderSettingsEntity
          })
        }

        const root = startReactor(Reactor)
        setComponent(testEntity, DirectionalLightComponent, { shadowRadius: Expected })
        root.run()
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        for (const light of getComponent(rendererEntity, RendererComponent).csm!.lights!) {
          const result = light.shadow.radius
          expect(result).not.toBe(Initial)
          expect(result).toBe(Expected)
        }
      })
    })

    it('should set `@param props.rendererEntity`.RendererComponent.csm.needsUpdate to true', () => {
      const Expected = true
      const Initial = !Expected

      const csm = new CSM({})
      csm.needsUpdate = Initial
      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: csm })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: true })
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      const result = getComponent(rendererEntity, RendererComponent).csm?.needsUpdate
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })
  })

  describe('on change [csm, renderSettingsComponent.cascades]', () => {
    it('should not do anything (return early) and not crash if `@param props.rendererEntity`.RendererComponent.csm is falsy', () => {
      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: undefined })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: true })
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
    })

    it('should set `@param props.rendererEntity`.RendererComponent.csm.cascades to `@param props.renderSettingsEntity`.RenderSettingsComponent.cascades', () => {
      const Expected = 42
      const Initial = 21

      const csm = new CSM({ cascades: Initial })
      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: csm })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: true })
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      setComponent(renderSettingsEntity, RenderSettingsComponent, { cascades: Expected })
      root.run()
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      const result = getComponent(rendererEntity, RendererComponent).csm?.cascades
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should set `@param props.rendererEntity`.RendererComponent.csm.needsUpdate to true', () => {
      const Expected = true
      const Initial = !Expected

      const csm = new CSM({})
      csm.needsUpdate = Initial
      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: csm })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: true })
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }

      const root = startReactor(Reactor)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      const result = getComponent(rendererEntity, RendererComponent).csm?.needsUpdate
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })
  })

  describe('on cleanup ..', () => {
    it('should call EntityChildCSMReactor for every entity with components [ShadowComponent, ObjectComponent] and `@param props.rendererEntity` as a props argument', () => {
      const csm = new CSM({})
      const rendererEntity = createEntity()
      setComponent(rendererEntity, RendererComponent, { csm: csm })
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      setComponent(testEntity, DirectionalLightComponent, { castShadow: true })
      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.EntityCSMReactor, {
          entity: testEntity,
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }
      const entities = [createEntity(), createEntity()]
      for (const entity of entities) {
        setComponent(entity, ShadowComponent)
        setComponent(entity, ObjectComponent, new Mesh(new BoxGeometry()))
      }
      const resultSpy = vi.spyOn(ShadowSystemReactors, 'EntityChildCSMReactor')

      const root = startReactor(Reactor)
      root.stop()
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(resultSpy).toHaveBeenCalledTimes(entities.length)
    })
  })
}) //:: EntityCSMReactor

describe('CSMReactor', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    mockSpatialEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroySpatialEngine()
    destroyEngine()
  })

  describe('on change [xrLightProbeEntity.value, renderSettingsComponent.primaryLight, primaryLightVisibleComponent]', () => {
    it(
      'should set `@param props.renderSettingsEntity`.RenderSettingsComponent.primaryLight to XRLightProbeState.directionalLightEntity' +
        'if `@param props.renderEntity` is ReferenceSpaceState.viewerEntity' +
        'and XRLightProbeState.directionalLightEntity is truthy',
      () => {
        const Expected = createEntity()

        const rendererEntity = defineQuery([RendererComponent])()[0]
        getMutableComponent(rendererEntity, RendererComponent).csm.set(new CSM({}))

        const directionalLightEntity = Expected
        setComponent(directionalLightEntity, DirectionalLightComponent)
        getMutableState(XRLightProbeState).directionalLightEntity.set(directionalLightEntity)

        const directionalLightNodeID = 'SomeNodeID' as NodeID
        setComponent(directionalLightEntity, NodeIDComponent, directionalLightNodeID)
        const nodeID = directionalLightNodeID // Readability alias to match the tested code

        const sourceID = 'SomeSourceID' as SourceID
        const renderSettingsEntity = createEntity()
        setComponent(renderSettingsEntity, SourceComponent, sourceID)
        setComponent(renderSettingsEntity, RenderSettingsComponent, { primaryLight: directionalLightNodeID })

        const nodes = { [nodeID]: directionalLightEntity }
        getMutableState(NodesBySourceState)[sourceID].set(nodes)

        const Reactor = () => {
          return React.createElement(ShadowSystemReactors.CSMReactor, {
            rendererEntity: rendererEntity,
            renderSettingsEntity: renderSettingsEntity
          })
        }

        const root = startReactor(Reactor)
        const result = NodeFunctions.getEntityFromNodeID(
          renderSettingsEntity,
          getComponent(renderSettingsEntity, RenderSettingsComponent).primaryLight
        )
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        expect(result).toBe(Expected)
      }
    )
  })

  describe('on cleanup', () => {
    it('should not call EntityCSMReactor if renderSettingsComponent.csm is falsy', () => {
      const rendererEntity = defineQuery([RendererComponent])()[0]
      getMutableComponent(rendererEntity, RendererComponent).csm.set(new CSM({}))

      const directionalLightEntity = createEntity()
      setComponent(directionalLightEntity, DirectionalLightComponent)
      getMutableState(XRLightProbeState).directionalLightEntity.set(directionalLightEntity)

      const directionalLightNodeID = 'SomeNodeID' as NodeID
      setComponent(directionalLightEntity, NodeIDComponent, directionalLightNodeID)

      const sourceID = 'SomeSourceID' as SourceID
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, SourceComponent, sourceID)
      setComponent(renderSettingsEntity, RenderSettingsComponent, { primaryLight: directionalLightNodeID })
      getMutableComponent(renderSettingsEntity, RenderSettingsComponent).csm.set(none)
      const nodes = { [directionalLightNodeID]: directionalLightEntity }
      getMutableState(NodesBySourceState)[sourceID].set(nodes)

      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.CSMReactor, {
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }
      const resultSpy = vi.spyOn(ShadowSystemReactors, 'EntityCSMReactor')

      const root = startReactor(Reactor)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(resultSpy).not.toHaveBeenCalled()
    })

    it('should not call EntityCSMReactor if activeLightEntity is falsy', () => {
      const rendererEntity = defineQuery([RendererComponent])()[0]
      getMutableComponent(rendererEntity, RendererComponent).csm.set(new CSM({}))

      const directionalLightEntity = createEntity()
      setComponent(directionalLightEntity, DirectionalLightComponent)
      getMutableState(XRLightProbeState).directionalLightEntity.set(directionalLightEntity)

      const directionalLightNodeID = 'SomeNodeID' as NodeID
      setComponent(directionalLightEntity, NodeIDComponent, directionalLightNodeID)

      const sourceID = 'SomeSourceID' as SourceID
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, SourceComponent, sourceID)
      setComponent(renderSettingsEntity, RenderSettingsComponent, { primaryLight: directionalLightNodeID })
      const nodes = { [directionalLightNodeID]: UndefinedEntity }
      getMutableState(NodesBySourceState)[sourceID].set(nodes)

      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.CSMReactor, {
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }
      const resultSpy = vi.spyOn(ShadowSystemReactors, 'EntityCSMReactor')

      const root = startReactor(Reactor)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(resultSpy).not.toHaveBeenCalled()
    })

    it('should not call EntityCSMReactor if directionalLight is falsy', () => {
      const rendererEntity = defineQuery([RendererComponent])()[0]
      getMutableComponent(rendererEntity, RendererComponent).csm.set(new CSM({}))

      const directionalLightEntity = createEntity()
      getMutableState(XRLightProbeState).directionalLightEntity.set(directionalLightEntity)

      const directionalLightNodeID = 'SomeNodeID' as NodeID
      setComponent(directionalLightEntity, NodeIDComponent, directionalLightNodeID)

      const sourceID = 'SomeSourceID' as SourceID
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, SourceComponent, sourceID)
      setComponent(renderSettingsEntity, RenderSettingsComponent, { primaryLight: directionalLightNodeID })
      const nodes = { [directionalLightNodeID]: directionalLightEntity }
      getMutableState(NodesBySourceState)[sourceID].set(nodes)

      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.CSMReactor, {
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }
      const resultSpy = vi.spyOn(ShadowSystemReactors, 'EntityCSMReactor')

      const root = startReactor(Reactor)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(resultSpy).not.toHaveBeenCalled()
    })

    it('should call EntityCSMReactor with (key,entity,rendererEntity,renderSettingsEntity) if renderSettingsComponent.csm, activeLightEntity and directionalLight are all truthy', () => {
      const rendererEntity = defineQuery([RendererComponent])()[0]
      getMutableComponent(rendererEntity, RendererComponent).csm.set(new CSM({}))

      const directionalLightEntity = createEntity()
      setComponent(directionalLightEntity, DirectionalLightComponent)
      getMutableState(XRLightProbeState).directionalLightEntity.set(directionalLightEntity)

      const directionalLightNodeID = 'SomeNodeID' as NodeID
      setComponent(directionalLightEntity, NodeIDComponent, directionalLightNodeID)

      const sourceID = 'SomeSourceID' as SourceID
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, SourceComponent, sourceID)
      setComponent(renderSettingsEntity, RenderSettingsComponent, { primaryLight: directionalLightNodeID })
      const nodes = { [directionalLightNodeID]: directionalLightEntity }
      getMutableState(NodesBySourceState)[sourceID].set(nodes)

      const Reactor = () => {
        return React.createElement(ShadowSystemReactors.CSMReactor, {
          rendererEntity: rendererEntity,
          renderSettingsEntity: renderSettingsEntity
        })
      }
      const resultSpy = vi.spyOn(ShadowSystemReactors, 'EntityCSMReactor')

      const root = startReactor(Reactor)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(resultSpy).toHaveBeenCalled()
    })
  })
}) //:: CSMReactor

describe('RenderSettingsQueryReactor', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    mockSpatialEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroySpatialEngine()
    destroyEngine()
  })

  it('should not call CSMReactor (return null) if RendererEntity is falsy', () => {
    const rendererEntity = UndefinedEntity
    const renderSettingsEntity = createEntity()
    setComponent(renderSettingsEntity, RenderSettingsComponent)
    const Reactor = () => {
      return React.createElement(ShadowSystemReactors.RenderSettingsQueryReactor, {
        rendererEntity: rendererEntity,
        renderSettingsEntity: renderSettingsEntity
      })
    }
    const resultSpy = vi.spyOn(ShadowSystemReactors, 'CSMReactor')

    const root = startReactor(Reactor)
    expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
    expect(resultSpy).not.toHaveBeenCalled()
  })

  it('should not call CSMReactor (return null) if RendererEntity is not ReferenceSpaceState.viewerEntity', () => {
    const rendererEntity = createEntity()
    const csm = new CSM({})
    setComponent(rendererEntity, RendererComponent, { csm: csm })
    expect(hasComponent(rendererEntity, RendererComponent)).toBeTruthy()
    expect(getComponent(rendererEntity, RendererComponent).csm).toBeTruthy()
    const renderSettingsEntity = createEntity()
    setComponent(renderSettingsEntity, RenderSettingsComponent)
    const Reactor = () => {
      return React.createElement(ShadowSystemReactors.RenderSettingsQueryReactor, {
        rendererEntity: rendererEntity,
        renderSettingsEntity: renderSettingsEntity
      })
    }
    const resultSpy = vi.spyOn(ShadowSystemReactors, 'CSMReactor')

    const root = startReactor(Reactor)
    expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
    expect(resultSpy).not.toHaveBeenCalled()
  })

  it('should not call CSMReactor (return null) if RendererState.renderMode is RenderModes.UNLIT', () => {
    const rendererEntity = createEntity()
    const csm = new CSM({})
    setComponent(rendererEntity, RendererComponent, { csm: csm })
    expect(hasComponent(rendererEntity, RendererComponent)).toBeTruthy()
    expect(getComponent(rendererEntity, RendererComponent).csm).toBeTruthy()
    const renderSettingsEntity = createEntity()
    setComponent(renderSettingsEntity, RenderSettingsComponent)
    const Reactor = () => {
      return React.createElement(ShadowSystemReactors.RenderSettingsQueryReactor, {
        rendererEntity: rendererEntity,
        renderSettingsEntity: renderSettingsEntity
      })
    }
    getMutableState(ReferenceSpaceState).viewerEntity.set(rendererEntity)
    getMutableState(RendererState).renderMode.set(RenderModes.UNLIT)
    const resultSpy = vi.spyOn(ShadowSystemReactors, 'CSMReactor')

    const root = startReactor(Reactor)
    expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
    expect(resultSpy).not.toHaveBeenCalled()
  })

  it('should not call CSMReactor (return null) if RendererState.renderMode is RenderModes.LIT', () => {
    const rendererEntity = createEntity()
    const csm = new CSM({})
    setComponent(rendererEntity, RendererComponent, { csm: csm })
    expect(hasComponent(rendererEntity, RendererComponent)).toBeTruthy()
    expect(getComponent(rendererEntity, RendererComponent).csm).toBeTruthy()
    const renderSettingsEntity = createEntity()
    setComponent(renderSettingsEntity, RenderSettingsComponent)
    const Reactor = () => {
      return React.createElement(ShadowSystemReactors.RenderSettingsQueryReactor, {
        rendererEntity: rendererEntity,
        renderSettingsEntity: renderSettingsEntity
      })
    }
    getMutableState(ReferenceSpaceState).viewerEntity.set(rendererEntity)
    getMutableState(RendererState).renderMode.set(RenderModes.LIT)
    const resultSpy = vi.spyOn(ShadowSystemReactors, 'CSMReactor')

    const root = startReactor(Reactor)
    expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
    expect(resultSpy).not.toHaveBeenCalled()
  })

  it('should call CSMReactor with rendererEntity and renderSettingsEntity otherwise', () => {
    const rendererEntity = defineQuery([RendererComponent])()[0]
    getMutableComponent(rendererEntity, RendererComponent).csm.set(new CSM({}))

    setComponent(testEntity, RenderSettingsComponent)
    setComponent(testEntity, EntityTreeComponent, { parentEntity: rendererEntity }) // Connect them for useRendererEntity

    const Reactor = () => {
      return React.createElement(
        EntityContext.Provider,
        { value: testEntity },
        React.createElement(ShadowSystemReactors.RenderSettingsQueryReactor)
      )
    }
    getMutableState(ReferenceSpaceState).viewerEntity.set(rendererEntity)
    const resultSpy = vi.spyOn(ShadowSystemReactors, 'CSMReactor')

    const root = startReactor(Reactor)
    expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
    expect(resultSpy).toHaveBeenCalled()
  })
}) //:: RenderSettingsQueryReactor

/** @todo Drop Shadows do not currently work */
describe('DropShadowReactor', () => {}) //:: DropShadowReactor

describe('RendererShadowReactor', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    mockSpatialEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroySpatialEngine()
    destroyEngine()
  })

  describe('on change [useShadows, rendererComponent.renderer]', () => {
    it('should not do anything (return early) and not crash if RendererComponent.renderer is falsy', () => {
      const Initial = undefined

      setComponent(testEntity, RendererComponent)
      getMutableComponent(testEntity, RendererComponent).renderer.set(null)
      const Reactor = () => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ShadowSystemReactors.RendererShadowReactor)
        )
      }

      const root = startReactor(Reactor)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      const result = getComponent(testEntity, RendererComponent).renderer?.shadowMap.enabled
      expect(result).toBe(Initial)
    })

    it('should set entityContext.RendererComponent.shadowMap.enabled to the value of (use/get)ShadowsEnabled', () => {
      const Expected = getShadowsEnabled()
      const Initial = !Expected

      setComponent(testEntity, RendererComponent)
      getMutableComponent(testEntity, RendererComponent).renderer.merge({ shadowMap: { enabled: Initial } } as any)
      const Reactor = () => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ShadowSystemReactors.RendererShadowReactor)
        )
      }

      const root = startReactor(Reactor)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      const result = getComponent(testEntity, RendererComponent).renderer?.shadowMap.enabled
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should set entityContext.RendererComponent.shadowMap.autoUpdate to the value of (use/get)ShadowsEnabled', () => {
      const Expected = getShadowsEnabled()
      const Initial = !Expected

      setComponent(testEntity, RendererComponent)
      getMutableComponent(testEntity, RendererComponent).renderer.merge({ shadowMap: { autoUpdate: Initial } } as any)
      const Reactor = () => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ShadowSystemReactors.RendererShadowReactor)
        )
      }

      const root = startReactor(Reactor)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      const result = getComponent(testEntity, RendererComponent).renderer?.shadowMap.autoUpdate
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })
  })
}) //:: RendererShadowReactor

describe('ShadowSystem', () => {
  const System = SystemDefinitions.get(ShadowSystem)!

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      expect(System.uuid).toBe('ee.engine.ShadowSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(ShadowSystem).toBe('ee.engine.ShadowSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.with).not.toBe(undefined)
      expect(System.insert!.with!).toBe(AnimationSystemGroup)
    })
  }) //:: Fields

  describe('execute', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEngine()
    })

    it('should not do anything if the result of getShadowsEnabled is falsy', () => {
      const resultSpy = vi.fn()
      setComponent(testEntity, RendererComponent)
      const csm = { update: resultSpy as any } as CSM
      getMutableComponent(testEntity, RendererComponent).csm.set(csm)
      getMutableState(RendererState).useShadows.set(false)

      System.execute()
      expect(resultSpy).not.toHaveBeenCalled()
    })

    describe('for every entity that has a RendererComponent', () => {
      it('should call entity.RendererComponent.csm.update if entity.RendererComponent.csm is truthy', () => {
        const resultSpy = vi.fn()
        setComponent(testEntity, RendererComponent)
        const csm = { update: resultSpy as any } as CSM
        getMutableComponent(testEntity, RendererComponent).csm.set(csm)

        System.execute()
        expect(resultSpy).toHaveBeenCalled()
        expect(resultSpy).toHaveBeenCalledTimes(1)
      })

      it('should not call entity.RendererComponent.csm.update if entity.RendererComponent.csm is falsy', () => {
        /* @note Just for test coverage %
         * Can't test that the function wasn't called if csm is falsy,
         * because assigning the function makes csm truthy.
         * */
        const resultSpy = vi.fn()
        setComponent(testEntity, RendererComponent)
        const csm = null
        getMutableComponent(testEntity, RendererComponent).csm.set(csm)
        System.execute()
        expect(resultSpy).not.toHaveBeenCalled()
      })
    })
  }) //:: execute

  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      destroyEngine()
    })

    describe('when shadowTexture changes ..', () => {
      /** @note Can't change the shadowTexture path to be falsy without modifying the file itself. */
      it.skip('.. should not do anything (return) if shadowTexture is falsy', async () => {
        const Initial = 42

        const previous = ShadowSystemData._shadowMaterial.version
        getMutableState(DomainConfigState).cloudDomain.set('InvalidDomain')
        const textureURL = `${
          getState(DomainConfigState).cloudDomain
        }/projects/ir-engine/default-project/assets/drop-shadow.png`
        ShadowSystemData._shadowMaterial.version = Initial
        const rendererEntity = defineQuery([RendererComponent])()[0]
        const Reactor = () => {
          return React.createElement(
            EntityContext.Provider,
            { value: rendererEntity },
            React.createElement(System.reactor!)
          )
        }

        const root = startReactor(Reactor)
        const result = ShadowSystemData._shadowMaterial.version
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        expect(result).toBe(Initial)

        ShadowSystemData._shadowMaterial.version = previous
      })

      it('.. should set _shadowMaterial.map to shadowTexture', async () => {
        const textureURL = `${
          getState(DomainConfigState).cloudDomain
        }/projects/ir-engine/default-project/assets/drop-shadow.png`
        const Expected = (await getTextureAsync(textureURL))[0]
        const Initial = ShadowSystemData._shadowMaterial.map

        const previous = Initial
        const rendererEntity = defineQuery([RendererComponent])()[0]
        const Reactor = () => {
          return React.createElement(
            EntityContext.Provider,
            { value: rendererEntity },
            React.createElement(System.reactor!)
          )
        }

        const root = startReactor(Reactor)
        const result = ShadowSystemData._shadowMaterial.map

        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        expect(result).not.toBe(Initial)
        expect(result?.source.uuid).toEqual(Expected?.source.uuid)

        ShadowSystemData._shadowMaterial.map = previous
      })

      it('.. should call the _shadowMaterial.needsUpdate setter with true to update its .version field', () => {
        const Expected = 42
        const Initial = Expected - 1

        const previous = ShadowSystemData._shadowMaterial.version
        ShadowSystemData._shadowMaterial.version = Initial
        const rendererEntity = defineQuery([RendererComponent])()[0]
        const Reactor = () => {
          return React.createElement(
            EntityContext.Provider,
            { value: rendererEntity },
            React.createElement(System.reactor!)
          )
        }

        const root = startReactor(Reactor)
        const result = ShadowSystemData._shadowMaterial.version
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)

        ShadowSystemData._shadowMaterial.version = previous
      })
    })

    it('should call RenderSettingsQueryReactor once for every entity that has a RenderSettingsComponent when useShadowsEnabled is truthy', async () => {
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      const rendererEntity = defineQuery([RendererComponent])()[0]
      const entities = defineQuery([RenderSettingsComponent])()
      const Reactor = () => {
        return React.createElement(
          EntityContext.Provider,
          { value: rendererEntity },
          React.createElement(System.reactor!)
        )
      }
      const resultSpy = vi.spyOn(ShadowSystemReactors, 'RenderSettingsQueryReactor')

      const root = startReactor(Reactor)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(resultSpy).toHaveBeenCalledTimes(entities.length * 2)
    })

    it('should call DropShadowReactor once for every entity that has the components [VisibleComponent, ShadowComponent] when useShadowsEnabled is falsy and shadowTexture is truthy', async () => {
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      const rendererEntity = defineQuery([RendererComponent])()[0]
      setComponent(testEntity, VisibleComponent)
      setComponent(testEntity, ShadowComponent)
      const entities = defineQuery([VisibleComponent, ShadowComponent])()
      getMutableState(RendererState).useShadows.set(false)
      const Reactor = () => {
        return React.createElement(
          EntityContext.Provider,
          { value: rendererEntity },
          React.createElement(System.reactor!)
        )
      }
      const resultSpy = vi.spyOn(ShadowSystemReactors, 'DropShadowReactor')

      const root = startReactor(Reactor)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(resultSpy).toHaveBeenCalledTimes(entities.length * 3)
    })

    it('should call RendererShadowReactor once for every entity that has a RendererComponent', async () => {
      const renderSettingsEntity = createEntity()
      setComponent(renderSettingsEntity, RenderSettingsComponent)
      const rendererEntity = defineQuery([RendererComponent])()[0]
      const entities = defineQuery([RendererComponent])()
      const Reactor = () => {
        return React.createElement(
          EntityContext.Provider,
          { value: rendererEntity },
          React.createElement(System.reactor!)
        )
      }
      const resultSpy = vi.spyOn(ShadowSystemReactors, 'RendererShadowReactor')

      const root = startReactor(Reactor)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(resultSpy).toHaveBeenCalledTimes(entities.length)
    })
  }) //:: reactor
}) //:: ShadowSystem

describe('DropShadowSystem', () => {
  const System = SystemDefinitions.get(DropShadowSystem)!

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      expect(System.uuid).toBe('ee.engine.DropShadowSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(DropShadowSystem).toBe('ee.engine.DropShadowSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.after).not.toBe(undefined)
      expect(System.insert!.after!).toBe(TransformSystem)
    })
  }) //:: Fields

  describe('execute', () => {
    beforeEach(async () => {
      createEngine()
    })

    afterEach(() => {
      destroyEngine()
    })

    it('should call ShadowSystemFunctions.updateDropShadowTransforms when the result of getShadowsEnabled is falsy', () => {
      const resultSpy = vi.spyOn(ShadowSystemFunctions, 'updateDropShadowTransforms')
      getMutableState(RendererState).useShadows.set(false)
      System.execute()
      expect(resultSpy).toHaveBeenCalled()
      expect(resultSpy).toHaveBeenCalledTimes(1)
    })

    it('should not call ShadowSystemFunctions.updateDropShadowTransforms when the result of getShadowsEnabled is truthy', () => {
      const resultSpy = vi.spyOn(ShadowSystemFunctions, 'updateDropShadowTransforms')
      System.execute()
      expect(resultSpy).not.toHaveBeenCalled()
    })
  }) //:: execute
}) //:: DropShadowSystem

describe('ShadowSystemFunctions', () => {
  describe('updateDropShadowTransforms', () => {
    let testEntity = UndefinedEntity
    beforeEach(() => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEngine()
    })

    describe('for every entity in the ShadowSystemState.priorityEntities list ..', () => {
      let material = undefined as Material | undefined
      let sceneEntity = UndefinedEntity
      let priorityEntity = UndefinedEntity
      let dropShadowEntity = UndefinedEntity
      const center = new Vector3()

      beforeEach(() => {
        const sceneEntityPosition = new Vector3(0, 42, 0)
        sceneEntity = createEntity() // shadowIntersectionEntity : Intersect against
        setComponent(sceneEntity, MeshComponent, new Mesh(new BoxGeometry()))
        setComponent(sceneEntity, VisibleComponent)
        setComponent(sceneEntity, TransformComponent, { position: sceneEntityPosition })

        priorityEntity = createEntity() // shadowCasterEntity
        setComponent(priorityEntity, VisibleComponent)
        setComponent(priorityEntity, TransformComponent)
        setComponent(priorityEntity, DropShadowComponent, { entity: createEntity(), center: center })

        dropShadowEntity = getComponent(priorityEntity, DropShadowComponent).entity
        setComponent(dropShadowEntity, VisibleComponent)
        setComponent(dropShadowEntity, TransformComponent)
        material = new Material()
        setComponent(dropShadowEntity, ObjectComponent, new Mesh(new BoxGeometry(), material))
      })

      afterEach(() => {
        material = undefined
        center.set(0, 0, 0)
        removeEntity(sceneEntity)
        removeEntity(priorityEntity)
        removeEntity(dropShadowEntity)
        sceneEntity = UndefinedEntity
        priorityEntity = UndefinedEntity
        dropShadowEntity = UndefinedEntity
      })

      describe('.. when there is no intersection or intersection.face between the scene objects and a ray casted from entity.DropShadowComponent.entity.TransformComponent.position.world ...', () => {
        it('... should set entity.DropShadowComponent.entity.TransformComponent.scale to (0,0,0)', () => {
          const Expected = new Vector3(0, 0, 0)
          const Initial = new Vector3(5, 6, 7)

          setComponent(dropShadowEntity, TransformComponent, { scale: Initial })
          const rayDir = ShadowSystemData.shadowDirection.clone()
          const rayPos = TransformComponent.getWorldPosition(priorityEntity, new Vector3()).add(center)
          const raycaster = new Raycaster(rayPos, rayDir)
          const sceneObjects = [getComponent(sceneEntity, MeshComponent)]
          const intersected = raycaster.intersectObjects(sceneObjects, false)[0]

          ShadowSystemFunctions.updateDropShadowTransforms()
          const result = getComponent(dropShadowEntity, TransformComponent).scale

          assertVec.anyApproxNotEq(result, Initial, 3, 0.01)
          assertVec.approxEq(result, Expected, 3, 0.01)
        })
      })

      describe('.. when there is an intersection and intersection.face between the scene objects and a ray casted from entity.DropShadowComponent.entity.TransformComponent.position.world ...', () => {
        let material = undefined as Material | undefined
        let sceneEntity = UndefinedEntity
        let priorityEntity = UndefinedEntity
        let dropShadowEntity = UndefinedEntity
        const center = new Vector3()

        beforeEach(() => {
          const sceneEntityPosition = new Vector3(0, -1.5, 0)
          sceneEntity = createEntity() // shadowIntersectionEntity : Intersect against
          setComponent(sceneEntity, MeshComponent, new Mesh(new BoxGeometry()))
          setComponent(sceneEntity, VisibleComponent)
          setComponent(sceneEntity, TransformComponent, { position: sceneEntityPosition })

          priorityEntity = createEntity() // shadowCasterEntity
          setComponent(priorityEntity, VisibleComponent)
          setComponent(priorityEntity, TransformComponent)
          setComponent(priorityEntity, DropShadowComponent, { entity: createEntity(), center: center })

          dropShadowEntity = getComponent(priorityEntity, DropShadowComponent).entity
          setComponent(dropShadowEntity, VisibleComponent)
          setComponent(dropShadowEntity, TransformComponent)
          material = new Material()
          setComponent(dropShadowEntity, ObjectComponent, new Mesh(new BoxGeometry(), material))
        })

        afterEach(() => {
          material = undefined
          center.set(0, 0, 0)
          removeEntity(sceneEntity)
          removeEntity(priorityEntity)
          removeEntity(dropShadowEntity)
          sceneEntity = UndefinedEntity
          priorityEntity = UndefinedEntity
          dropShadowEntity = UndefinedEntity
        })

        it('... should set entity.DropShadowComponent.entity.ObjectComponent.material.opacity to the expected value', async () => {
          const Expected = 0.6
          const Initial = 42_000

          material!.opacity = Initial
          startReactor(SystemDefinitions.get(MeshBVHSystem)!.reactor!)
          await vi.waitUntil(() => getComponent(sceneEntity, MeshComponent).geometry.boundsTree, { timeout: 10000 })

          ShadowSystemFunctions.updateDropShadowTransforms()

          const result = ((getComponent(dropShadowEntity, ObjectComponent) as Mesh).material as Material).opacity
          expect(result).not.toBe(Initial)
          expect(result).toBe(Expected)
        })

        it('... should set entity.DropShadowComponent.entity.TransformComponent.rotation to the expected value', async () => {
          const Expected = new Quaternion(1, 2, 3, 4).normalize()
          const Initial = new Quaternion(5, 6, 7, 8).normalize()

          const rayDir = ShadowSystemData.shadowDirection.clone()
          const rayPos = TransformComponent.getWorldPosition(priorityEntity, new Vector3()).add(center)
          const raycaster = new Raycaster(rayPos, rayDir)
          const sceneObjects = [getComponent(sceneEntity, MeshComponent)]
          startReactor(SystemDefinitions.get(MeshBVHSystem)!.reactor!)
          await vi.waitUntil(() => getComponent(sceneEntity, MeshComponent).geometry.boundsTree, { timeout: 10_000 })
          const intersected = raycaster.intersectObjects(sceneObjects, false)[0]
          Expected.setFromUnitVectors(intersected.face?.normal as any, Vector3_Back)
          setComponent(dropShadowEntity, TransformComponent, { rotation: Initial })

          ShadowSystemFunctions.updateDropShadowTransforms()

          const result = getComponent(dropShadowEntity, TransformComponent).rotation
          assertVec.anyApproxNotEq(result, Initial, 4, 0.01)
          assertVec.approxEq(result, Expected, 4, 0.01)
        })

        it('... should set entity.DropShadowComponent.entity.TransformComponent.scale to the expected value', async () => {
          const Expected = new Vector3(0, 0, 0)
          const Initial = new Vector3(5, 6, 7)

          setComponent(dropShadowEntity, TransformComponent, { scale: Initial })
          startReactor(SystemDefinitions.get(MeshBVHSystem)!.reactor!)
          await vi.waitUntil(() => getComponent(sceneEntity, MeshComponent).geometry.boundsTree, { timeout: 10_000 })
          ShadowSystemFunctions.updateDropShadowTransforms()

          const result = getComponent(dropShadowEntity, TransformComponent).scale
          assertVec.anyApproxNotEq(result, Initial, 3, 0.01)
          assertVec.approxEq(result, Expected, 3, 0.01)
        })

        it('... should set entity.DropShadowComponent.entity.TransformComponent.position to the expected value', async () => {
          const Expected = new Vector3(0, -0.99, 0)
          const Initial = new Vector3(5, 6, 7)

          setComponent(dropShadowEntity, TransformComponent, { position: Initial })
          startReactor(SystemDefinitions.get(MeshBVHSystem)!.reactor!)
          await vi.waitUntil(() => getComponent(sceneEntity, MeshComponent).geometry.boundsTree, { timeout: 10_000 })
          ShadowSystemFunctions.updateDropShadowTransforms()

          const result = getComponent(dropShadowEntity, TransformComponent).position
          assertVec.anyApproxNotEq(result, Initial, 3, 0.01)
          assertVec.approxEq(result, Expected, 3, 0.01)
        })
      })
    })
  }) //:: updateDropShadowTransforms
}) //:: ShadowSystemFunctions
