import {
  createEntity,
  Entity,
  EntityID,
  EntityTreeComponent,
  getAncestorWithComponents,
  getChildrenWithComponents,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeEntityNodeRecursively,
  setComponent,
  SourceID,
  UUIDComponent
} from '@ir-engine/ecs'
import { exportGLTFScene } from '@ir-engine/engine/src/gltf/exportGLTFScene'
import { defineState, getState } from '@ir-engine/hyperflux'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { BufferAttribute, BufferGeometry, Mesh } from 'three'
import { UVUnwrapper } from 'xatlas-three'
import { uploadProjectFiles } from '../functions/assetFunctions'

export const UV2UnwrapperState = defineState({
  name: 'ir.engine.UV2AtlasState',

  initial: () => new UVUnwrapper({ BufferAttribute: BufferAttribute }),

  loadUnwrapper: async () => {
    const onProgress = (mode: number, progress: number) => {
      console.log(`XAtlas ${mode} ${progress}%`)
    }

    const unwrapper = getState(UV2UnwrapperState)

    await unwrapper.loadLibrary(
      onProgress,
      'https://cdn.jsdelivr.net/npm/xatlasjs@0.2.0/dist/xatlas.wasm',
      'https://cdn.jsdelivr.net/npm/xatlasjs@0.2.0/dist/xatlas.js'
    )

    unwrapper.chartOptions = {
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
      useInputMeshUvs: false
    }

    unwrapper.isLoaded = true
    console.log('XAtlas Loaded', unwrapper)
  }
})

const generateAtlas = async function (entity: Entity) {
  const unwrapper = getState(UV2UnwrapperState)

  if (!unwrapper.isLoaded) {
    console.warn('XAtlas not loaded')
    return
  }

  // this should not be hierarchy based, todo replace with volumetric query possibly using three mesh bvh's box3 override
  const meshEntities = getChildrenWithComponents(entity, [MeshComponent])
  const filteredMeshEntities = [] as Entity[]
  for (const entity of meshEntities) {
    const meshComponent = getComponent(entity, MeshComponent)
    if (
      meshComponent.geometry.index &&
      !hasComponent(entity, ColliderComponent) &&
      hasComponent(entity, VisibleComponent)
    ) {
      filteredMeshEntities.push(entity)
    }
  }
  const geometries = filteredMeshEntities.map((entity) => getComponent(entity, MeshComponent).geometry)

  // unwrapper.packOptions.padding = 1

  await unwrapper.packAtlas(geometries, 'uv2', 'uv')

  return filteredMeshEntities
}

async function exportAtlasData(
  entities: Entity[],
  projectName: string,
  relativePath: string,
  assetName: string
): Promise<string> {
  const rootEntity = createEntity()
  setComponent(rootEntity, UUIDComponent, { entitySourceID: 'atlas-root' as SourceID, entityID: 'root' as EntityID })
  setComponent(rootEntity, TransformComponent)
  setComponent(rootEntity, EntityTreeComponent)

  const sceneRootUUID = UUIDComponent.get(getAncestorWithComponents(entities[0], [SceneComponent]))

  entities.map((entity) => {
    let entityUUID = UUIDComponent.get(entity) as string
    //if entity uuid starts with sceneRootUUID, remove that part
    if (entityUUID.startsWith(sceneRootUUID)) entityUUID = entityUUID.slice(sceneRootUUID.length)

    const atlasEntity = UUIDComponent.create(rootEntity, entityUUID as EntityID)
    setComponent(atlasEntity, TransformComponent)

    setComponent(atlasEntity, EntityTreeComponent, { parentEntity: rootEntity })

    getMutableComponent(rootEntity, EntityTreeComponent).children.merge([atlasEntity])

    const originalMesh = getComponent(entity, MeshComponent)
    const geometry = new BufferGeometry()

    const originalGeometry = originalMesh.geometry
    for (const attributeName in originalGeometry.attributes) {
      const attribute = originalGeometry.getAttribute(attributeName)
      if (attribute) {
        geometry.setAttribute(attributeName, attribute.clone())
      }
    }

    if (originalGeometry.index) {
      geometry.setIndex(originalGeometry.index.clone())
    }

    setComponent(atlasEntity, MeshComponent, new Mesh(geometry))

    return atlasEntity
  })

  const [gltf, ...files] = await exportGLTFScene(rootEntity, projectName, assetName + '.gltf', false)

  const blob = [new Blob([JSON.stringify(gltf)], { type: 'model/gltf+json' })]
  const gltfFile = new File(blob, assetName + '.gltf')
  const binFile = new File([files[0] as File], assetName + '.bin')

  const [url] = await Promise.all(
    uploadProjectFiles(
      projectName,
      [gltfFile, binFile],
      [relativePath, relativePath],
      [
        {
          contentType: 'model/gltf+json',
          type: 'asset'
        }
      ]
    ).promises
  )

  removeEntityNodeRecursively(rootEntity)

  console.log(url)
  return url[0]
}

export const AtlasingFunctions = {
  generateAtlas,
  exportAtlasData
}
