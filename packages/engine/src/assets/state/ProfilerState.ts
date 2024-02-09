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
import { BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial, OrthographicCamera, Scene } from 'three'

export const ProfilerState = defineState({
  name: 'ProfilerState',
  initial: () => ({
    meshRenderMs: 0
  })
})

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

const triangleCount = isMobile ? 5000 : 10000

export const buildProfilerState = (renderer: EngineRenderer, onFinished: () => void) => {
  const scene = new Scene()
  const meshes = [] as Mesh[]
  for (let i = 0; i < triangleCount; i++) {
    const mesh = createTriangle()
    meshes.push(mesh)
    scene.add(mesh)
  }

  const profilerState = getMutableState(ProfilerState)

  const fallback = () => {
    const end = profile()
    renderer.renderer.render(scene, new OrthographicCamera())
    renderTime = end()
    console.log('Took ' + renderTime + 'ms to render ' + triangleCount + ' triangles')
    profilerState.meshRenderMs.set(renderTime)
    onFinished()
  }

  let renderTime = 0
  if (renderer.supportWebGL2) {
    const gl = renderer.renderContext as WebGL2RenderingContext
    const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2')

    // Not super well supported, no Safari support
    if (ext) {
      const startQuery = gl.createQuery()
      const endQuery = gl.createQuery()

      if (startQuery && endQuery) {
        ext.queryCounterEXT(startQuery, ext.TIMESTAMP_EXT)
        renderer.renderer.render(scene, new OrthographicCamera())
        ext.queryCounterEXT(endQuery, ext.TIMESTAMP_EXT)

        requestAnimationFrame(function poll() {
          const available = gl.getQueryParameter(endQuery!, gl.QUERY_RESULT_AVAILABLE)
          const disjoint = gl.getParameter(ext.GPU_DISJOINT_EXT)

          if (available && !disjoint) {
            // Gets times in nanoseconds.
            const timeStart = gl.getQueryParameter(startQuery!, gl.QUERY_RESULT)
            const timeEnd = gl.getQueryParameter(endQuery!, gl.QUERY_RESULT)
            const renderTime = (timeEnd - timeStart) * 0.000001
            console.log('Took ' + renderTime + 'ms to render ' + triangleCount + ' triangles')
            profilerState.meshRenderMs.set(renderTime)
            onFinished()
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

  for (const mesh of meshes) {
    mesh.geometry.dispose()
    ;(mesh.material as MeshBasicMaterial).dispose()
    scene.remove(mesh)
  }
}
