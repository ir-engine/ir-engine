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
  Color,
  Euler,
  MathUtils,
  Quaternion,
  Vector3
} from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js'
import {
  getComponent,
  getMutableComponent,
  setComponent
} from 'https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/ComponentFunctions.ts'
import { createEntity } from 'https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/EntityFunctions.tsx'
import { defineQuery } from 'https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/QueryFunctions.tsx'
import { defineSystem } from 'https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/SystemFunctions.ts'
import { AnimationSystemGroup } from 'https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/SystemGroups.ts'
import { UUIDComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/UUIDComponent.ts'
import { GLTFComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/engine/src/gltf/GLTFComponent.tsx'
import { PrimitiveGeometryComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/engine/src/scene/components/PrimitiveGeometryComponent.ts'
import { SourceComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/engine/src/scene/components/SourceComponent.ts'
import { GeometryTypeEnum } from 'https://localhost:3000/@fs/root/ir-engine/packages/engine/src/scene/constants/GeometryTypeEnum.ts'
import { getState } from 'https://localhost:3000/@fs/root/ir-engine/packages/hyperflux/src/functions/StateFunctions.ts'
import { EngineState } from 'https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/EngineState.ts'
import { NameComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/common/NameComponent.ts'
import { MeshComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/renderer/components/MeshComponent.ts'
import { setVisibleComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/renderer/components/VisibleComponent.ts'
import { EntityTreeComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/transform/components/EntityTree.tsx'
import { TransformComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/transform/components/TransformComponent.ts'

const heightMap = 'https://localhost:8642/projects/ir-engine/default-project/assets/heightMap.png'
const minBounds = 15,
  maxBounds = 60,
  maxHeight = 10,
  heightOffset = 0,
  tileSize = 4
const totalTileCount = Math.ceil(maxBounds / tileSize)

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
  const [r, g, b] = [imageData.data[pixelIndex], imageData.data[pixelIndex + 1], imageData.data[pixelIndex + 2]]
  const grayscale = (r + g + b) / 3
  const height = (grayscale / 255) * maxHeight
  return { height, color: new Color(r / 255, g / 255, b / 255) }
}

const imageData = await loadHeightmap(heightMap)
const gltf = defineQuery([GLTFComponent])()[0]

let tileCount = 0
const tiles = []
const generateTile = (position, visible = true) => {
  const entity = createEntity()
  setComponent(entity, EntityTreeComponent, { parentEntity: gltf })
  setComponent(entity, NameComponent, `tile_${tileCount++}`)
  setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
  setVisibleComponent(entity, visible)
  setComponent(entity, TransformComponent, {
    position,
    rotation: new Quaternion().setFromEuler(new Euler(MathUtils.DEG2RAD * -90, 0, 0)),
    scale: new Vector3(tileSize, tileSize, tileSize)
  })
  setComponent(entity, SourceComponent, getComponent(gltf, SourceComponent))
  setComponent(entity, PrimitiveGeometryComponent, { geometryType: GeometryTypeEnum.BoxGeometry })
  return entity
}

// take the cam x,z , generate tile right under it and min bound/ tilesize number of tiles across
const _tempVector = new Vector3(0, 0, 0)
const camPos = getComponent(getState(EngineState).viewerEntity, TransformComponent).position.clone()

for (let i = -totalTileCount; i < totalTileCount; i++) {
  const row = []
  for (let j = -totalTileCount; j < totalTileCount; j++) {
    const mapX = Math.floor(((i + totalTileCount) / (totalTileCount * 2)) * imageData.width)
    const mapY = Math.floor(((j + totalTileCount) / (totalTileCount * 2)) * imageData.height)
    const { height, color } = getHeightAndColorAt(imageData, mapX, mapY)
    const visible =
      camPos.set(camPos.x, 0, camPos.z).distanceTo(_tempVector.set(i * tileSize, 0, j * tileSize)) < minBounds
    const tileEntity = generateTile(_tempVector.set(i * tileSize, height + heightOffset, j * tileSize), visible)
    getMutableComponent(tileEntity, MeshComponent).material.color.set(color)
    row.push(tileEntity)
  }
  tiles.push(row)
}

const execute = () => {
  const camPos = getComponent(getState(EngineState).viewerEntity, TransformComponent).position.clone()
  for (let i = 0; i < totalTileCount * 2; i++) {
    for (let j = 0; j < totalTileCount * 2; j++) {
      const tileEntity = tiles[i][j]
      const tilePos = getComponent(tileEntity, TransformComponent).position
      const visible = camPos.set(camPos.x, 0, camPos.z).distanceTo(_tempVector.set(tilePos.x, 0, tilePos.z)) < minBounds
      setVisibleComponent(tileEntity, visible)
    }
  }
}

export const scriptTileGeneration = defineSystem({
  uuid: 'ee.editor.scriptTileGeneration',
  insert: { before: AnimationSystemGroup },
  execute
})
