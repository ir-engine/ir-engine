import { Material } from 'three'
import matches, { Validator } from 'ts-matches'

import {
  defineAction,
  defineState,
  dispatchAction,
  getMutableState,
  StateDefinition,
  useState
} from '@etherealengine/hyperflux'

import { MaterialComponentType } from './components/MaterialComponent'
import { MaterialPrototypeComponentType } from './components/MaterialPrototypeComponent'
import { MaterialSource, MaterialSourceComponentType } from './components/MaterialSource'
import MeshBasicMaterial from './constants/material-prototypes/MeshBasicMaterial.mat'
import MeshLambertMaterial from './constants/material-prototypes/MeshLambertMaterial.mat'
import MeshMatcapMaterial from './constants/material-prototypes/MeshMatcapMaterial.mat'
import MeshPhongMaterial from './constants/material-prototypes/MeshPhongMaterial.mat'
import MeshPhysicalMaterial from './constants/material-prototypes/MeshPhysicalMaterial.mat'
import MeshStandardMaterial from './constants/material-prototypes/MeshStandardMaterial.mat'
import MeshToonMaterial from './constants/material-prototypes/MeshToonMaterial.mat'
import { ShaderMaterial } from './constants/material-prototypes/ShaderMaterial.mat'
import { ShadowMaterial } from './constants/material-prototypes/ShadowMaterial.mat'
import { registerMaterialPrototype } from './functions/MaterialLibraryFunctions'

export type MaterialLibraryType = {
  prototypes: Record<string, MaterialPrototypeComponentType>
  materials: Record<string, MaterialComponentType>
  sources: Record<string, MaterialSourceComponentType>
}

export const MaterialLibraryState: StateDefinition<MaterialLibraryType> = defineState({
  name: 'MaterialLibraryState',
  initial: {
    prototypes: {},
    materials: {},
    sources: {}
  } as MaterialLibraryType
})
/**@deprecated use getMutableState directly instead */
export const getMaterialLibrary = () => getMutableState(MaterialLibraryState)
/**@deprecated use useHookstate(getMutableState(...) directly instead */
export const useMaterialLibrary = () => useState(getMaterialLibrary())

export const MaterialLibraryActions = {
  RegisterMaterial: defineAction({
    type: 'xre.assets.MaterialLibrary.REGISTER_MATERIAL',
    material: matches.object as Validator<unknown, Material>,
    src: matches.object as Validator<unknown, MaterialSource>
  }),
  RegisterPrototype: defineAction({
    type: 'xre.assets.MaterialLibrary.REGISTER_PROTOTYPE',
    $prototype: matches.object as Validator<unknown, MaterialPrototypeComponentType>
  }),
  RemoveSource: defineAction({
    type: 'xre.assets.MaterialLibrary.REMOVE_SOURCE',
    src: matches.object as Validator<unknown, MaterialSource>
  })
}

export function initializeMaterialLibrary() {
  //load default prototypes from source
  ;[
    MeshBasicMaterial,
    MeshStandardMaterial,
    MeshMatcapMaterial,
    MeshPhysicalMaterial,
    MeshLambertMaterial,
    MeshPhongMaterial,
    MeshToonMaterial,
    ShaderMaterial,
    ShadowMaterial
  ].map(registerMaterialPrototype)
}
