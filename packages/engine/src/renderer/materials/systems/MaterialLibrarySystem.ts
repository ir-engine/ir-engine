import { World } from '../../../ecs/classes/World'
import { defineQuery } from '../../../ecs/functions/ComponentFunctions'
import { MaterialComponent } from '../components/MaterialComponent'
import { MaterialInstanceComponent } from '../components/MaterialInstanceComponent'
import { MaterialPrototypeComponent } from '../components/MaterialPrototypeComponent'
import { updateMaterial } from '../functions/MaterialFunctions'
import { updateMaterialPrototype } from '../functions/MaterialPrototypeFunctions'
import { initializeMaterialLibrary } from '../MaterialLibrary'

export default async function MaterialLibrarySystem(world: World) {
  initializeMaterialLibrary()

  const prototypeQuery = defineQuery([MaterialPrototypeComponent])
  const materialQuery = defineQuery([MaterialComponent])
  const instanceQuery = defineQuery([MaterialInstanceComponent])

  return () => {
    prototypeQuery.enter().map(updateMaterialPrototype)
    materialQuery.enter().map(updateMaterial)
  }
}
