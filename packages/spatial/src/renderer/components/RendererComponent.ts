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

import { defineComponent, Entity, getComponent, hasComponent, S, useComponent, useEntityContext } from '@ir-engine/ecs'
import { getState, NO_PROXY, none, State, useMutableState } from '@ir-engine/hyperflux'
import { Effect, EffectComposer, EffectPass, NormalPass, OutlineEffect, Pass, RenderPass } from 'postprocessing'
import { useEffect } from 'react'
import { ArrayCamera, Scene, SRGBColorSpace, WebGLRenderer, WebGLRendererParameters } from 'three'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { createWebXRManager, WebXRManager } from '../../xr/WebXRManager'
import { ObjectLayers } from '../constants/ObjectLayers'
import CSMHelper from '../csm/CSMHelper'
import { HighlightState } from '../HighlightState'
import { RendererState } from '../RendererState'

export const EffectSchema = S.Union([S.Any(), S.Type<Effect>(undefined, { isActive: S.Bool() })])
type PassCount = {
  pass: Pass
  count: number
}
export const RendererComponent = defineComponent({
  name: 'RendererComponent',

  schema: S.Object(
    {
      /** Is resize needed? */
      needsResize: S.Bool({ default: false }),

      renderPass: S.Type<RenderPass | null>(),
      normalPass: S.Type<NormalPass | null>(),
      passes: S.Record(S.String(), S.Type<Pass>()),
      passesFakeMap: S.Record(S.String(), S.Type<PassCount>()),

      renderContext: S.Type<WebGLRenderingContext | null | WebGL2RenderingContext>(),
      effects: S.Record(S.String(), EffectSchema),
      effectInstances: S.Record(S.String(), S.Type<Effect>()),

      canvas: S.Type<HTMLCanvasElement | null>(),

      renderer: S.Type<WebGLRenderer | null>(),
      effectComposer: S.Type<EffectComposer | null>(),

      scenes: S.Array(S.Entity()),
      scene: S.Class(() => new Scene()),

      /** @todo deprecate and replace with engine implementation */
      xrManager: S.Type<WebXRManager | null>(),
      webGLLostContext: S.Type<WEBGL_lose_context | null>(),

      csmHelper: S.Type<CSMHelper | null>()
    },
    { serialized: false }
  ),

  onInit(initial) {
    initial.scene.matrixAutoUpdate = false
    initial.scene.matrixWorldAutoUpdate = false
    initial.scene.layers.set(ObjectLayers.Scene)
    return initial
  },

  //TODO finish hashing this out
  /**
   * Returns whether a postprocessing render pass is already registered (uses reference counting)
   * @param entity
   * @param passType
   */
  passExists<T extends Pass>(entity: Entity, passType: new (...args: any[]) => T): boolean {
    //return class name as string from constructor implicit name
    const key = passType.name

    const rendererComponent = getComponent(entity, RendererComponent)
    const count = rendererComponent.passesFakeMap[key] ? rendererComponent.passesFakeMap[key].count : 0
    return count > 0
  },

  getPass<T extends Pass>(entity: Entity, passType: new (...args: any[]) => T): T {
    //return class name as string from constructor implicit name
    const key = passType.name

    const rendererComponent = getComponent(entity, RendererComponent)
    return rendererComponent.passesFakeMap[key].pass as T
  },

  /**
   * Registers a postprocessing render pass, and either creates a new instance or increments the reference count of the existing one.
   * @param rendererEntity entity of the RendererComponent
   * @param passType The type of pass to be registered, uses this as a unique key
   * @param passFunction A function that returns a new instance of the pass (for custom initialization needs)
   * @returns The pass instance
   */
  registerPass<T extends Pass>(
    rendererEntity: Entity,
    passType: new (...args: any[]) => T,
    passFunction: (rendererEntity: Entity) => Pass
  ): T {
    //return class name as string from constructor implicit name
    const key = passType.name

    const rendererComponent = getComponent(rendererEntity, RendererComponent)
    if (rendererComponent.passesFakeMap[key]) {
      const count = rendererComponent.passesFakeMap[key].count
      const existingPass = rendererComponent.passesFakeMap[key].pass
      rendererComponent.passesFakeMap[key] = { pass: existingPass, count: count + 1 }
    } else {
      const generatedPass = passFunction(rendererEntity)
      rendererComponent.passesFakeMap[key] = { pass: generatedPass, count: 1 }
    }
    return rendererComponent.passesFakeMap[key].pass as T
  },

  /**
   * Unregisters a postprocessing render pass, and either decrements the reference count or removes the pass entirely.
   * @param entity entity of the RendererComponent
   * @param passType The type of pass to be unregistered, uses this as a unique key
   */
  unregisterPass<T extends Pass>(entity: Entity, passType: new (...args: any[]) => T) {
    //return class name as string from constructor implicit name
    const key = passType.name

    const rendererComponent = getComponent(entity, RendererComponent)
    const count = rendererComponent.passesFakeMap[key].count
    if (count > 1) {
      rendererComponent.passesFakeMap[key].count = count - 1
    } else {
      const effectComposerState = rendererComponent.effectComposer as EffectComposer
      const pass = RendererComponent.getPass(entity, passType)
      effectComposerState.removePass(pass)
      rendererComponent.passesFakeMap[key] = none
      delete rendererComponent.passesFakeMap[key]
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const rendererComponent = useComponent(entity, RendererComponent)
    const camera = useComponent(entity, CameraComponent).value as ArrayCamera
    const hightlightState = useMutableState(HighlightState)
    const renderSettings = useMutableState(RendererState)
    const effectComposerState = rendererComponent.effectComposer as State<EffectComposer>

    useEffect(() => {
      const canvas = rendererComponent.canvas.value as HTMLCanvasElement
      const context = canvas.getContext('webgl2')

      rendererComponent.renderContext.set(context)
    }, [])

    useEffect(() => {
      const context = rendererComponent.renderContext.get(NO_PROXY) as WebGLRenderingContext | WebGL2RenderingContext
      if (!context) return

      const canvas = rendererComponent.canvas.get(NO_PROXY) as HTMLCanvasElement

      const options: WebGLRendererParameters = {
        precision: 'highp',
        powerPreference: 'high-performance',
        stencil: false,
        antialias: false,
        depth: true,
        logarithmicDepthBuffer: false,
        canvas,
        context,
        preserveDrawingBuffer: false,
        //@ts-ignore
        multiviewStereo: true
      }

      const renderer = new WebGLRenderer(options)
      rendererComponent.renderer.set(renderer)
      renderer.outputColorSpace = SRGBColorSpace

      const composer = new EffectComposer(renderer)
      rendererComponent.effectComposer.set(composer)
      const renderPass = new RenderPass()
      composer.addPass(renderPass)
      rendererComponent.renderPass.set(renderPass)

      // DISABLE THIS IF YOU ARE SEEING SHADER MISBEHAVING - UNCHECK THIS WHEN TESTING UPDATING THREEJS
      renderer.debug.checkShaderErrors = false //isDev

      const xrManager = createWebXRManager(renderer)
      renderer.xr = xrManager as any
      rendererComponent.merge({ xrManager })
      xrManager.cameraAutoUpdate = false
      xrManager.enabled = true

      const onResize = () => {
        rendererComponent.needsResize.set(true)
      }

      // https://stackoverflow.com/questions/48124372/pointermove-event-not-working-with-touch-why-not
      canvas.style.touchAction = 'none'
      canvas.addEventListener('resize', onResize, false)
      window.addEventListener('resize', onResize, false)

      renderer.autoClear = true

      /**
       * This can be tested with document.getElementById('engine-renderer-canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext();
       */
      rendererComponent.webGLLostContext.set(context.getExtension('WEBGL_lose_context'))

      if (!rendererComponent.webGLLostContext.value) {
        console.warn('Browser does not support `WEBGL_lose_context` extension')
      }

      const handleWebGLContextLost = (e) => {
        console.log('Browser lost the context.', e, rendererComponent.webGLLostContext.value)
        e.preventDefault()
        rendererComponent.needsResize.set(false)
        setTimeout(() => {
          rendererComponent.webGLLostContext.get(NO_PROXY)!.restoreContext()
        }, 1)
      }

      /** @todo this seems unnecessary, since threejs recovers internally */
      // const handleWebGLContextRestore = (e) => {
      //   const canvas = rendererComponent.canvas.value as HTMLCanvasElement
      //   canvas.removeEventListener('webglcontextlost', handleWebGLContextLost)
      //   canvas.removeEventListener('webglcontextrestored', handleWebGLContextRestore)
      //   const context = rendererComponent.supportWebGL2.value
      //     ? canvas.getContext('webgl2')!
      //     : canvas.getContext('webgl')!
      //   rendererComponent.renderContext.set(context)
      //   rendererComponent.needsResize.set(true)
      //   console.log("Browser's context is restored.", e)
      // }

      canvas.addEventListener('webglcontextlost', handleWebGLContextLost)

      return () => {
        canvas.removeEventListener('resize', onResize, false)
        window.removeEventListener('resize', onResize, false)

        canvas.removeEventListener('webglcontextlost', handleWebGLContextLost)
        // canvas.removeEventListener('webglcontextrestored', handleWebGLContextRestore)

        renderer.dispose()
        composer.dispose()
      }
    }, [rendererComponent.renderContext.value])

    useEffect(() => {
      if (!rendererComponent.effectComposer.value) return

      const scene = rendererComponent.scene.value as Scene

      const outlineEffect = new OutlineEffect(scene, camera, getState(HighlightState))
      rendererComponent.effectInstances.OutlineEffect.set(outlineEffect)

      return () => {
        if (!hasComponent(entity, RendererComponent)) return
        outlineEffect.dispose()
        rendererComponent.effectInstances.OutlineEffect.set(none)
      }
    }, [!!rendererComponent.effectComposer.value, hightlightState])

    useEffect(() => {
      const effectComposer = effectComposerState.get(NO_PROXY)
      if (!effectComposer) return

      const effectsVal = rendererComponent.effects.get(NO_PROXY) as Record<string, Effect>

      const enabled = renderSettings.usePostProcessing.get(NO_PROXY) as boolean

      const effectArray = enabled ? Object.values(effectsVal) : []
      if (rendererComponent.effectInstances.OutlineEffect.get(NO_PROXY))
        effectArray.unshift(rendererComponent.effectInstances.OutlineEffect.get(NO_PROXY) as OutlineEffect)

      const effectPass = new EffectPass(camera, ...effectArray)
      effectComposerState.EffectPass.set(effectPass)

      if (enabled) {
        effectComposerState.merge(effectsVal)
      }

      try {
        if (rendererComponent.passesFakeMap.value) {
          for (const pass of Object.values(rendererComponent.passesFakeMap.value as Record<string, PassCount>)) {
            effectComposer.addPass(pass.pass)
          }
        }
        effectComposer.addPass(effectPass)
      } catch (e) {
        console.warn(e) /** @todo Implement user messaging Ex: (Can not use multiple convolution effects) */
      }

      effectComposer.setRenderer(rendererComponent.renderer.value as WebGLRenderer)

      return () => {
        if (!hasComponent(entity, RendererComponent)) return
        if (enabled) {
          for (const effect in effectsVal) {
            effectsVal[effect].dispose()
            effectComposerState[effect].set(none)
          }
        }
        effectComposer.EffectPass.dispose()
        effectComposer.removePass(effectPass)
        if (rendererComponent.passesFakeMap.value) {
          for (const pass of Object.values(rendererComponent.passesFakeMap.value as Record<string, PassCount>)) {
            effectComposer.removePass(pass.pass)
          }
        }
      }
    }, [
      rendererComponent.effects,
      rendererComponent.effectComposer.value,
      rendererComponent?.effectInstances?.OutlineEffect.value,
      renderSettings.usePostProcessing.value
    ])

    return null
  }
})

// Add the postprocessing module declarations
declare module 'postprocessing' {
  interface EffectComposer {
    EffectPass: EffectPass
    OutlineEffect: OutlineEffect
  }
  interface Effect {
    isActive: boolean
  }
}
