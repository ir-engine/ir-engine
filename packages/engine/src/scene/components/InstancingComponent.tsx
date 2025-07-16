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

import { InstancedBufferAttribute, Matrix4, Quaternion, Texture, Vector3 } from 'three'

import { defineComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useEffect } from 'react'
import { useTexture } from '../../assets/functions/resourceLoaderHooks'

export const InstancingComponent = defineComponent({
  name: 'InstancingComponent',
  jsonID: 'EE_instancing',

  schema: S.Object({
    instanceMatrix: S.Class(() => new InstancedBufferAttribute(new Float32Array(16), 16))
  })
})

export const InstancingPlacementComponent = defineComponent({
  name: 'InstancingPlacementComponent',

  jsonID: 'IR_instancing_placement',

  schema: S.Object({
    width: S.Number({ default: 1024 }),
    length: S.Number({ default: 1024 }),
    height: S.Number({ default: 10 }),
    count: S.Number({ default: 1000 }),
    heightmapTexture: S.String(),
    maskTexture: S.String(),
    randomPositionWeight: S.Number({ default: 0 }),
    randomRotationWeight: S.Number({ default: 0 })
  }),

  onSet(entity, component, json) {
    /** @todo annoying necessity to stop VariantComponent from loading a non-instanced GLTF whilst our reactor runs */
    setComponent(entity, InstancingComponent)
    if (!json) return
    component.merge(json)
  },

  reactor: ({ entity }) => {
    const component = useComponent(entity, InstancingPlacementComponent)

    const [heightmapTexture] = useTexture(component.heightmapTexture.value, entity)
    const [maskTexture] = useTexture(component.maskTexture.value, entity)

    useEffect(() => {
      /** Recalculate instance matrix */
      if (!heightmapTexture || !maskTexture) return

      // Sample resolution for texture lookups
      const sampleWidth = Math.min(component.width.value, 256)
      const sampleHeight = Math.min(component.length.value, 256)

      // Helper function to extract pixel data from texture once
      const extractTextureData = (texture: Texture, width: number, height: number): Uint8ClampedArray => {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')

        if (!context) {
          console.error('Could not get 2D context for texture sampling')
          return new Uint8ClampedArray(width * height * 4)
        }

        // Draw the texture to the canvas
        context.drawImage(texture.image, 0, 0, width, height)

        // Get all pixel data at once
        const imageData = context.getImageData(0, 0, width, height)
        return imageData.data
      }

      // Extract pixel data once for both textures
      const maskPixelData = extractTextureData(maskTexture, sampleWidth, sampleHeight)
      const heightmapPixelData = extractTextureData(heightmapTexture, sampleWidth, sampleHeight)

      // Fast pixel sampling function using pre-extracted data
      const samplePixelData = (pixelData: Uint8ClampedArray, x: number, y: number, width: number): number => {
        const index = (y * width + x) * 4 // 4 bytes per pixel (RGBA)
        return pixelData[index] / 255 // Return normalized red channel value (0-1)
      }

      // Generate instance matrices
      const matrices: number[] = []
      const mat4 = new Matrix4()
      const position = new Vector3()
      const rotation = new Quaternion()
      const scale = new Vector3(1, 1, 1)

      const width = component.width.value
      const length = component.length.value
      const count = component.count.value
      const randomPositionWeight = component.randomPositionWeight.value
      const randomRotationWeight = component.randomRotationWeight.value

      let placedInstances = 0
      let attempts = 0
      const maxAttempts = count * 10 // Prevent infinite loops

      while (placedInstances < count && attempts < maxAttempts) {
        attempts++

        // Generate random position within bounds
        const x = Math.random() * width - width / 2
        const z = Math.random() * length - length / 2

        // Convert world position to texture coordinates
        const texX = Math.floor(((x + width / 2) / width) * sampleWidth)
        const texZ = Math.floor(((z + length / 2) / length) * sampleHeight)

        // Clamp to texture bounds
        const clampedTexX = Math.max(0, Math.min(sampleWidth - 1, texX))
        const clampedTexZ = Math.max(0, Math.min(sampleHeight - 1, texZ))

        // Sample mask texture to determine if placement is allowed
        const maskValue = samplePixelData(maskPixelData, clampedTexX, clampedTexZ, sampleWidth)

        // Skip if mask value is too low (black areas = no placement)
        if (maskValue < 0.1) continue

        // Sample heightmap for Y position
        const heightValue = samplePixelData(heightmapPixelData, clampedTexX, clampedTexZ, sampleWidth)

        // Apply random position offset
        const randomOffsetX = (Math.random() - 0.5) * randomPositionWeight
        const randomOffsetZ = (Math.random() - 0.5) * randomPositionWeight

        position.set(
          x + randomOffsetX,
          heightValue * component.height.value, // Scale height appropriately
          z + randomOffsetZ
        )

        // Apply random rotation
        const randomRotationY = Math.random() * Math.PI * 2 * randomRotationWeight
        rotation.setFromAxisAngle(new Vector3(0, 1, 0), randomRotationY)

        // Create transformation matrix
        mat4.compose(position, rotation, scale)
        matrices.push(...mat4.elements)

        placedInstances++
      }

      // Create instance matrix buffer
      const instanceMatrix = new InstancedBufferAttribute(new Float32Array(matrices), 16)

      // Set the instancing component on the entity
      setComponent(entity, InstancingComponent, { instanceMatrix })
    }, [
      component.width.value,
      component.length.value,
      component.height.value,
      component.count.value,
      heightmapTexture,
      maskTexture,
      component.randomPositionWeight.value,
      component.randomRotationWeight.value
    ])

    return null
  }
})
