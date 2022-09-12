import { Material, Mesh } from 'three'

import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { MaterialInstanceComponent } from '../components/MaterialInstanceComponent'
import { MaterialLibrary } from '../MaterialLibrary'

export function createMaterialInstance(mesh: Mesh, material: Material) {
  if (!MaterialLibrary.materials.has(material.uuid)) {
    throw new Error('Could not find material ' + material + ' in Material Library')
  }
  const entity = createEntity()
  addComponent(entity, MaterialInstanceComponent, {
    material: material.uuid,
    mesh
  })
}
