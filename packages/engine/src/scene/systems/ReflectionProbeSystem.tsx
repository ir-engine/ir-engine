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
  Entity,
  PresentationSystemGroup,
  QueryReactor,
  defineSystem,
  getComponent,
  setComponent,
  useComponent,
  useEntityContext,
  useQuery
} from '@etherealengine/ecs'
import { TransformComponent } from '@etherealengine/spatial'
import { setCallback } from '@etherealengine/spatial/src/common/CallbackComponent'
import React, { useEffect } from 'react'
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  Uniform,
  Vector3,
  WebGLRenderTarget,
  WebGLRenderer
} from 'three'
import { EnvmapComponent } from '../components/EnvmapComponent'
import { ReflectionProbeComponent } from '../components/ReflectionProbeComponent'
import { UpdatableCallback, UpdatableComponent } from '../components/UpdatableComponent'

export function createReflectionProbeRenderTarget(entity: Entity, probes: Entity[]): Texture {
  const renderer = new WebGLRenderer()
  const scene = new Scene()
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
  camera.position.z = 1

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const fragmentShader = `
    ${probes.map((probe, index) => `uniform sampler2D envMap${index};`).join('\n')}
    ${probes.map((probe, index) => `uniform vec3 envMapPosition${index};`).join('\n')}
    uniform vec3 targetPosition;
    varying vec2 vUv;
    void main() {
      vec3 color = vec3(0.0);
      float totalDistance = 0.0;
      ${probes
        .map(
          (probe, index) => `
        float distance = distance(targetPosition, envMapPosition${index});
        totalDistance += distance;
        color += texture2D(envMap${index}, vUv).rgb * distance;
        `
        )
        .join('\n')}
      gl_FragColor = vec4(color / totalDistance, 1.0);
    }
    `
  const uniforms = {
    targetPosition: new Uniform(TransformComponent.getWorldPosition(entity, new Vector3()))
  } as Record<string, Uniform>

  let index = 0
  for (let i = 0; i < probes.length; i++) {
    const probeComponent = getComponent(probes[i], ReflectionProbeComponent)
    if (!probeComponent.texture) continue
    uniforms[`envMap${index}`] = new Uniform(probeComponent.texture)
    uniforms[`envMapPosition${index}`] = new Uniform(TransformComponent.getWorldPosition(probes[i], new Vector3()))
    index++
  }

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms
  })

  const quad = new Mesh(new PlaneGeometry(2, 2), material)
  scene.add(quad)

  renderer.setSize(256, 256)
  const renderTarget = new WebGLRenderTarget(256, 256)
  renderer.setRenderTarget(renderTarget)

  setCallback(entity, UpdatableCallback, () => {
    renderer.render(scene, camera)
  })
  setComponent(entity, UpdatableComponent)

  return renderTarget.texture
}

const EnvmapReactor = (props: { probeQuery: Entity[] }) => {
  const entity = useEntityContext()
  const envmapComponent = useComponent(entity, EnvmapComponent)

  useEffect(() => {
    if (envmapComponent.type.value !== 'Probes') return
    const renderTexture = createReflectionProbeRenderTarget(entity, props.probeQuery)
    envmapComponent.envmap.set(renderTexture)
  }, [props.probeQuery, envmapComponent.type])

  return null
}

export const ReflectionProbeSystem = defineSystem({
  uuid: 'ir.engine.ReflectionProbeSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    const reflectionProbeQuery = useQuery([ReflectionProbeComponent])
    return (
      <QueryReactor
        Components={[EnvmapComponent]}
        ChildEntityReactor={EnvmapReactor}
        props={{ probeQuery: reflectionProbeQuery }}
      />
    )
  }
})
