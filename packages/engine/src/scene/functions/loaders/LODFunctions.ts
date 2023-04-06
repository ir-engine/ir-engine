import { DynamicDrawUsage, InstancedBufferAttribute, InstancedMesh, Material, Matrix4, Mesh, Object3D } from 'three'

import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'
import { NO_PROXY } from '@etherealengine/hyperflux'

import { addOBCPlugin } from '../../../common/functions/OnBeforeCompilePlugin'
import { Entity } from '../../../ecs/classes/Entity'
import { ComponentType, getMutableComponent } from '../../../ecs/functions/ComponentFunctions'
import { Object3DWithEntity } from '../../components/GroupComponent'
import { LODComponent } from '../../components/LODComponent'
import { ModelComponent } from '../../components/ModelComponent'

/**
 * Processes a loaded LOD level, adding it to the entity's group and adding instanced attributes if necessary
 * @param entity : entity to add the level to
 * @param index : index of the level in the LODComponent.levels array
 * @returns
 */
export function processLoadedLODLevel(entity: Entity, index: number, mesh: Mesh) {
  if (mesh === null) {
    console.warn('trying to process an empty model file')
    return
  }
  const component = getMutableComponent(entity, LODComponent)
  const targetModel = getMutableComponent(component.target.value, ModelComponent)
  const level = component.levels[index]
  /*if (!level.loaded.value) {
    console.warn("trying to process a LOD level that hasn't been loaded yet")
    return
  }*/
  const lodComponent = getMutableComponent(entity, LODComponent)
  let loadedModel: Object3D | null = lodComponent.levels.find((level) => level.loaded.value)?.model.value ?? null

  //if model is an instanced mesh, add the lodIndex instanced attribute
  if (mesh instanceof InstancedMesh) {
    mesh.instanceMatrix.setUsage(DynamicDrawUsage)
    mesh.instanceMatrix.needsUpdate = true

    if (component.instanced.value) {
      //if the lodComponent does not have instanced positions defined, create them based on this model's instance matrix
      if (component.instanceMatrix.value.array.length === 0) {
        const transforms = new Float32Array(mesh.count * 16)
        for (let i = 0; i < mesh.count; i++) {
          const matrix = new Matrix4()
          mesh.getMatrixAt(i, matrix)
          for (let j = 0; j < 16; j++) {
            transforms[i * 16 + j] = matrix.elements[j]
          }
        }
        component.instanceMatrix.set(new InstancedBufferAttribute(transforms, 16))
        component.instanceLevels.set(new InstancedBufferAttribute(new Uint8Array(mesh.count), 1))
      } else {
        //if the lodComponent does have instanced positions defined, set the model's instance matrix to it
        mesh.instanceMatrix = component.instanceMatrix.value
      }
      mesh.geometry.setAttribute('lodIndex', component.instanceLevels.get(NO_PROXY))
      const materials: Material[] = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      materials.forEach((material) => {
        //add a shader plugin to clip the model if it's not the current level
        addOBCPlugin(material, {
          id: 'lod-culling',
          priority: 1,
          compile: (shader, renderer) => {
            shader.vertexShader = shader.vertexShader.replace(
              '#define STANDARD',
              `
  #define STANDARD
  attribute float lodIndex;
  varying float vDoClip;
`
            )
            shader.vertexShader = shader.vertexShader.replace(
              '#include <fog_vertex>',
              `
  #include <fog_vertex>
  vDoClip = float(lodIndex != ${index}.0);
`
            )
            shader.fragmentShader = shader.fragmentShader.replace(
              'void main() {\n',
              'varying float vDoClip;\nvoid main() {\nif (vDoClip > 0.0) discard;\n'
            )
          }
        })
      })
    }
  } else {
    if (component.instanced.value) {
      //if the lodComponent has instanced positions defined, create an instanced version of this model with the same positions
      const instancedModel = new InstancedMesh(mesh.geometry, mesh.material, component.instanceMatrix.value.count)
      instancedModel.instanceMatrix = component.instanceMatrix.get(NO_PROXY)
      mesh.parent && mesh.parent.add(instancedModel)
      instancedModel.matrix.copy(mesh.matrix)
      instancedModel.updateMatrixWorld(true)
      mesh.removeFromParent()
      level.model.set(instancedModel)
    } else {
      //if the model is not instanced, and the lodComponent does not have instanced positions defined, create singletons based on this model's position
      if (component.instanceMatrix.value.array.length === 0) {
        component.instanceMatrix.set(new InstancedBufferAttribute(new Float32Array([...mesh.matrix.elements]), 16))
        component.instanceLevels.set(new InstancedBufferAttribute(new Uint8Array([index]), 1))
      } else {
        //if the lodComponent does have a matrix defined, set the loaded model's matrix to it
        let removeLoaded = () => {}
        if (!loadedModel) {
          loadedModel = objectFromLodPath(targetModel.value, component.lodPath.value)
          removeLoaded = () => {
            loadedModel?.removeFromParent()
          }
        } else {
          console.log('loaded model exists')
        }
        if (loadedModel) {
          loadedModel.parent?.add(mesh)
          mesh.position.copy(loadedModel.position)
          mesh.quaternion.copy(loadedModel.quaternion)
          mesh.scale.copy(loadedModel.scale)
          mesh.updateMatrixWorld(true)
          mesh.updateMatrix()
        }
        removeLoaded()
      }
    }
  }
}

export type LODPath = OpaqueType<'LODPath'> & string

export function getLodPath(object: Object3D): LODPath {
  let walker: Object3D | null = object
  let path = ''
  while (walker !== null && !(walker as Object3DWithEntity).entity) {
    if (walker.userData['lodPath']) {
      path = `${walker.userData['lodPath']}/${path}`
      break
    }
    path = `${walker.name}/${path}`
    walker = walker.parent
  }
  object.userData['lodPath'] = path
  return path as LODPath
}

export function objectFromLodPath(model: ComponentType<typeof ModelComponent>, path: LODPath): Object3D {
  let walker: Object3D | null = model.scene
  const pathParts = path.split('/')
  pathParts.pop()
  while (pathParts.length > 0) {
    const part = pathParts.pop()
    if (!part) break
    walker = walker?.children.find((child) => child.name === part) ?? null
  }
  const result = walker ?? model.scene
  if (!result) {
    throw new Error(`Could not find object from path ${path} in model ${model.scene}`)
  }
  return result
}
