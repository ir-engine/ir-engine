import { Material, Mesh, Object3D } from 'three'

import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import UpdateableObject3D from '@xrengine/engine/src/scene/classes/UpdateableObject3D'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { UpdatableComponent } from '@xrengine/engine/src/scene/components/UpdatableComponent'

import { Engine } from '../../ecs/classes/Engine'
import { MaterialOverrideComponentType } from '../../scene/components/MaterialOverrideComponent'
import { MatRend } from '../../scene/systems/MaterialOverrideSystem'
import { MaterialLibrary } from './MaterialLibrary'

export type MaterialParms = {
  material: Material
  update: (delta: number) => void
}

export enum PatternTarget {
  OBJ3D,
  MESH,
  MATERIAL
}

function checkMatch(toCheck: string, assignment: MaterialOverrideComponentType): boolean {
  switch (typeof assignment.pattern) {
    case 'string':
      return toCheck.includes(assignment.pattern as string)
    case 'object':
      return (assignment.pattern as RegExp).test(toCheck)
    default:
      return false
  }
}

export async function assignMaterial(override: MaterialOverrideComponentType): Promise<[MatRend[], MaterialParms]> {
  const result: MatRend[] = []
  //first retrieve material to build assignment
  const matParm: MaterialParms = await MaterialLibrary[override.materialID]()
  const target = getComponent(override.targetEntity, Object3DComponent)?.value
  if (!target) {
    console.error('Failed material override for override', override, ': target Object3D does not exist')
  }
  const root = getComponent(override.targetEntity, Object3DComponent).value as UpdateableObject3D
  root.traverse((obj3d) => {
    let isMatch = false
    switch (override.patternTarget) {
      case PatternTarget.OBJ3D:
        isMatch = checkMatch(obj3d.name, override)
        break
      case PatternTarget.MESH:
        if ((obj3d as Mesh)?.isMesh) {
          isMatch = checkMatch(obj3d.name, override)
        }
        break
      case PatternTarget.MATERIAL:
        let mesh = obj3d as Mesh
        if (mesh?.isMesh && mesh.material) {
          let mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          isMatch = mats.find((mat) => checkMatch(mat.name, override)) !== undefined
        }
        break
    }
    if (isMatch) {
      let mesh: Mesh | undefined
      switch (override.patternTarget) {
        case PatternTarget.OBJ3D:
          mesh = obj3d.children?.find((child: Mesh) => child.isMesh) as Mesh | undefined
          break
        case PatternTarget.MESH:
          mesh = obj3d as Mesh
          break
        case PatternTarget.MATERIAL:
          mesh = obj3d as Mesh
          break
      }
      if (!mesh) return
      result.push({ mesh: mesh, material: mesh.material })
      mesh.material = matParm.material
    }
  })
  return [result, matParm]
}
