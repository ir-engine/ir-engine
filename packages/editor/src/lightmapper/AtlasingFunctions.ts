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

import {
  createEntity,
  defineQuery,
  Entity,
  EntityID,
  EntityTreeComponent,
  getAncestorWithComponents,
  getComponent,
  getMutableComponent,
  getSimulationCounterpart,
  hasComponent,
  Layers,
  removeEntityNodeRecursively,
  setComponent,
  SourceID,
  UUIDComponent
} from '@ir-engine/ecs'
import { exportGLTFScene } from '@ir-engine/engine/src/gltf/exportGLTFScene'
import { LightmapComponent } from '@ir-engine/engine/src/lightmap/LightmapComponent'
import { defineState, getState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { BoundingBoxComponent } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  FloatType,
  Mesh,
  NearestFilter,
  Object3D,
  OrthographicCamera,
  ShaderMaterial,
  Texture,
  Uniform,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'
import { UVUnwrapper } from 'xatlas-three'
import { commitProperty } from '../components/properties/Util'
import { uploadProjectFiles } from '../functions/assetFunctions'
import { EditorState } from '../services/EditorServices'

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

export type UVChannel = 'uv' | 'uv1' | 'uv2' | 'uv3'

const meshQuery = defineQuery([MeshComponent, VisibleComponent], Layers.Authoring)

const generateAtlas = async function (entity: Entity, uvChannel: UVChannel = 'uv2') {
  const filteredMeshEntities = [] as Entity[]
  for (const meshEntity of meshQuery()) {
    const mesh = getComponent(meshEntity, MeshComponent)
    const isValidMesh = mesh.geometry.index && !hasComponent(meshEntity, ColliderComponent)
    const box = getComponent(entity, BoundingBoxComponent).box
    const transform = getComponent(entity, TransformComponent)
    box.max.set(1, 1, 1).applyMatrix4(transform.matrixWorld)
    box.min.set(-1, -1, -1).applyMatrix4(transform.matrixWorld)
    const intersectsVolume = getComponent(entity, BoundingBoxComponent).box.containsBox(mesh.geometry.boundingBox!)
    console.log(getComponent(meshEntity, NameComponent), 'isvalid', isValidMesh, 'intersects', intersectsVolume)
    if (isValidMesh && intersectsVolume) {
      filteredMeshEntities.push(meshEntity)
    }
  }

  const unwrapper = getState(UV2UnwrapperState)

  if (!unwrapper.isLoaded) {
    console.warn('XAtlas not loaded')
    return
  }

  const geometries = filteredMeshEntities.map((entity) => getComponent(entity, MeshComponent).geometry)

  // todo figure out if padding is needed
  // unwrapper.packOptions.padding = 1

  await unwrapper.packAtlas(geometries, uvChannel as any, 'uv')

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

    // for (let i = 0; i < originalGeometry.groups.length; i++) {
    //   geometry.groups[i] = originalGeometry.groups[i]
    // }

    setComponent(atlasEntity, MeshComponent, new Mesh(originalMesh.geometry.clone()))

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

const worldPositionVertexShader = `
    uniform vec2 offset;
    attribute vec2 uv2;
    varying vec4 vWorldPosition;

    void main() {
        vWorldPosition = modelMatrix * vec4(position, 1.0) ;

        gl_Position = vec4((uv2 + offset) * 2.0 - 1.0, 0.0, 1.0); 
    }
`

const worldPositionFragmentShader = `
    varying vec4 vWorldPosition;

    void main() {
        gl_FragColor = vWorldPosition;
    }
`

const worldPositionMaterial = new ShaderMaterial({
  vertexShader: worldPositionVertexShader,
  fragmentShader: worldPositionFragmentShader,
  side: DoubleSide,
  fog: false,
  uniforms: {
    offset: new Uniform(new Vector2(0, 0))
  }
})

const normalVertexShader = `
    varying vec4 vNormal;
    attribute vec2 uv2;
    uniform vec2 offset;

    void main() {
        vNormal = modelMatrix * vec4(normal, 0.0);

        gl_Position = vec4((uv2 + offset) * 2.0 - 1.0, 0.0, 1.0);
    }
`

const normalFragmentShader = `
    varying vec4 vWorldPosition; 
    varying vec4 vNormal;

    void main() {
        gl_FragColor = normalize(vNormal);
    }
`

const normalMaterial = new ShaderMaterial({
  vertexShader: normalVertexShader,
  fragmentShader: normalFragmentShader,
  side: DoubleSide,
  fog: false,
  uniforms: {
    offset: new Uniform(new Vector2(0, 0))
  }
})

const offsets = [
  { x: -2, y: -2 },
  { x: 2, y: -2 },
  { x: -2, y: 2 },
  { x: 2, y: 2 },

  { x: -1, y: -2 },
  { x: 1, y: -2 },
  { x: -2, y: -1 },
  { x: 2, y: -1 },
  { x: -2, y: 1 },
  { x: 2, y: 1 },
  { x: -1, y: 2 },
  { x: 1, y: 2 },

  { x: -2, y: 0 },
  { x: 2, y: 0 },
  { x: 0, y: -2 },
  { x: 0, y: 2 },

  { x: -1, y: -1 },
  { x: 1, y: -1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: -1, y: 1 },
  { x: 1, y: 1 },
  { x: 0, y: -1 },
  { x: 0, y: 1 },

  { x: 0, y: 0 }
]

const renderAtlas = (renderer: WebGLRenderer, meshs: Mesh[], resolution: number, dialate: boolean = true) => {
  const renderWithShader = (material: ShaderMaterial): Texture => {
    const target = new WebGLRenderTarget(resolution, resolution, {
      type: FloatType,
      magFilter: NearestFilter,
      minFilter: NearestFilter
    })

    const orthographicCamera = new OrthographicCamera(-100, 100, -100, 100, -100, 200)
    orthographicCamera.updateMatrix()

    /**@todo attempt material swapping instead of cloning */
    const lightMapMeshes = new Object3D()
    lightMapMeshes.matrixWorldAutoUpdate = false

    for (const mesh of meshs) {
      const lightMapMesh = mesh.clone()
      lightMapMesh.material = material
      lightMapMeshes.add(lightMapMesh)
    }

    renderer.autoClear = false
    renderer.setRenderTarget(target)
    renderer.setClearColor(0, 0)
    renderer.clear()

    if (dialate) {
      for (const offset of offsets) {
        material.uniforms.offset.value.x = offset.x * (1 / resolution)
        material.uniforms.offset.value.y = offset.y * (1 / resolution)
        renderer.render(lightMapMeshes, orthographicCamera)
      }
    }

    material.uniforms.offset.value.x = 0
    material.uniforms.offset.value.y = 0
    renderer.render(lightMapMeshes, orthographicCamera)

    renderer.setRenderTarget(null)

    return target.texture
  }

  const positionTexture = renderWithShader(worldPositionMaterial)
  const normalTexture = renderWithShader(normalMaterial)

  return {
    positionTexture,
    normalTexture
  }
}

/** Asynchronously handles atlas generation and export, returns the entities that were atlased
 * @param entity The entity to generate the atlas for
 * @param uvChannel The UV channel to use for the atlas
 * @returns The entities that were atlased
 */
const handleGenerateAtlas = async (entity: Entity, uvChannel: UVChannel = 'uv2') => {
  const entities = await AtlasingFunctions.generateAtlas(getSimulationCounterpart(entity), uvChannel)
  if (!entities) return
  const editorState = getState(EditorState)
  const atlasSrc = await AtlasingFunctions.exportAtlasData(
    entities,
    editorState.projectName!,
    'public/scenes/lightmap/' + editorState.sceneName?.substring(0, editorState.sceneName!.lastIndexOf('.')),
    getComponent(entity, NameComponent)
  )

  commitProperty(LightmapComponent, 'atlasSrc', [entity])(atlasSrc)

  return entities
}

export const AtlasingFunctions = {
  generateAtlas,
  exportAtlasData,
  renderAtlas,
  handleGenerateAtlas
}
