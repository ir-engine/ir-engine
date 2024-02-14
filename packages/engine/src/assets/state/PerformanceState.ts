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

import { profile } from '@etherealengine/ecs/src/Timer'
import { defineState, getMutableState } from '@etherealengine/hyperflux'
import { isMobile } from '@etherealengine/spatial/src/common/functions/isMobile'
import { EngineRenderer } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { getGPUTier } from 'detect-gpu'
import {
  AddEquation,
  BufferAttribute,
  BufferGeometry,
  Color,
  CustomBlending,
  DataTexture,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  SrcAlphaFactor
} from 'three'

export const PerformanceState = defineState({
  name: 'PerformanceState',
  initial: () => ({
    tier: 0,
    budgets: {
      maxTextureSize: 0,
      max3DTextureSize: 0,
      maxRenderBufferSize: 0,
      maxIndices: 0,
      maxVerticies: 0
    },
    render: {
      meshRenderMs: 0,
      textureRenderMs: 0,
      alphaRenderMs: 0
    }
  })
})

const checkRender = (renderer: EngineRenderer, scene: Scene, onFinished: (ms: number) => void) => {
  const frustumSize = 500
  const aspect = window.innerWidth / window.innerHeight
  const camera = new OrthographicCamera(
    (frustumSize * aspect) / -2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    1,
    1000
  )
  camera.position.set(-200, 200, 200)
  scene.background = new Color(0xf0f0f0)
  scene.add(camera)

  let renderTime = 0
  const fallback = () => {
    const end = profile()
    renderer.renderer.render(scene, camera)
    renderTime = end()
    onFinished(renderTime)
  }

  if (renderer.supportWebGL2) {
    const gl = renderer.renderContext as WebGL2RenderingContext
    const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2')

    // Not super well supported, no Safari support
    if (ext) {
      const startQuery = gl.createQuery()
      const endQuery = gl.createQuery()

      if (startQuery && endQuery) {
        ext.queryCounterEXT(startQuery, ext.TIMESTAMP_EXT)
        renderer.renderer.render(scene, camera)
        ext.queryCounterEXT(endQuery, ext.TIMESTAMP_EXT)

        requestAnimationFrame(function poll() {
          const available = gl.getQueryParameter(endQuery!, gl.QUERY_RESULT_AVAILABLE)
          const disjoint = gl.getParameter(ext.GPU_DISJOINT_EXT)

          if (available && !disjoint) {
            // Gets times in nanoseconds
            const timeStart = gl.getQueryParameter(startQuery!, gl.QUERY_RESULT)
            const timeEnd = gl.getQueryParameter(endQuery!, gl.QUERY_RESULT)
            const renderTime = (timeEnd - timeStart) * 0.000001
            onFinished(renderTime)
          } else if (disjoint) fallback()

          if (available || disjoint) {
            gl.deleteQuery(startQuery)
            gl.deleteQuery(endQuery)
          } else {
            requestAnimationFrame(poll)
          }
        })
      } else fallback()
    } else fallback()
  } else fallback()

  scene.remove(camera)
}

const createTriangle = (): Mesh => {
  const vertices = new Float32Array([
    -1.0,
    -1.0,
    1.0, // vertex 1
    1.0,
    -1.0,
    1.0, // vertex 2
    1.0,
    1.0,
    1.0 // vertex 3
  ])

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(vertices, 3))
  const material = new MeshBasicMaterial({ color: 'white' })
  return new Mesh(geometry, material)
}

const triangleCount = isMobile ? 1250 : 5000
const checkMeshRender = (renderer: EngineRenderer, onFinished: () => void) => {
  const profilerState = getMutableState(PerformanceState)
  const scene = new Scene()
  const meshes = [] as Mesh[]
  for (let i = 0; i < triangleCount; i++) {
    const mesh = createTriangle()
    meshes.push(mesh)
    scene.add(mesh)
  }

  checkRender(renderer, scene, (renderTime) => {
    profilerState.render.meshRenderMs.set(renderTime)

    for (const mesh of meshes) {
      mesh.geometry.dispose()
      ;(mesh.material as MeshBasicMaterial).dispose()
      scene.remove(mesh)
    }

    onFinished()
  })
}

const size = isMobile ? 1024 : 4096
const createPlane = (r = 255, g = 255, b = 255, a = 1): Mesh => {
  const data = new Uint8Array(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    const stride = i * 4

    data[stride] = r
    data[stride + 1] = g
    data[stride + 2] = b
    data[stride + 3] = a
  }
  const dataTexture = new DataTexture(data, size, size)
  const geometry = new PlaneGeometry(1000, 1000)
  const material = new MeshBasicMaterial({ map: dataTexture })
  dataTexture.needsUpdate = true
  return new Mesh(geometry, material)
}

const chechTextureRender = (renderer: EngineRenderer, onFinished: () => void) => {
  const profilerState = getMutableState(PerformanceState)
  const scene = new Scene()

  const mesh = createPlane()
  scene.add(mesh)

  checkRender(renderer, scene, (renderTime) => {
    profilerState.render.textureRenderMs.set(renderTime)

    mesh.geometry.dispose()
    ;(mesh.material as MeshBasicMaterial).dispose()
    scene.remove(mesh)

    onFinished()
  })
}

const chechAlphaRender = (renderer: EngineRenderer, onFinished: () => void) => {
  const profilerState = getMutableState(PerformanceState)
  const scene = new Scene()

  const mesh = createPlane(0, 0, 255, 0.5)
  const alphaMesh = createPlane(255, 0, 0, 0.5)
  const material = alphaMesh.material as MeshBasicMaterial
  material.transparent = true
  material.blending = CustomBlending
  material.blendSrc = SrcAlphaFactor
  material.blendDst = SrcAlphaFactor
  material.blendEquation = AddEquation
  material.needsUpdate = true

  scene.add(mesh)
  scene.add(alphaMesh)

  checkRender(renderer, scene, (renderTime) => {
    profilerState.render.alphaRenderMs.set(renderTime)

    mesh.geometry.dispose()
    ;(mesh.material as MeshBasicMaterial).dispose()
    scene.remove(mesh)
    alphaMesh.geometry.dispose()
    ;(alphaMesh.material as MeshBasicMaterial).dispose()
    scene.remove(alphaMesh)

    onFinished()
  })
}

export const buildPerformanceState = async (renderer: EngineRenderer, onFinished: () => void) => {
  const performance = getMutableState(PerformanceState)
  const gpuTier = await getGPUTier()

  performance.tier.set(gpuTier.tier)

  const gl = renderer.renderContext as WebGL2RenderingContext
  performance.budgets.set({
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    max3DTextureSize: gl.getParameter(gl.MAX_3D_TEXTURE_SIZE),
    maxRenderBufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
    maxIndices: gl.getParameter(gl.MAX_ELEMENTS_INDICES),
    maxVerticies: gl.getParameter(gl.MAX_ELEMENTS_VERTICES)
  })

  onFinished()

  // TODO runtime performance checking
  // checkMeshRender(renderer, () => {
  //   chechTextureRender(renderer, () => {
  //     chechAlphaRender(renderer, () => {
  //       console.log(JSON.stringify(profilerState.value))
  //       onFinished()
  //     })
  //   })
  // })
}
