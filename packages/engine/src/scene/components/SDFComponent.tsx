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

import { DepthPass, ShaderPass } from 'postprocessing'
import React, { useEffect } from 'react'
import {
  Camera,
  Color,
  DepthTexture,
  NearestFilter,
  RGBAFormat,
  Scene,
  UnsignedIntType,
  Vector3,
  WebGLRenderTarget
} from 'three'

import { AnimationSystemGroup, defineSystem, ECSState, Entity } from '@ir-engine/ecs'
import { defineComponent, getComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { SDFShader } from '@ir-engine/spatial/src/renderer/effects/sdf/SDFShader'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { getState } from '@ir-engine/hyperflux'
import { useRendererEntity } from '@ir-engine/spatial/src/renderer/functions/useRendererEntity'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'

export enum SDFMode {
  TORUS,
  BOX,
  SPHERE,
  FOG
}

export const SDFComponent = defineComponent({
  name: 'SDFComponent',
  jsonID: 'EE_sdf',

  schema: S.Object({
    color: T.Color(0xffffff),
    scale: T.Vec3({ x: 0.25, y: 0.001, z: 0.25 }),
    enable: S.Bool(false),
    mode: S.Enum(SDFMode, SDFMode.TORUS)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const sdfComponent = useComponent(entity, SDFComponent)
    const rendererEntity = useRendererEntity(entity)

    useEffect(() => {
      const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
      const cameraPosition = cameraTransform.position
      const transformComponent = getComponent(entity, TransformComponent)
      const cameraComponent = getComponent(Engine.instance.cameraEntity, CameraComponent)

      SDFShader.shader.uniforms.cameraMatrix.value = cameraTransform.matrix
      SDFShader.shader.uniforms.fov.value = cameraComponent.fov
      SDFShader.shader.uniforms.aspectRatio.value = cameraComponent.aspect
      SDFShader.shader.uniforms.near.value = cameraComponent.near
      SDFShader.shader.uniforms.far.value = cameraComponent.far
      SDFShader.shader.uniforms.sdfMatrix.value = transformComponent.matrixWorld
      SDFShader.shader.uniforms.cameraPos.value = cameraPosition
    }, [])

    useEffect(() => {
      const color = new Color(sdfComponent.color.value)
      SDFShader.shader.uniforms.uColor.value = new Vector3(color.r, color.g, color.b)
    }, [sdfComponent.color])

    useEffect(() => {
      SDFShader.shader.uniforms.scale.value = sdfComponent.scale.value
    }, [sdfComponent.scale])

    useEffect(() => {
      SDFShader.shader.uniforms.mode.value = sdfComponent.mode.value
    }, [sdfComponent.mode])

    if (!rendererEntity) return null

    return <RendererReactor entity={entity} rendererEntity={rendererEntity} />
  }
})

export const SDFSystem = defineSystem({
  uuid: 'ir.engine.SDFSystem',
  insert: { after: AnimationSystemGroup },
  execute: () => {
    const delta = getState(ECSState).deltaSeconds
    SDFShader.shader.uniforms.uTime.value += delta * 0.1
  }
})

const RendererReactor = (props: { entity: Entity; rendererEntity: Entity }) => {
  const { entity, rendererEntity } = props
  const sdfComponent = useComponent(entity, SDFComponent)
  const rendererComponent = useComponent(rendererEntity, RendererComponent)

  useEffect(() => {
    if (!rendererEntity) return
    const composer = rendererComponent.effectComposer.value
    if (!composer) return

    const depthRenderTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight)
    depthRenderTarget.texture.minFilter = NearestFilter
    depthRenderTarget.texture.magFilter = NearestFilter
    depthRenderTarget.texture.generateMipmaps = false
    depthRenderTarget.stencilBuffer = false
    depthRenderTarget.depthBuffer = true
    depthRenderTarget.depthTexture = new DepthTexture(window.innerWidth, window.innerHeight)
    depthRenderTarget.texture.format = RGBAFormat
    depthRenderTarget.depthTexture.type = UnsignedIntType

    const depthPass = new DepthPass(new Scene(), new Camera(), {
      renderTarget: depthRenderTarget
    })

    composer.addPass(depthPass, 3) // hardcoded to 3, should add a registry instead later

    SDFShader.shader.uniforms.uDepth.value = depthRenderTarget.depthTexture
    const SDFPass = new ShaderPass(SDFShader.shader, 'inputBuffer')
    composer.addPass(SDFPass, 4)

    return () => {
      composer.removePass(depthPass)
      composer.removePass(SDFPass)
    }
  }, [sdfComponent.enable, rendererComponent.effectComposer])

  return null
}
