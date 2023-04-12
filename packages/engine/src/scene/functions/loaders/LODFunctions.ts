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
 * @param mesh : mesh to add to the entity
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

  const lodComponent = getMutableComponent(entity, LODComponent)
  let loadedModel: Object3D | null = lodComponent.levels.find((level) => level.loaded.value)?.model.value ?? null

  function addPlugin(mesh: Mesh) {
    delete mesh.geometry.attributes['lodIndex']
    delete mesh.geometry.attributes['_lodIndex']
    mesh.geometry.setAttribute('lodIndex', component.instanceLevels.get(NO_PROXY))
    const materials: Material[] = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    materials.forEach((material) => {
      addOBCPlugin(material, {
        id: 'lod-culling',
        priority: 1,
        compile: (shader, renderer) => {
          shader.vertexShader = shader.vertexShader.replace(
            'void main() {',
            `
  attribute float lodIndex;
  varying float vDoClip;
  void main() {
    vDoClip = float(lodIndex != ${index}.0);
    if (vDoClip == 0.0) {
`
          )
          shader.vertexShader = shader.vertexShader.replace(/\}[^}]*$/, `}}`)
          shader.fragmentShader = shader.fragmentShader.replace(
            'void main() {\n',
            'varying float vDoClip;\nvoid main() {\nif (vDoClip > 0.0) discard;\n'
          )
        }
      })
    })
  }

  let loadedMesh: Mesh | InstancedMesh = mesh

  if (mesh instanceof InstancedMesh) {
    mesh.instanceMatrix.setUsage(DynamicDrawUsage)
    mesh.instanceMatrix.needsUpdate = true
    if (component.instanced.value) {
      if (component.instanceMatrix.value.array.length === 0) {
        const transforms = new Float32Array(mesh.count * 16)
        const matrix = new Matrix4()
        for (let i = 0; i < mesh.count; i++) {
          mesh.getMatrixAt(i, matrix)
          for (let j = 0; j < 16; j++) {
            transforms[i * 16 + j] = matrix.elements[j]
          }
        }
        component.instanceMatrix.set(new InstancedBufferAttribute(transforms, 16))
        component.instanceLevels.set(new InstancedBufferAttribute(new Uint8Array(mesh.count), 1))
      } else {
        mesh.instanceMatrix = component.instanceMatrix.value
      }
    }
  } else if (component.instanced.value) {
    const instancedModel = new InstancedMesh(mesh.geometry, mesh.material, component.instanceMatrix.value.count)
    instancedModel.instanceMatrix = component.instanceMatrix.get(NO_PROXY)
    loadedMesh = instancedModel
  }

  let removeLoaded = () => {}
  if (!loadedModel) {
    loadedModel = objectFromLodPath(targetModel.value, component.lodPath.value)
    removeLoaded = () => {
      loadedModel?.removeFromParent()
    }
  }

  loadedMesh instanceof InstancedMesh && addPlugin(loadedMesh)
  level.model.set(loadedMesh)

  if (component.instanced.value) {
    if (component.instanceMatrix.value.array.length === 0) {
      component.instanceMatrix.set(new InstancedBufferAttribute(new Float32Array([...loadedMesh.matrix.elements]), 16))
      component.instanceLevels.set(new InstancedBufferAttribute(new Uint8Array([index]), 1))
    }
  }

  loadedModel.parent?.add(loadedMesh)
  loadedMesh.name = loadedModel.name
  loadedMesh.position.copy(loadedModel.position)
  loadedMesh.quaternion.copy(loadedModel.quaternion)
  loadedMesh.scale.copy(loadedModel.scale)
  loadedMesh.updateMatrixWorld(true)

  removeLoaded()
}

export type LODPath = OpaqueType<'LODPath'> & string

export function getLodPath(object: Object3D): LODPath {
  let walker: Object3D | null = object
  let path = ''
  while (walker !== null && !(walker as Object3DWithEntity).entity) {
    if (walker.userData['lodPath']) {
      path = `${walker.userData['lodPath']}${path ? `/${path}` : ''}`
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
  let prev: typeof walker = null
  const pathParts = path.split('/')
  while (pathParts.length > 0) {
    const part = pathParts.shift()
    if (!part) break
    prev = walker
    walker = walker?.children.find((child) => child.name === part) ?? null
  }
  if (!walker) {
    console.error('walker', walker, 'prev', prev)
    throw new Error(`Could not find object from path ${path} in model ${model.scene}`)
  }
  return walker
}
