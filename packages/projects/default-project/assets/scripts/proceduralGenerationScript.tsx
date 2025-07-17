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
  AnimationSystemGroup,
  createEntity,
  defineSystem,
  Entity,
  EntityTreeComponent,
  getComponent,
  removeComponent,
  setComponent
} from '@ir-engine/ecs'
import { DomainConfigState } from '@ir-engine/engine'
import { getState } from '@ir-engine/hyperflux'
import {
  MeshComponent,
  NameComponent,
  ReferenceSpaceState,
  TransformComponent,
  VisibleComponent
} from '@ir-engine/spatial'
import { BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three'

const cloudDomain = getState(DomainConfigState).cloudDomain

const heightMap = `${cloudDomain}/projects/ir-engine/default-project/assets/heightMap.png`
const tileScale = 5,
  heightmapScale = 100,
  loadDistance = 5 * tileScale

interface HeightAndColor {
  height: number
  r: number
  g: number
  b: number
}

interface ImageData {
  width: number
  height: number
  data: Uint8ClampedArray
}

const loadHeightmap = (url: string): Promise<ImageData> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get 2D context from canvas'))
        return
      }
      ctx.drawImage(img, 0, 0)
      resolve(ctx.getImageData(0, 0, img.width, img.height))
    }
    img.onerror = reject
    img.src = url
  })

const getHeightAndColorAt = (imageData: ImageData, x: number, y: number): HeightAndColor => {
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

// Using an immediately invoked async function to handle the async loading
let imageData: ImageData
let totalTileCount: number
const tiles: Record<string, Entity> = {} // 2d array of tile entities indexed by x,y

;(async () => {
  imageData = await loadHeightmap(heightMap)
  totalTileCount = imageData.width / heightmapScale
})()

const triangulateHeightmap = (
  imageData: ImageData,
  mapX: number,
  mapY: number,
  heightmapScale: number
): BufferGeometry => {
  const geometry = new BufferGeometry()
  const vertices: number[] = []
  const indices: number[] = []
  const colors: number[] = []
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

const generateTile = (mapX: number, mapY: number, parentEntity: Entity) => {
  const entity = createEntity()
  setComponent(entity, NameComponent, `tile_${mapX}_${mapY}`)
  setComponent(entity, VisibleComponent)
  const mapSize = totalTileCount * tileScale
  setComponent(entity, TransformComponent, {
    position: new Vector3(mapX * tileScale, 0, mapY * tileScale).sub(new Vector3(mapSize / 2, 0, mapSize / 2)),
    scale: new Vector3(tileScale, tileScale, tileScale)
  })
  setComponent(entity, EntityTreeComponent, { parentEntity: parentEntity })
  const geometry = triangulateHeightmap(imageData, mapX, mapY, heightmapScale)
  const mesh = new Mesh(geometry, new MeshBasicMaterial({ vertexColors: true }))
  setComponent(entity, MeshComponent, mesh)
  return entity
}

// take the cam x,z , generate tile right under it and min bound/ tilesize number of tiles across
const _tempVector = new Vector3(0, 0, 0)
const camPos = new Vector3(0, 0, 0)

const execute = () => {
  if (!imageData) return // Skip execution if image data isn't loaded yet

  const parentEntity = getState(ReferenceSpaceState).originEntity
  if (!parentEntity) return

  for (let i = 0; i < totalTileCount; i++) {
    for (let j = 0; j < totalTileCount; j++) {
      if (!tiles[`${i},${j}`]) {
        tiles[`${i},${j}`] = generateTile(i, j, parentEntity)
      }
    }
  }

  const viewerEntity = getState(ReferenceSpaceState).viewerEntity

  TransformComponent.getWorldPosition(viewerEntity, camPos).y = 0

  for (let i = 0; i < totalTileCount; i++) {
    for (let j = 0; j < totalTileCount; j++) {
      const tileEntity = tiles[`${i},${j}`]
      const transform = getComponent(tileEntity, TransformComponent)
      _tempVector.copy(transform.position).y = 0
      const visible = camPos.distanceTo(_tempVector) < loadDistance
      if (visible) setComponent(tileEntity, VisibleComponent)
      else removeComponent(tileEntity, VisibleComponent)
    }
  }
}

export const scriptTileGeneration = defineSystem({
  uuid: 'ee.editor.scriptTileGeneration',
  insert: { before: AnimationSystemGroup },
  execute
})
