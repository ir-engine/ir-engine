import { createActionQueue, getMutableState } from '@etherealengine/hyperflux'

import { registerMaterial, registerMaterialPrototype } from '../functions/MaterialLibraryFunctions'
import { initializeMaterialLibrary, MaterialLibraryActions, MaterialLibraryState } from '../MaterialLibrary'

export default async function MaterialLibrarySystem() {
  const materialLibraryState = getMutableState(MaterialLibraryState)
  const registerMaterialQueue = createActionQueue(MaterialLibraryActions.RegisterMaterial.matches)
  const registerPrototypeQueue = createActionQueue(MaterialLibraryActions.RegisterPrototype.matches)
  initializeMaterialLibrary()
  const execute = () => {
    registerPrototypeQueue().map((action) => {
      registerMaterialPrototype(action.$prototype)
    })
    registerMaterialQueue().map((action) => {
      registerMaterial(action.material, action.src)
    })
  }

  const cleanup = async () => {
    // todo, to make extensible only clear those initialized in initializeMaterialLibrary
    materialLibraryState.materials.set({})
    materialLibraryState.prototypes.set({})
  }

  return { execute, cleanup }
}
