import { Material, Mesh } from 'three'

import { getState } from '@etherealengine/hyperflux'

import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { MaterialInstanceComponent } from '../components/MaterialInstanceComponent'
import { MaterialLibraryState } from '../MaterialLibrary'

export function createMaterialInstance(mesh: Mesh, material: Material) {
  if (!getState(MaterialLibraryState).materials[material.uuid]) {
    throw new Error('Could not find material ' + material + ' in Material Library')
  }
  const entity = createEntity()
  addComponent(entity, MaterialInstanceComponent, {
    material: material.uuid,
    mesh
  })
}
