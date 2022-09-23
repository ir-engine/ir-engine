import { MaterialComponentType } from './components/MaterialComponent'
import { MaterialPrototypeComponentType } from './components/MaterialPrototypeComponent'
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
  sources: Map<string, string[]>
}

export const MaterialLibrary: MaterialLibraryType = {
  prototypes: new Map<string, MaterialPrototypeComponentType>(),
  materials: new Map<string, MaterialComponentType>(),
  sources: new Map<string, string[]>()
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
