import { MaterialComponentType } from './components/MaterialComponent'
import { MaterialPrototypeComponentType } from './components/MaterialPrototypeComponent'
import MeshBasicMaterial from './constants/material-prototypes/MeshBasicMaterial.mat'
import MeshLambertMaterial from './constants/material-prototypes/MeshLambertMaterial.mat'
import MeshMatcapMaterial from './constants/material-prototypes/MeshMatcapMaterial.mat'
import MeshPhongMaterial from './constants/material-prototypes/MeshPhongMaterial.mat'
import MeshPhysicalMaterial from './constants/material-prototypes/MeshPhysicalMaterial.mat'
import MeshStandardMaterial from './constants/material-prototypes/MeshStandardMaterial.mat'
import MeshToonMaterial from './constants/material-prototypes/MeshToonMaterial.mat'
import { extractDefaults, formatMaterialArgs } from './functions/Utilities'

export const MaterialLibrary = {
  prototypes: new Map<string, MaterialPrototypeComponentType>(),
  materials: new Map<string, MaterialComponentType>()
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
    MeshToonMaterial
  ].map((prototype) => {
    MaterialLibrary.prototypes.set(prototype.baseMaterial.name, prototype)
    //create default material from prototype
    const parameters = extractDefaults(prototype.arguments)
    const material = new prototype.baseMaterial(parameters)
    MaterialLibrary.materials.set(prototype.baseMaterial.name, {
      material,
      parameters,
      prototype: prototype.baseMaterial.name
    })
  })
}
