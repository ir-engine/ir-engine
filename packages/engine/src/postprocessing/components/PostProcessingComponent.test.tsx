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

import assert from 'assert'
import { LinearSRGBColorSpace, MathUtils, Vector2, Vector3 } from 'three'

import {
  Entity,
  EntityUUID,
  UUIDComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  setComponent,
  useOptionalComponent
} from '@etherealengine/ecs'
import { destroyEngine } from '@etherealengine/ecs/src/Engine'
import { createEntity, removeEntity } from '@etherealengine/ecs/src/EntityFunctions'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { createEngine } from '@etherealengine/spatial/src/initializeEngine'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { SceneComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { act, render } from '@testing-library/react'
import {
  BlendFunction,
  EdgeDetectionMode,
  EffectComposer,
  KernelSize,
  PredicationMode,
  SMAAPreset,
  ToneMappingMode,
  VignetteTechnique
} from 'postprocessing'
import React, { useEffect } from 'react'
import { Effects, defaultPostProcessingSchema } from '../PostProcessing'
import { PostProcessingComponent } from './PostProcessingComponent'

describe('PostProcessingComponent', () => {
  let rootEntity: Entity
  let entity: Entity

  const mockCanvas = () => {
    return {
      getDrawingBufferSize: () => 0
    } as any as HTMLCanvasElement
  }

  beforeEach(() => {
    createEngine()

    rootEntity = createEntity()
    setComponent(rootEntity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, CameraComponent)
    setComponent(rootEntity, SceneComponent)
    setComponent(rootEntity, RendererComponent, { canvas: mockCanvas() })

    entity = createEntity()
    setComponent(entity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
    setComponent(entity, PostProcessingComponent)
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Create default post processing component', () => {
    entity = createEntity()
    setComponent(entity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
    setComponent(entity, PostProcessingComponent)
    const postProcessingComponent = getComponent(entity, PostProcessingComponent)
    assert(postProcessingComponent.effects == defaultPostProcessingSchema, 'post processing matches default parameters')
  })

  it('Test Effect Composure', async () => {
    const effectKey = Effects.BloomEffect
    const entity = createEntity()
    setComponent(entity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
    setComponent(entity, EntityTreeComponent)

    //retain ref to original add Pass
    const originalAddPass = EffectComposer.prototype.addPass

    //override addpass to test data without dependency on Browser
    let addPassCount = 0
    EffectComposer.prototype.addPass = () => {
      addPassCount++
    }

    //set data to test
    setComponent(rootEntity, SceneComponent, { children: [entity] })

    //force nested reactors to run
    const { rerender, unmount } = render(<></>)

    setComponent(entity, PostProcessingComponent)
    const postProcessingComponent = getMutableComponent(entity, PostProcessingComponent)

    await act(() => rerender(<></>))

    //test that the effect composer is setup
    assert(getComponent(rootEntity, RendererComponent).effectComposer, 'effect composer is setup')

    //test that the effect pass has the the effect set
    // @ts-ignore
    const effects = getComponent(rootEntity, RendererComponent).effectComposer.EffectPass.effects
    assert(effects.find((el) => el.name == effectKey))

    EffectComposer.prototype.addPass = originalAddPass

    unmount()
  })

  it('Test Effects', (done) => {
    const entity = createEntity()
    setComponent(entity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
    setComponent(entity, EntityTreeComponent)

    const effectKeys = Object.keys(Effects)
    const masterProps = {
      isActive: true,
      preset: SMAAPreset.HIGH,
      edgeDetectionMode: EdgeDetectionMode.DEPTH,
      predicationMode: PredicationMode.DEPTH,
      blendFunction: BlendFunction.INVERT,
      distanceScaling: false,
      depthAwareUpsampling: false,
      normalDepthBuffer: undefined,
      samples: 18,
      rings: 14,
      distanceThreshold: 1.94,
      distanceFalloff: 0.06,
      rangeThreshold: 0.001,
      rangeFalloff: 0.002,
      minRadiusScale: 0.2,
      luminanceInfluence: 1.4,
      bias: 0.5,
      radius: 0.5,
      intensity: 2.0,
      fade: 0.02,
      color: undefined,
      resolutionScale: 2.0,
      resolutionX: 100,
      resolutionY: 100,
      width: 100,
      height: 100,
      distance: 5,
      thickness: 5,
      denoiseIterations: 2,
      denoiseKernel: 1,
      denoiseDiffuse: 5,
      denoiseSpecular: 5,
      phi: 1.0,
      lumaPhi: 10,
      depthPhi: 4,
      normalPhi: 25,
      roughnessPhi: 25,
      specularPhi: 25,
      envBlur: 1.0,
      importanceSampling: false,
      steps: 40,
      refineSteps: 10,
      missedRays: true,
      focusDistance: 1.0,
      focalLength: new Vector2(2, 2),
      focusRange: 0.2,
      bokehScale: 2.0,
      kernelSize: KernelSize.SMALL,
      luminanceThreshold: 1.8,
      luminanceSmoothing: 0.5,
      mipmapBlur: true,
      levels: 10,
      adaptive: true,
      mode: ToneMappingMode.OPTIMIZED_CINEON,
      resolution: 1.5,
      maxLuminance: 8.0,
      whitePoint: 8.0,
      middleGrey: 1.2,
      minLuminance: 1.05,
      averageLuminance: 2.0,
      adaptationRate: 2.0,
      brightness: 1.1,
      contrast: 1.1,
      hue: 1,
      saturation: 1.1,
      bits: 32,
      blend: 1.6,
      constantBlend: false,
      dilation: false,
      blockySampling: true,
      logTransform: true,
      depthDistance: 20,
      worldDistance: 10,
      neighborhoodClamping: false,
      offset: new Vector2(1, 1),
      radialModulation: true,
      modulationOffset: 0.3,
      jitter: 2,
      angle: Math.PI * 1.0,
      scale: 2.0,
      rotation: 1.0,
      focusArea: 0.8,
      feather: 0.6,
      chromaticAberrationOffset: new Vector2(1, 1),
      delay: new Vector2(3.0, 7.0),
      duration: new Vector2(1.2, 2.0),
      strength: new Vector2(0.6, 2.0),
      perturbationMap: undefined,
      dtSize: 32,
      columns: 0.1,
      ratio: 0.95,
      lineWidth: 1.0,
      lutPath: undefined,
      tetrahedralInterpolation: true,
      inputColorSpace: LinearSRGBColorSpace,
      premultiply: true,
      granularity: 15,
      density: 2.5,
      scrollSpeed: 0.1,
      position: new Vector3(1, 1, 1),
      speed: 4.0,
      maxRadius: 2.0,
      waveSize: 0.4,
      amplitude: 0.1,
      texturePath: undefined,
      aspectCorrection: true,
      technique: VignetteTechnique.ESKIL,
      eskil: true,
      darkness: 1,
      distortion: new Vector2(1, 1),
      principalPoint: new Vector2(1, 1),
      skew: 1
    }
    const masterKeys = Object.keys(masterProps)

    const Reactor = () => {
      const postProcessingComponent = useOptionalComponent(entity, PostProcessingComponent)
      useEffect(() => {
        setComponent(entity, PostProcessingComponent)
      }, [])

      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    act(async () => {
      assert(hasComponent(entity, PostProcessingComponent))

      const postProcessingComponent = getMutableComponent(entity, PostProcessingComponent)

      effectKeys.forEach((effectKey) => {
        if (postProcessingComponent.effects[effectKey]) {
          const propKeys = Object.keys(postProcessingComponent.effects[effectKey])
          propKeys.forEach((propKey) => {
            if (masterKeys.includes(propKey)) {
              postProcessingComponent.effects[effectKey][propKey].set(masterProps[propKey])
            }
          })
        }
      })

      rerender(<Reactor />)
    }).then(() => {
      const postProcessingComponent = getComponent(entity, PostProcessingComponent)

      effectKeys.forEach((effectKey) => {
        if (postProcessingComponent.effects[effectKey]) {
          const propKeys = Object.keys(postProcessingComponent.effects[effectKey])
          propKeys.forEach((propKey) => {
            if (masterKeys.includes(propKey)) {
              console.log('Key = ' + effectKey + ' - ' + propKey + ' = ' + masterProps[propKey])
              assert(
                postProcessingComponent.effects[effectKey][propKey] == masterProps[propKey],
                effectKey + ' - ' + propKey + 'was set'
              )
            }
          })
        }
      })

      removeEntity(entity)
      unmount()
      done()
    })
  })
})
