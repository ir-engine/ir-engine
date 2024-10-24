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

import {
  getComponent,
  setComponent
} from 'https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/ComponentFunctions.ts'
import { createEntity } from 'https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/EntityFunctions.tsx'
import { defineQuery } from 'https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/QueryFunctions.tsx'
import { defineSystem } from 'https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/SystemFunctions.ts'
import { AnimationSystemGroup } from 'https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/SystemGroups.ts'
import { UUIDComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/UUIDComponent.ts'
import { GLTFComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/engine/src/gltf/GLTFComponent.tsx'
import { SourceComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/engine/src/scene/components/SourceComponent.ts'
import { getState } from 'https://localhost:3000/@fs/root/ir-engine/packages/hyperflux/src/functions/StateFunctions.ts'
import { EngineState } from 'https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/EngineState.ts'
import { NameComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/common/NameComponent.ts'
import { MeshComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/renderer/components/MeshComponent.ts'
import { setVisibleComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/renderer/components/VisibleComponent.ts'
import { EntityTreeComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/transform/components/EntityTree.tsx'
import { TransformComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/transform/components/TransformComponent.ts'
import { addObjectToGroup } from 'https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/renderer/components/GroupComponent.tsx'
import {
  BufferAttribute,
  BufferGeometry,
  Mesh,
  MeshBasicMaterial,
  Vector3
} from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js'

const heightMap = 'https://localhost:8642/projects/ir-engine/default-project/assets/heightMap.png'
const tileScale = 5,
  heightmapScale = 100,
  loadDistance = 5 * tileScale

const loadHeightmap = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve(ctx.getImageData(0, 0, img.width, img.height))
    }
    img.onerror = reject
    img.src = url
  })

const getHeightAndColorAt = (imageData, x, y) => {
  const pixelIndex = (y * imageData.width + x) * 4
  const [red, green, blue] = [
    imageData.data[pixelIndex],
    imageData.data[pixelIndex + 1],
    imageData.data[pixelIndex + 2]
  ]
  const grayscale = (red + green + blue) / 3
  const height = grayscale / 255
  const r = red / 255
  const g = green / 255
  const b = blue / 255

  return { height, r, g, b }
}

const imageData = await loadHeightmap(heightMap)
const totalTileCount = imageData.width / heightmapScale

const gltfQuery = defineQuery([GLTFComponent])

const tiles = {} // 2d array of tile entities indexed by x,y

const triangulateHeightmap = (imageData, mapX, mapY, heightmapScale) => {
  const geometry = new BufferGeometry()
  const vertices = []
  const indices = []
  const colors = []
  const vertexXCount = mapX + 1 === imageData.width / heightmapScale ? heightmapScale - 1 : heightmapScale
  const vertexYCount = mapY + 1 === imageData.height / heightmapScale ? heightmapScale - 1 : heightmapScale

  for (let i = 0; i < vertexXCount + 1; i++) {
    for (let j = 0; j < vertexYCount + 1; j++) {
      const { height, r, g, b } = getHeightAndColorAt(
        imageData,
        Math.floor(i + mapX * heightmapScale),
        Math.floor(j + mapY * heightmapScale)
      )
      const x = i / vertexXCount
      const y = j / vertexYCount
      vertices.push(x, height, y)
      colors.push(r, g, b)
      if (i < vertexXCount && j < vertexYCount) {
        const a = j + i * (vertexYCount + 1)
        const b = j + 1 + i * (vertexYCount + 1)
        const c = j + (i + 1) * (vertexYCount + 1)
        const d = j + 1 + (i + 1) * (vertexYCount + 1)
        indices.push(a, b, d, a, d, c)
      }
    }
  }
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3))
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3))
  geometry.setIndex(indices)
  return geometry
}

const generateTile = (mapX, mapY, parentEntity) => {
  const entity = createEntity()
  setComponent(entity, NameComponent, `tile_${mapX}_${mapY}`)
  setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
  setVisibleComponent(entity, true)
  const mapSize = totalTileCount * tileScale
  setComponent(entity, TransformComponent, {
    position: new Vector3(mapX * tileScale, 0, mapY * tileScale).sub(new Vector3(mapSize / 2, 0, mapSize / 2)),
    scale: new Vector3(tileScale, tileScale, tileScale)
  })
  setComponent(entity, EntityTreeComponent, { parentEntity: parentEntity })
  setComponent(entity, SourceComponent, getComponent(parentEntity, SourceComponent))
  const geometry = triangulateHeightmap(imageData, mapX, mapY, heightmapScale)
  const mesh = new Mesh(geometry, new MeshBasicMaterial({ vertexColors: true }))
  setComponent(entity, MeshComponent, mesh)
  addObjectToGroup(entity, mesh)
  return entity
}

// take the cam x,z , generate tile right under it and min bound/ tilesize number of tiles across
const _tempVector = new Vector3(0, 0, 0)
const camPos = new Vector3(0, 0, 0)

const execute = () => {
  const parentEntity = gltfQuery()[0]
  if (!parentEntity) return

  for (let i = 0; i < totalTileCount; i++) {
    for (let j = 0; j < totalTileCount; j++) {
      if (!tiles[`${i},${j}`]) {
        tiles[`${i},${j}`] = generateTile(i, j, parentEntity)
      }
    }
  }

  const viewerEntity = getState(EngineState).viewerEntity

  TransformComponent.getWorldPosition(viewerEntity, camPos).y = 0

  for (let i = 0; i < totalTileCount; i++) {
    for (let j = 0; j < totalTileCount; j++) {
      const tileEntity = tiles[`${i},${j}`]
      const transform = getComponent(tileEntity, TransformComponent)
      _tempVector.copy(transform.position).y = 0
      const visible = camPos.distanceTo(_tempVector) < loadDistance
      setVisibleComponent(tileEntity, visible)
    }
  }
}

export const scriptTileGeneration = defineSystem({
  uuid: 'ee.editor.scriptTileGeneration',
  insert: { before: AnimationSystemGroup },
  execute
})
