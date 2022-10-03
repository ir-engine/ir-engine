import { Material } from 'three'

import { MaterialComponent } from '../components/MaterialComponent'
import { MaterialSource } from '../components/MaterialSource'
import { changeMaterialPrototype, getSourceMaterials, materialsFromSource } from './Utilities'

export async function batchChangeMaterialPrototype(src: MaterialSource, protoId: string) {
  materialsFromSource(src)?.map((materialComponent) => changeMaterialPrototype(materialComponent.material, protoId))
}

export function batchSetMaterialProperty(src: MaterialSource, field: string, value: any) {
  materialsFromSource(src)?.map((materialComponent) => {
    ;(materialComponent.material as any)[field] = value
    materialComponent.material.needsUpdate = true
  })
}
