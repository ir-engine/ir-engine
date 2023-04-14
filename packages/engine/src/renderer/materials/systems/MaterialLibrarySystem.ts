import { useEffect } from 'react'

import { createActionQueue, getMutableState } from '@etherealengine/hyperflux'

import { defineSystem } from '../../../ecs/functions/SystemFunctions'
import { registerMaterial, registerMaterialPrototype } from '../functions/MaterialLibraryFunctions'
import { initializeMaterialLibrary, MaterialLibraryActions, MaterialLibraryState } from '../MaterialLibrary'

const registerMaterialQueue = createActionQueue(MaterialLibraryActions.RegisterMaterial.matches)
const registerPrototypeQueue = createActionQueue(MaterialLibraryActions.RegisterPrototype.matches)

const execute = () => {
  for (const action of registerPrototypeQueue()) {
    registerMaterialPrototype(action.$prototype)
  }
  for (const action of registerMaterialQueue()) {
    registerMaterial(action.material, action.src)
  }
}

const reactor = () => {
  useEffect(() => {
    initializeMaterialLibrary()
    return () => {
      const materialLibraryState = getMutableState(MaterialLibraryState)
      // todo, to make extensible only clear those initialized in initializeMaterialLibrary
      materialLibraryState.materials.set({})
      materialLibraryState.prototypes.set({})
    }
  }, [])
  return null
}

export const MaterialLibrarySystem = defineSystem({
  uuid: 'ee.engine.scene.MaterialLibrarySystem',
  execute,
  reactor
})
