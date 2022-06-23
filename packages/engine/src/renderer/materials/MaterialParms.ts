import { Material, Mesh } from 'three'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import UpdateableObject3D from '@xrengine/engine/src/scene/classes/UpdateableObject3D'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'

import { MaterialOverrideComponentType } from '../../scene/components/MaterialOverrideComponent'
import { MatRend } from '../../scene/systems/MaterialOverrideSystem'
import { DefaultArguments, MaterialLibrary } from './MaterialLibrary'
import { formatMaterialArgs } from './Utilities'

export type MaterialParms = {
  material: Material
  update: (delta: number) => void
}

export const DudTexture = {
  isDud: true,
  isTexture: true
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

export function assignMaterial(override: MaterialOverrideComponentType): [MatRend[], MaterialParms] {
  const result: MatRend[] = []
  //first retrieve material to build assignment
  const factory = MaterialLibrary[override.materialID]

  if (!factory) {
    console.warn('Could not find factory function for material' + override.materialID)
    return [result, { material: new Material(), update: () => {} }]
  }
  const defaultArgs = DefaultArguments[override.materialID]
  const formattedArgs = formatMaterialArgs(override.args, defaultArgs)
  const matParm: MaterialParms = factory(formattedArgs)
  const target = getComponent(override.targetEntity!, Object3DComponent)?.value
  if (!target) {
    console.error('Failed material override for override', override, ': target Object3D does not exist')
  }
  const root = getComponent(override.targetEntity!, Object3DComponent).value as UpdateableObject3D
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
      const oldMat = mesh.material
      mesh.material = matParm.material
      result.push({ mesh: mesh, material: oldMat })
    }
  })
  return [result, matParm]
}
