import { BufferGeometry, InstancedMesh, Material, Mesh, MeshBasicMaterial } from 'three'

import { ModelTransformParameters } from '@etherealengine/engine/src/assets/classes/ModelTransform'
import createGLTFExporter from '@etherealengine/engine/src/assets/functions/createGLTFExporter'
import { pathResolver } from '@etherealengine/engine/src/assets/functions/pathResolver'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  getMutableComponent,
  setComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { addEntityNodeChild } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { SourceType } from '@etherealengine/engine/src/renderer/materials/components/MaterialSource'
import {
  removeMaterialSource,
  unregisterMaterial
} from '@etherealengine/engine/src/renderer/materials/functions/MaterialLibraryFunctions'
import { LODComponent, LODLevel } from '@etherealengine/engine/src/scene/components/LODComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { getLodPath, processLoadedLODLevel } from '@etherealengine/engine/src/scene/functions/loaders/LODFunctions'
import getFirstMesh from '@etherealengine/engine/src/scene/util/getFirstMesh'
import iterateObject3D from '@etherealengine/engine/src/scene/util/iterateObject3D'
import { State } from '@etherealengine/hyperflux'

import { uploadProjectFiles } from './assetFunctions'
import exportGLTF from './exportGLTF'

export type LODsFromModelParameters = {
  serialize: boolean
  levels: ModelTransformParameters[]
}

/**
 * Iterates through a model's meshes and creates LODComponents for each one
 * @param entity : entity to add the LODs to
 * @returns array of generated LOD entities
 */
export async function createLODsFromModel(
  entity: Entity,
  options: LODsFromModelParameters = {
    serialize: false,
    levels: []
  }
): Promise<Entity[]> {
  LODComponent.lodsByEntity[entity].value?.map((entity) => removeEntity(entity))
  const model = getComponent(entity, ModelComponent)
  const lods: Entity[] = []
  if (model.scene) {
    const meshes = iterateObject3D(
      model.scene,
      (mesh: Mesh) => {
        getLodPath(mesh)
        return mesh
      },
      (mesh: Mesh) => mesh?.isMesh
    )
    const exporter = createGLTFExporter()
    for (let i = 0; i < meshes.length; i++) {
      const mesh = meshes[i]
      const lodEntity = createEntity()
      addEntityNodeChild(lodEntity, entity)
      setComponent(lodEntity, LODComponent, {
        target: entity,
        lodPath: mesh.userData['lodPath'],
        levels: [
          {
            model: mesh,
            distance: 0,
            loaded: true,
            metadata: {},
            src: ''
          }
        ],
        instanced: mesh instanceof InstancedMesh
      })
      setComponent(lodEntity, NameComponent, mesh.name)
      processLoadedLODLevel(lodEntity, 0, mesh)
      if (options.serialize) {
        const lodComponent = getMutableComponent(lodEntity, LODComponent)
        const lodURL = await serializeLOD(model.src, lodEntity, lodComponent.levels[0], exporter)
        const lodDistance = 5
        for (let i = 0; i < options.levels.length; i++) {
          const lodParms = options.levels[i]
          const levelURL = await Engine.instance.api.service('model-transform').create({
            src: lodURL,
            transformParameters: lodParms
          })
          lodComponent.levels[i].set({
            model: null,
            distance: lodDistance * (i + 1),
            loaded: false,
            metadata: {},
            src: levelURL
          })
        }
      }
      lods.push(lodEntity)
    }
  }
  LODComponent.lodsByEntity[entity].set(lods)
  return Promise.resolve(lods)
}

export async function serializeLOD(
  rootSrc: string,
  entity: Entity,
  level: State<LODLevel>,
  gltfExporter = createGLTFExporter()
) {
  const mesh = getFirstMesh(level.model.value!)!
  //clone the mesh and remove its world matrix so it can be exported
  //also convert instanced meshes into singleton version as instance matrix data is stored in the scaffold
  const toExport: Mesh<BufferGeometry, Material> =
    mesh instanceof InstancedMesh ? new Mesh(mesh.geometry, mesh.material) : mesh.clone()
  //remove lodIndex property which will be re-added by the lod system on import
  toExport.geometry.hasAttribute('lodIndex') && toExport.geometry.deleteAttribute('lodIndex')
  toExport.removeFromParent()
  toExport.position.set(0, 0, 0)
  toExport.rotation.set(0, 0, 0)
  toExport.scale.set(1, 1, 1)
  toExport.updateMatrixWorld()
  const [, , projectName, fileName] = pathResolver().exec(rootSrc)!
  //create a new filename for the lod
  const nuRelativePath = fileName.replace(/\.[^.]*$/, `_${mesh.name}.gltf`)
  const nuFileName = nuRelativePath.split('/').pop()!.split('.').shift()!
  const lodURL = rootSrc.replace(/(.*)\/([^/]*)\.[^.]*$/, `$1/model-resources/${nuFileName}/${nuFileName}.gltf`)
  const gltf = await gltfExporter.parseAsync(toExport, {
    binary: false,
    embedImages: false,
    includeCustomExtensions: true,
    path: lodURL,
    resourceURI: '..'
  })
  const [, , , nuNuRelativePath] = pathResolver().exec(lodURL)!
  const file = new File([JSON.stringify(gltf)], nuNuRelativePath)
  const urls = await Promise.all(uploadProjectFiles(projectName, [file]).promises)
  const result = urls[0][0]
  return Promise.resolve(result)
}

export function convertToScaffold(entity: Entity) {
  const modelComponent = getComponent(entity, ModelComponent)
  modelComponent.scene &&
    iterateObject3D(modelComponent.scene, (mesh: Mesh | InstancedMesh) => {
      if (!mesh?.isMesh) return
      mesh.geometry = new BufferGeometry()
      mesh.material = new MeshBasicMaterial()
    })
  const scaffoldPath = modelComponent.src.replace(/(\.[^.]*$)/, '_scaffold$1')
  exportGLTF(entity, scaffoldPath).then(() => {
    getMutableComponent(entity, ModelComponent).src.set(scaffoldPath)
    LODComponent.lodsByEntity[entity].value?.map((lodEntity) => {
      const lodComponent = getMutableComponent(lodEntity, LODComponent)
      lodComponent.levels.map((level) => {
        level.model.set(null)
        removeMaterialSource({
          path: level.src.value,
          type: SourceType.MODEL
        })
        level.loaded.set(false)
      })
    })
  })
}
