import { World } from '../../../ecs/classes/World'
import { defineQuery, removeQuery } from '../../../ecs/functions/ComponentFunctions'
import { MaterialComponent } from '../components/MaterialComponent'
import { MaterialPrototypeComponent } from '../components/MaterialPrototypeComponent'
import { updateMaterial } from '../functions/MaterialFunctions'
import { updateMaterialPrototype } from '../functions/MaterialPrototypeFunctions'
import { initializeMaterialLibrary, MaterialLibrary } from '../MaterialLibrary'

export default async function MaterialLibrarySystem(world: World) {
  initializeMaterialLibrary()

  const prototypeQuery = defineQuery([MaterialPrototypeComponent])
  const materialQuery = defineQuery([MaterialComponent])

  const execute = () => {
    prototypeQuery.enter().map(updateMaterialPrototype)
    materialQuery.enter().map(updateMaterial)
  }

  const cleanup = async () => {
    removeQuery(world, prototypeQuery)
    removeQuery(world, materialQuery)
    // todo, to make extensible only clear those initialized in initializeMaterialLibrary
    MaterialLibrary.materials.clear()
    MaterialLibrary.prototypes.clear()
  }

  return { execute, cleanup }
}
