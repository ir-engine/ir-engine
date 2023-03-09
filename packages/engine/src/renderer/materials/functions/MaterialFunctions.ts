import { Mesh, Object3D } from 'three'

import multiLogger from '@etherealengine/common/src/logger'

import { Engine } from '../../../ecs/classes/Engine'
import iterateObject3D from '../../../scene/util/iterateObject3D'
import { getMaterialLibrary, MaterialLibraryState } from '../MaterialLibrary'

export function dedupMaterials() {
  const materialTable = Object.entries(getMaterialLibrary().materials.value)
  materialTable.map(([uuid, materialComponent], i) => {
    for (let j = 0; j < i; j++) {
      const [uuid2, materialComponent2] = materialTable[j]
      if (
        materialComponent.prototype === materialComponent2.prototype &&
        Object.entries(materialComponent.parameters).every(([k, v]) => {
          const v2 = materialComponent2.parameters[k]
          if (!([null, undefined] as any[]).includes(v) && typeof v2?.equals === 'function') {
            return v2.equals(v)
          }
          return v2 === v
        })
      ) {
        multiLogger.info('found duplicate material')
        //change every instance of material1 to material2
        Engine.instance.scene.traverse((mesh: Mesh) => {
          if (!mesh?.isMesh) return
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          materials.map((material, i) => {
            if (!Array.isArray(mesh.material)) {
              mesh.material = material === materialComponent.material ? materialComponent2.material : material
            } else {
              mesh.material = mesh.material.map((material) =>
                material === materialComponent.material ? materialComponent2.material : material
              )
            }
          })
        })
      }
    }
  })
}
