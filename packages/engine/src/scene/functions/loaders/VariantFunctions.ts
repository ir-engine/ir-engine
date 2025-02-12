import { InstancedMesh, Material, Object3D, Vector3 } from 'three'

import { ComponentType, getComponent, getMutableComponent, hasComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { addOBCPlugin } from '@ir-engine/spatial/src/common/functions/OnBeforeCompilePlugin'
import {
  addObjectToGroup,
  GroupComponent,
  removeObjectFromGroup
} from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { isMobileXRHeadset } from '@ir-engine/spatial/src/xr/XRState'

import { getGLTFAsync } from '../../../assets/functions/resourceLoaderHooks'
import { InstancingComponent } from '../../components/InstancingComponent'
import { Heuristic, VariantComponent, VariantLevel } from '../../components/VariantComponent'
import getFirstMesh from '../../util/meshUtils'

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

function getMeshVariant(entity: Entity, variantComponent: ComponentType<typeof VariantComponent>): string | null {
  if (variantComponent.heuristic === Heuristic.DEVICE) {
    const targetDevice = isMobileXRHeadset ? 'XR' : isMobile ? 'MOBILE' : 'DESKTOP'
    //get model src to mobile variant src
    const deviceVariant = variantComponent.levels.find((level) => level.metadata['device'] === targetDevice)
    if (deviceVariant) return deviceVariant.src
  }

  return null
}

export async function setMeshVariant(entity: Entity) {
  const variantComponent = getComponent(entity, VariantComponent)
  const meshComponent = getComponent(entity, MeshComponent)

  const src = getMeshVariant(entity, variantComponent)
  if (!src) return
  const [gltf] = await getGLTFAsync(src, entity)
  if (!gltf) return
  const mesh = getFirstMesh(gltf.scene)
  if (!mesh) return
  if (!hasComponent(entity, MeshComponent)) return
  meshComponent.geometry = mesh.geometry
  meshComponent.material = mesh.material
  getMutableComponent(entity, MeshComponent).set((val) => val) // reactivly update mesh
}

export async function setInstancedMeshVariant(entity: Entity) {
  const variantComponent = getComponent(entity, VariantComponent)
  const meshComponent = getComponent(entity, MeshComponent)
  const instancingComponent = getComponent(entity, InstancingComponent)
  const transformComponent = getComponent(entity, TransformComponent)
  if (variantComponent.heuristic === Heuristic.DEVICE) {
    const targetDevice = isMobileXRHeadset ? 'XR' : isMobile ? 'MOBILE' : 'DESKTOP'
    //set model src to mobile variant src
    const deviceVariant = variantComponent.levels.find((level) => level.metadata['device'] === targetDevice)
    if (!deviceVariant) return
    const [gltf] = await getGLTFAsync(deviceVariant.src, entity)
    if (!gltf) return
    const mesh = getFirstMesh(gltf.scene)
    if (!mesh) return
    if (!hasComponent(entity, MeshComponent)) return
    meshComponent.geometry = mesh.geometry
    meshComponent.material = mesh.material
    getMutableComponent(entity, MeshComponent).set((val) => val) // reactivly update mesh
  } else if (variantComponent.heuristic === Heuristic.DISTANCE) {
    const referencedVariants: VariantLevel[] = []
    const variantIndices: number[] = []
    const cameraPosition = getComponent(Engine.instance.cameraEntity, TransformComponent).position
    const position = new Vector3()
    //complex solution: load only variants in range
    /*for (let i = 0; i < instancingComponent.instanceMatrix.count; i++) {
      //for each level, check if distance is in range
      position.set(
        instancingComponent.instanceMatrix.array[i * 16 + 12],
        instancingComponent.instanceMatrix.array[i * 16 + 13],
        instancingComponent.instanceMatrix.array[i * 16 + 14]
      )
      position.applyMatrix4(transformComponent.matrix)
      const distanceSq = cameraPosition.distanceToSquared(position)
      for (let j = 0; j < variantComponent.levels.length; j++) {
        const level = variantComponent.levels[j]
        const minDistance = Math.pow(level.metadata['minDistance'], 2)
        const maxDistance = Math.pow(level.metadata['maxDistance'], 2)
        const useLevel = minDistance <= distanceSq && distanceSq <= maxDistance
        if (useLevel) {
          if (!referencedVariants.includes(level)) {
            referencedVariants.push(level)
            variantIndices.push(j)
          }
        }
      }
    }*/

    //naive solution: load all variants
    for (let i = 0; i < variantComponent.levels.length; i++) {
      referencedVariants.push(variantComponent.levels[i])
      variantIndices.push(i)
    }
    const group = getComponent(entity, GroupComponent)
    const loadedVariants: VariantLevel[] = []
    //for levels in range, check if already loaded
    for (let i = 0; i < group.length; i++) {
      const loadedElement = group[i]
      if (!loadedElement.userData['variant']) continue
      const elementVariantData = loadedElement.userData['variant']
      const loadedVariant = referencedVariants.find(
        (variant, index) =>
          //if already loaded, check that the src and index are the same
          variant.src === elementVariantData.src && variantIndices[index] === elementVariantData.index
      )
      if (loadedVariant) {
        loadedVariants.push(loadedVariant)
        continue
      }
      //if not referenced or src is different, remove from group
      removeObjectFromGroup(entity, loadedElement)
    }
    for (let i = 0; i < referencedVariants.length; i++) {
      const referencedVariant = referencedVariants[i]
      if (loadedVariants.includes(referencedVariant)) continue //already loaded
      //if not already loaded, load src
      //add a placeholder element with src and index to group until actual variant loads
      const placeholder = new Object3D()
      placeholder.userData['variant'] = { src: referencedVariant.src, index: variantIndices[i] }
      addObjectToGroup(entity, placeholder)
      const [gltf] = await getGLTFAsync(referencedVariant.src, entity)
      if (!gltf) return
      const minDistance = referencedVariant.metadata['minDistance']
      const maxDistance = referencedVariant.metadata['maxDistance']
      const mesh = getFirstMesh(gltf.scene)
      if (!mesh) return
      //convert to instanced mesh, using existing instance matrix
      const instancedMesh =
        mesh instanceof InstancedMesh
          ? mesh
          : new InstancedMesh(mesh.geometry, mesh.material, instancingComponent.instanceMatrix.count)
      instancedMesh.instanceMatrix = instancingComponent.instanceMatrix
      instancedMesh.frustumCulled = false

      //add distance culling shader plugin
      const materials: Material[] = Array.isArray(instancedMesh.material)
        ? instancedMesh.material
        : [instancedMesh.material]
      for (const material of materials) {
        addOBCPlugin(material, {
          id: 'lod-culling',
          priority: 1,
          compile: (shader, renderer) => {
            shader.fragmentShader = shader.fragmentShader.replace(
              'void main() {\n',
              `
      void main() {
        float maxDistance = ${maxDistance.toFixed(1)};
        float minDistance = ${minDistance.toFixed(1)};
        // Calculate the camera distance from the geometry
        float cameraDistance = length(vViewPosition);
        // Discard fragments outside the minDistance and maxDistance range
        if (cameraDistance <= minDistance || cameraDistance >= maxDistance) {
          discard;
        }
    `
            )
          }
        })
      }
      //add variant metadata to mesh
      instancedMesh.userData['variant'] = {
        src: referencedVariant.src,
        index: variantIndices[i]
      }
      //remove placeholder
      removeObjectFromGroup(entity, placeholder)
      //add to group
      addObjectToGroup(entity, instancedMesh)
    }
  }
}
