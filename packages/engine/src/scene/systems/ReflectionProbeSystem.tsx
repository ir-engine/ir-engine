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
  createEntity,
  defineSystem,
  getComponent,
  setComponent,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import { getState } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { setCallback } from '@etherealengine/spatial/src/common/CallbackComponent'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import { SceneComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { useEffect } from 'react'
import {
  CanvasTexture,
  EquirectangularReflectionMapping,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
  Texture,
  Uniform,
  Vector3,
  WebGLRenderer
} from 'three'
import { randFloat } from 'three/src/math/MathUtils'
import { EnvmapComponent } from '../components/EnvmapComponent'
import { ReflectionProbeComponent } from '../components/ReflectionProbeComponent'
import { UpdatableCallback, UpdatableComponent } from '../components/UpdatableComponent'
import { proxifyParentChildRelationships } from '../functions/loadGLTFModel'

let textureIndex = 0

export function createReflectionProbeRenderTarget(entity: Entity, probes: Entity[]): Texture {
  const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas') as HTMLCanvasElement
  canvas.style.display = 'block'
  const renderer = new WebGLRenderer({ canvas })
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
  ${probes.map((probe, index) => `uniform mat4 envMapTransform${index};`).join('\n')}
  uniform mat4 targetTransform;
  varying vec2 vUv;

  //uniform vec3 targetPosition;
  float EPSILON = 0.0;

    
  void main() {
    vec3 targetPosition = targetTransform[3].xyz; // Extract position component from targetMatrix
    vec3 color = vec3(0.0);
    float totalWeight = 0.0;
    float currentDistance = 0.0;
    float weight = 0.0;
    ${probes
      .map(
        (probe, index) => `
      vec3 envMapPosition${index} = envMapTransform${index}[3].xyz; // Extract position component from envMapTransforms
      currentDistance = length(targetPosition - envMapPosition${index}) + EPSILON;
      weight = 1.0 / currentDistance;
      totalWeight += weight;
      color += texture2D(envMap${index}, vUv).rgb * weight;
    `
      )
      .join('\n')}
    color /= totalWeight; // Normalize the accumulated color by the total weight
    gl_FragColor = vec4(color, 1.0);
  }
`

  const uniforms = {
    targetTransform: { value: getComponent(entity, TransformComponent).matrixWorld }
  } as Record<string, any>

  let index = 0
  for (let i = 0; i < probes.length; i++) {
    const probeComponent = getComponent(probes[i], ReflectionProbeComponent)
    const transformComponent = getComponent(probes[i], TransformComponent)
    if (!probeComponent.texture) continue
    uniforms[`envMap${index}`] = new Uniform(probeComponent.texture)
    uniforms[`envMapTransform${index}`] = { value: transformComponent.matrixWorld }
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

  setComponent(entity, UpdatableComponent)
  const result = new CanvasTexture(canvas)
  result.mapping = EquirectangularReflectionMapping
  result.wrapS = result.wrapT = RepeatWrapping
  result.colorSpace = SRGBColorSpace
  //result.generateMipmaps = false
  result.needsUpdate = true

  const testMat = new MeshBasicMaterial({ map: result })
  const testQuad = new Mesh(new PlaneGeometry(1, 1), testMat)

  const testEntity = createEntity()
  setComponent(testEntity, EntityTreeComponent, {
    parentEntity: getComponent(getState(EngineState).viewerEntity, SceneComponent).children[0]
  })
  setComponent(testEntity, TransformComponent, { position: new Vector3(0, randFloat(5, 15), 0) })

  setComponent(testEntity, MeshComponent, testQuad)
  addObjectToGroup(testEntity, testQuad)
  proxifyParentChildRelationships(testQuad)
  setComponent(testEntity, NameComponent, 'Test Entity')
  setComponent(testEntity, VisibleComponent, true)

  setCallback(entity, UpdatableCallback, () => {
    renderer.clear()
    renderer.render(scene, camera)
    result.needsUpdate = true
  })
  result.name = `ReflectionProbeTexture__${textureIndex++}`
  return result
}

const EnvmapReactor = (props: { probeQuery: Entity[] }) => {
  const entity = useEntityContext()
  const envmapComponent = useComponent(entity, EnvmapComponent)

  useEffect(() => {
    if (envmapComponent.type.value !== 'Probes') return
    const renderTexture = createReflectionProbeRenderTarget(entity, props.probeQuery)
    // envmapComponent.envmap.set(renderTexture)
  }, [props.probeQuery, envmapComponent.type])

  useEffect(() => {
    console.log('here')
  }, [envmapComponent.type])

  useEffect(() => {
    console.log('here')
  }, [props.probeQuery])

  return null
}

export const ReflectionProbeSystem = defineSystem({
  uuid: 'ir.engine.ReflectionProbeSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    return null
    // const reflectionProbeQuery = useQuery([ReflectionProbeComponent])
    // return (
    //   <QueryReactor
    //     Components={[EnvmapComponent]}
    //     ChildEntityReactor={EnvmapReactor}
    //     props={{ probeQuery: reflectionProbeQuery }}
    //   />
    // )
  }
})
