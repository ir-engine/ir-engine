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

import { getComponent, getNestedChildren, hasComponent } from '@ir-engine/ecs'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { Entity } from 'dexie'
import { Mesh, MeshBasicMaterial, OrthographicCamera, Scene, WebGLRenderer } from 'three'

function createTopDownMask(rootEntities: Entity[], distance = 100, width = 512, height = 512) {
  const filterVisible = (entity) => hasComponent(entity, VisibleComponent)
  const getNestedVisibleChildren = (entity) => getNestedChildren(entity, filterVisible)
  const entities = rootEntities.map(getNestedVisibleChildren).flat()

  // Create renderer
  const renderer = new WebGLRenderer({ antialias: false })
  renderer.setSize(width, height)
  renderer.setClearColor(0xffffff)

  // Create orthographic camera looking down
  const size = distance // Adjust based on your scene scale
  const camera = new OrthographicCamera(-size, size, size, -size, 0.1, 1000)
  camera.position.set(0, 100, 0) // Position above scene
  camera.lookAt(0, 0, 0)
  camera.up.set(0, 0, -1) // Adjust up vector to look straight down

  // Create scene for mask rendering
  const scene = new Scene()

  // Create black material for all objects
  const blackMaterial = new MeshBasicMaterial({ color: 0x000000 })

  // Clone and add entities to the mask scene
  const clonedObjects = [] as any[]

  entities.forEach((entity) => {
    if (hasComponent(entity, ObjectComponent)) {
      const obj = getComponent(entity, ObjectComponent)
      const clone = obj.clone()

      // Replace all materials with black
      clone.traverse((child: Mesh) => {
        if (child.isMesh) {
          child.material = blackMaterial
        }
      })

      clonedObjects.push(clone)
    }
  })

  // Use engine's scene.children override instead of scene.add
  scene.children = clonedObjects

  // Render the mask
  renderer.render(scene, camera)

  // Get the rendered image data and trigger download
  const canvas = renderer.domElement
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob!)
    const link = document.createElement('a')
    link.href = url
    link.download = `topdown-mask-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 'image/png')

  // Clean up
  renderer.dispose()

  console.log('Top-down mask generated and download initiated')
}

globalThis.createTopDownMask = createTopDownMask
