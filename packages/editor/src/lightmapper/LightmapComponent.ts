import { defineComponent, Entity, getChildrenWithComponents, getComponent, hasComponent } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { BufferAttribute, BufferGeometry } from 'three'
import { UVUnwrapper } from 'xatlas-three'

//add isLoaded to UVUnwrapper
declare module 'xatlas-three' {
  export interface UVUnwrapper {
    isLoaded: boolean
  }
}

export const LightmapComponent = defineComponent({
  name: 'LightmapComponent',
  jsonID: 'IR_lightmap',

  schema: S.Object({
    resolution: S.Number({ default: 1024 }),
    intensity: S.Number({ default: 1.0 }),
    texCoord: S.Number({ default: 1 })
  }),

  unwrapper: new UVUnwrapper({ BufferAttribute: BufferAttribute }),

  loadUnwrapper: async () => {
    const onProgress = (mode: number, progress: number) => {
      console.log(`XAtlas ${mode} ${progress}%`)
    }
    await LightmapComponent.unwrapper.loadLibrary(
      onProgress,
      'https://cdn.jsdelivr.net/npm/xatlasjs@0.2.0/dist/xatlas.wasm',
      'https://cdn.jsdelivr.net/npm/xatlasjs@0.2.0/dist/xatlas.js'
    )

    LightmapComponent.unwrapper.chartOptions = {
      fixWinding: false,
      maxBoundaryLength: 0,
      maxChartArea: 0,
      maxCost: 2,
      maxIterations: 1,
      normalDeviationWeight: 2,
      normalSeamWeight: 4,
      roundnessWeight: 0.009999999776482582,
      straightnessWeight: 6,
      textureSeamWeight: 0.5,
      useInputMeshUvs: true
    }

    LightmapComponent.unwrapper.isLoaded = true
    console.log('XAtlas Loaded', LightmapComponent.unwrapper)
  },

  generateAtlas: (entity: Entity) => {
    if (!LightmapComponent.unwrapper.isLoaded) {
      console.warn('XAtlas not loaded')
      return
    }

    // this should not be hierarchy based, todo replace with volumetric query possibly using three mesh bvh's box3 override
    const meshes = getChildrenWithComponents(entity, [MeshComponent])
    const geometries = [] as BufferGeometry[]
    for (const mesh of meshes) {
      const meshComponent = getComponent(mesh, MeshComponent)
      if (meshComponent.geometry.index && !hasComponent(mesh, ColliderComponent)) {
        geometries.push(meshComponent.geometry)
      }
    }
    console.log(geometries)

    // unwrapper.packOptions.padding = 1

    LightmapComponent.unwrapper.packAtlas(geometries, 'uv2', 'uv')
  }
})
