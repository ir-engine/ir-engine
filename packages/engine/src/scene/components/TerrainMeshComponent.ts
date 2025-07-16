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
  createEntity,
  defineComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { TriplanarMappingMaterialPlugin } from '@ir-engine/engine/src/material/plugins/TriplanarMappingMaterialPlugin'
import { NO_PROXY } from '@ir-engine/hyperflux'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { CollisionGroups } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import { BodyTypes, Shapes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { ObjectLayerMasks } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { useEffect } from 'react'
import { BufferAttribute, BufferGeometry, DoubleSide, Mesh, MeshStandardMaterial, PlaneGeometry, Texture } from 'three'
import { useTexture } from '../../assets/functions/resourceLoaderHooks'

export const TerrainMeshComponent = defineComponent({
  name: 'TerrainMeshComponent',
  jsonID: 'EE_terrain_mesh',

  schema: S.Object({
    // Terrain dimensions
    width: S.Number({ default: 100 }),
    height: S.Number({ default: 20 }),
    depth: S.Number({ default: 100 }),

    // Terrain resolution
    widthSegments: S.Number({ default: 100 }),
    depthSegments: S.Number({ default: 100 }),

    // Heightmap
    heightmapURL: S.String({ default: '' }),

    // Physics
    enablePhysics: S.Bool({ default: true }),

    // Visibility
    visible: S.Bool({ default: true })
  }),

  errors: ['MISSING_HEIGHTMAP', 'INVALID_DIMENSIONS'],

  reactor: function TerrainMeshReactor({ entity }) {
    const component = useComponent(entity, TerrainMeshComponent)

    // Load heightmap texture
    const [heightmapTexture] = useTexture(component.heightmapURL.value, entity)

    // Create terrain mesh when heightmap is loaded
    useEffect(() => {
      if (!heightmapTexture) return

      // Create terrain mesh
      const terrainMesh = createTerrainMesh(component.get(NO_PROXY), heightmapTexture)

      // Set mesh component
      setComponent(entity, MeshComponent, terrainMesh)

      // Set up physics if enabled
      if (component.enablePhysics.value) {
        setComponent(entity, ObjectLayerMaskComponent, ObjectLayerMasks.Scene)
        setComponent(entity, RigidBodyComponent, { type: BodyTypes.Fixed })
        setComponent(entity, ColliderComponent, {
          shape: Shapes.Mesh,
          collisionLayer: CollisionGroups.Ground,
          collisionMask: CollisionGroups.Default | CollisionGroups.Avatars
        })
      }

      return () => {
        removeComponent(entity, MeshComponent)
        if (component.enablePhysics.value) {
          removeComponent(entity, RigidBodyComponent)
          removeComponent(entity, ColliderComponent)
        }
      }
    }, [
      heightmapTexture,
      component.width.value,
      component.height.value,
      component.depth.value,
      component.widthSegments.value,
      component.depthSegments.value,
      component.enablePhysics.value
    ])

    return null
  }
})

// Helper function to create a terrain mesh from a heightmap
function createTerrainMesh(terrainConfig: any, heightmapTexture: Texture | any): Mesh {
  // Create geometry
  const geometry = new PlaneGeometry(
    terrainConfig.width,
    terrainConfig.depth,
    terrainConfig.widthSegments,
    terrainConfig.depthSegments
  )

  // Rotate to horizontal plane
  geometry.rotateX(-Math.PI / 2)

  // Create heightmap data
  const heightmapData = getHeightmapData(
    heightmapTexture,
    terrainConfig.widthSegments + 1,
    terrainConfig.depthSegments + 1
  )

  // Apply heightmap to geometry
  applyHeightmapToGeometry(geometry, heightmapData, terrainConfig.height)

  // Create a standard material
  const material = new MeshStandardMaterial({
    roughness: 1.0,
    metalness: 0.0,
    side: DoubleSide
  })

  // Create mesh
  const mesh = new Mesh(geometry, material)
  mesh.name = 'TerrainMesh'
  mesh.castShadow = true
  mesh.receiveShadow = true

  // Create a material entity for the plugin
  const materialEntity = createEntity()

  // Set the material state component
  setComponent(materialEntity, MaterialStateComponent, { material })

  // Apply the triplanar mapping plugin
  setComponent(materialEntity, TriplanarMappingMaterialPlugin)

  return mesh
}

// Extract heightmap data from texture
function getHeightmapData(heightmapTexture: Texture, width: number, height: number): Float32Array {
  // Create a canvas to read pixel data
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')

  if (!context) {
    console.error('Could not get 2D context for heightmap canvas')
    return new Float32Array(width * height)
  }

  // Draw the texture to the canvas
  context.drawImage(heightmapTexture.image, 0, 0, width, height)

  // Get the pixel data
  const imageData = context.getImageData(0, 0, width, height)
  const pixels = imageData.data

  // Convert to height values (using red channel)
  const heightData = new Float32Array(width * height)
  for (let i = 0; i < width * height; i++) {
    // Use red channel (0-255) and normalize to 0-1
    heightData[i] = pixels[i * 4] / 255
  }

  return heightData
}

// Apply heightmap data to geometry
function applyHeightmapToGeometry(geometry: BufferGeometry, heightData: Float32Array, maxHeight: number): void {
  const positionAttribute = geometry.getAttribute('position') as BufferAttribute
  const positions = positionAttribute.array as Float32Array

  // Apply height to each vertex
  for (let i = 0; i < positions.length / 3; i++) {
    const index = i * 3
    // Y is up in Three.js
    positions[index + 1] = heightData[i] * maxHeight
  }

  // Update position attribute
  positionAttribute.needsUpdate = true

  // Recompute normals
  geometry.computeVertexNormals()
}
