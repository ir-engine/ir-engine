import { DynamicDrawUsage, InstancedBufferAttribute, InstancedMesh, Material, Matrix4, Mesh } from 'three'

import { NO_PROXY } from '@etherealengine/hyperflux'

import { addOBCPlugin } from '../../../common/functions/OnBeforeCompilePlugin'
import { Entity } from '../../../ecs/classes/Entity'
import { getMutableComponent } from '../../../ecs/functions/ComponentFunctions'
import { LODComponent } from '../../components/LODComponent'

/**
 * Processes a loaded LOD level, adding it to the entity's group and adding instanced attributes if necessary
 * @param entity : entity to add the level to
 * @param index : index of the level in the LODComponent.levels array
 * @returns
 */
export function processLoadedLODLevel(entity: Entity, index: number, model: Mesh) {
  if (model === null) {
    console.warn('trying to process an empty model file')
    return
  }
  const component = getMutableComponent(entity, LODComponent)
  const level = component.levels[index]
  /*if (!level.loaded.value) {
    console.warn("trying to process a LOD level that hasn't been loaded yet")
    return
  }*/
  const lodComponent = getMutableComponent(entity, LODComponent)
  const loadedModel = lodComponent.levels.find((level) => level.loaded.value)?.model.value ?? null

  //if model is an instanced mesh, add the lodIndex instanced attribute
  if (model instanceof InstancedMesh) {
    model.instanceMatrix.setUsage(DynamicDrawUsage)
    model.instanceMatrix.needsUpdate = true

    if (component.instanced.value) {
      //if the lodComponent does not have instanced positions defined, create them based on this model's instance matrix
      if (component.instanceMatrix.value.array.length === 0) {
        const transforms = new Float32Array(model.count * 16)
        for (let i = 0; i < model.count; i++) {
          const matrix = new Matrix4()
          model.getMatrixAt(i, matrix)
          for (let j = 0; j < 16; j++) {
            transforms[i * 16 + j] = matrix.elements[j]
          }
        }
        component.instanceMatrix.set(new InstancedBufferAttribute(transforms, 16))
        component.instanceLevels.set(new InstancedBufferAttribute(new Uint8Array(model.count), 1))
      } else {
        //if the lodComponent does have instanced positions defined, set the model's instance matrix to it
        model.instanceMatrix = component.instanceMatrix.value
        model.updateMatrixWorld(true)
      }
      model.geometry.setAttribute('lodIndex', component.instanceLevels.get(NO_PROXY))
      const materials: Material[] = Array.isArray(model.material) ? model.material : [model.material]
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
      const instancedModel = new InstancedMesh(model.geometry, model.material, component.instanceMatrix.value.count)
      instancedModel.instanceMatrix = component.instanceMatrix.get(NO_PROXY)
      model.parent && model.parent.add(instancedModel)
      instancedModel.matrix.copy(model.matrix)
      instancedModel.updateMatrixWorld(true)
      model.removeFromParent()
      level.model.set(instancedModel)
    } else {
      //if the model is not instanced, and the lodComponent does not have instanced positions defined, create singletons based on this model's position
      if (component.instanceMatrix.value.array.length === 0) {
        component.instanceMatrix.set(new InstancedBufferAttribute(new Float32Array([...model.matrix.elements]), 16))
        component.instanceLevels.set(new InstancedBufferAttribute(new Uint8Array([index]), 1))
      } else {
        //if the lodComponent does have a matrix defined, set the loaded model's matrix to it
        if (loadedModel) {
          loadedModel.parent?.add(model)
          model.matrix.copy(loadedModel.matrix)
          model.updateMatrixWorld(true)
          model.updateMatrix()
        }
      }
    }
  }
}
