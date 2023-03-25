import { DynamicDrawUsage, InstancedBufferAttribute, InstancedMesh, Material, Matrix4, Mesh, Vector3 } from 'three'

import { NO_PROXY, State } from '@etherealengine/hyperflux'

import { addOBCPlugin } from '../../../common/functions/OnBeforeCompilePlugin'
import { insertAfterString, insertBeforeString } from '../../../common/functions/string'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, getMutableComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { addObjectToGroup } from '../../components/GroupComponent'
import { LODComponent, LODComponentType, LODLevel } from '../../components/LODComponent'
import { ModelComponent } from '../../components/ModelComponent'
import { NameComponent } from '../../components/NameComponent'
import iterateObject3D from '../../util/iterateObject3D'

/**
 * Processes a loaded LOD level, adding it to the entity's group and adding instanced attributes if necessary
 * @param entity : entity to add the level to
 * @param index : index of the level in the LODComponent.levels array
 * @returns
 */
export function processLoadedLODLevel(entity: Entity, index: number) {
  const component = getMutableComponent(entity, LODComponent)
  const level = component.levels[index]
  if (!level.loaded.value) {
    console.warn("trying to process a LOD level that hasn't been loaded yet")
    return
  }
  const model = level.model.get(NO_PROXY)
  if (model === null) {
    console.warn('trying to process an empty model file')
    return
  }
  //if model is an instanced mesh, add the lodIndex instanced attribute
  if (model instanceof InstancedMesh) {
    model.instanceMatrix.setUsage(DynamicDrawUsage)
    model.instanceMatrix.needsUpdate = true

    if (component.instanced.value) {
      //if the lodComponent does not have instanced positions defined, create them based on this model's instance matrix
      if (component.instancePositions.value.array.length === 0) {
        const positions = new Float32Array(model.count * 3)
        for (let i = 0; i < model.count; i++) {
          const matrix = new Matrix4()
          model.getMatrixAt(i, matrix)
          const position = new Vector3().applyMatrix4(matrix)
          positions[i * 3] = position.x
          positions[i * 3 + 1] = position.y
          positions[i * 3 + 2] = position.z
        }
        component.instancePositions.set(new InstancedBufferAttribute(positions, 3))
        component.instanceLevels.set(new InstancedBufferAttribute(new Uint8Array(model.count), 1))
      } else {
        //if the lodComponent does have instanced positions defined, set the model's instance matrix to it
        model.instanceMatrix = component.instancePositions.value
        model.updateMatrixWorld(true)
      }
      model.geometry.setAttribute('lodIndex', component.instanceLevels.get(NO_PROXY))
      const materials: Material[] = Array.isArray(model.material) ? model.material : [model.material]
      materials.forEach((material) => {
        //add a shader plugin to clip the model if it's not the current level
        addOBCPlugin(material, (shader, renderer) => {
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
        })
      })
    }
    //addObjectToGroup(entity, model)
  } else {
    if (component.instanced.value) {
      //if the lodComponent has instanced positions defined, create an instanced version of this model with the same positions
      const instancedModel = new InstancedMesh(model.geometry, model.material, component.instancePositions.value.count)
      instancedModel.instanceMatrix = component.instancePositions.get(NO_PROXY)
      model.parent && model.parent.add(instancedModel)
      instancedModel.matrix.copy(model.matrix)
      instancedModel.updateMatrixWorld(true)
      model.removeFromParent()
      level.model.set(instancedModel)
      //addObjectToGroup(entity, instancedModel)
    } else {
      //addObjectToGroup(entity, model)
    }
  }
}

/**
 * Iterates through a model's meshes and creates LODComponents for each one
 * @param entity : entity to add the LODs to
 * @returns array of generated LOD entities
 */
export function createLODsFromModel(entity: Entity): Entity[] {
  const model = getComponent(entity, ModelComponent)
  const lods: Entity[] = []
  model.scene &&
    iterateObject3D(
      model.scene,
      (mesh: Mesh) => {
        if (!mesh?.isMesh) return
        const lodEntity = createEntity()
        addComponent(lodEntity, LODComponent, {
          levels: [
            {
              model: mesh,
              distance: 0,
              loaded: true,
              src: ''
            }
          ],
          instanced: mesh instanceof InstancedMesh
        })
        addComponent(lodEntity, NameComponent, mesh.name)
        processLoadedLODLevel(lodEntity, 0)
        lods.push(lodEntity)
      },
      (mesh: Mesh) => mesh?.isMesh
    )
  return lods
}
