import matches, { Validator } from 'ts-matches'

import { defineAction } from '@xrengine/hyperflux'

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
import { registerMaterialPrototype } from './functions/Utilities'

export type MaterialLibraryType = {
  prototypes: Map<string, MaterialPrototypeComponentType>
  materials: Map<string, MaterialComponentType>
  sources: Map<string, MaterialSourceComponentType>
}

export const MaterialLibrary: MaterialLibraryType = {
  prototypes: new Map(),
  materials: new Map(),
  sources: new Map()
}

export const MaterialLibraryActions = {
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
    ShaderMaterial
  ].map(registerMaterialPrototype)
}
