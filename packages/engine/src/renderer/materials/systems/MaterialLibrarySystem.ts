import { World } from '../../../ecs/classes/World'
import { defineQuery, removeQuery } from '../../../ecs/functions/ComponentFunctions'
import { MaterialComponent } from '../components/MaterialComponent'
import { MaterialPrototypeComponent } from '../components/MaterialPrototypeComponent'
import { initializeMaterialLibrary, MaterialLibrary } from '../MaterialLibrary'

export default async function MaterialLibrarySystem(world: World) {
  initializeMaterialLibrary()
  const cleanup = async () => {
    // todo, to make extensible only clear those initialized in initializeMaterialLibrary
    MaterialLibrary.materials.clear()
    MaterialLibrary.prototypes.clear()
  }

  return { execute: () => {}, cleanup }
}
