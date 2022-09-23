import { SeedRandom, stringHash } from '../../common/functions/MathFunctions'
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
    MeshToonMaterial,
    ShaderMaterial
  ].map((prototype) => {
    MaterialLibrary.prototypes.set(prototype.prototypeId, prototype)
    //create default material from prototype
    const parameters = extractDefaults(prototype.arguments)
    const material = new prototype.baseMaterial(parameters)
    //set material name to prototype
    material.name = prototype.prototypeId
    //set uuid to pseudorandom value based on name
    material.uuid = `${SeedRandom(stringHash(material.name))}`
    MaterialLibrary.materials.set(material.uuid, {
      material,
      parameters,
      prototype: prototype.prototypeId,
      src: { type: 'MATERIAL_LIBRARY' }
    })
  })
}
