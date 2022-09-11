import {
  Color,
  Material,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshMatcapMaterial,
  MeshStandardMaterial,
  Texture
} from 'three'

import { MaterialComponentType } from '../components/MaterialComponent'
import { MaterialPrototypeComponentType } from '../components/MaterialPrototypeComponent'
import { MaterialLibrary } from '../MaterialLibrary'

export function extractDefaults(defaultArgs) {
  return formatMaterialArgs(
    Object.fromEntries(Object.entries(defaultArgs).map(([k, v]: [string, any]) => [k, v.default])),
    defaultArgs
  )
}

export function injectDefaults(defaultArgs, values) {
  return Object.fromEntries(
    Object.entries(defaultArgs).map(([k, v]: [string, any]) => [k, { ...v, default: values[k] }])
  )
}

export function formatMaterialArgs(args, defaultArgs: any = undefined) {
  if (!args) return args
  return Object.fromEntries(
    Object.entries(args)
      .map(([k, v]: [string, any]) => {
        if (!!defaultArgs && defaultArgs[k]) {
          switch (defaultArgs[k].type) {
            case 'color':
              return [k, v ? ((v as Color).isColor ? v : new Color(v)) : undefined]
          }
        }
        const tex = v as Texture
        if (tex?.isTexture) {
          if (tex.source.data != undefined) {
            return [k, v]
          }
          return [k, undefined]
        }
        if (v === '') return [k, undefined]
        return [k, v]
      })
      .filter(([_, v]) => v !== undefined)
  )
}

export function materialFromId(matId: string): MaterialComponentType {
  const material = MaterialLibrary.materials.get(matId)
  if (!material) throw new Error('could not find Material ' + matId)
  return material
}

export function prototypeFromId(protoId: string): MaterialPrototypeComponentType {
  const prototype = MaterialLibrary.prototypes.get(protoId)
  if (!prototype) throw new Error('could not find Material Prototype for ID ' + protoId)
  return prototype
}

export function materialIdToDefaultArgs(matId: string): Object {
  const material = materialFromId(matId)
  const prototype = prototypeFromId(material.prototype)
  return injectDefaults(prototype.arguments, material.parameters)
}

export function materialIdToFactory(matId: string): (parms: any) => Material {
  const material = materialFromId(matId)
  const prototype = prototypeFromId(material.prototype)
  return (parms) => {
    const formattedParms = { ...material.parameters, ...parms }
    const result = new prototype.baseMaterial(formattedParms)
    if (prototype.onBeforeCompile) {
      result.onBeforeCompile = prototype.onBeforeCompile
      result.needsUpdate = true
    }
    MaterialLibrary.materials.set(result.uuid, {
      material: result,
      parameters: formattedParms,
      prototype: material.prototype
    })
    return result
  }
}

export function materialIdToPrototype(matId: string): MaterialPrototypeComponentType {
  return prototypeFromId(materialFromId(matId).prototype)
}

export function materialToDefaultArgs(material: Material): Object {
  try {
    return materialIdToDefaultArgs(material.uuid)
  } catch (e) {
    console.warn('Unregistered material', material, 'being added to library')
    const similarMaterial = [...MaterialLibrary.materials.values()].find(
      (matComp) => matComp.material.type === material.type
    )
    if (!similarMaterial) throw Error('unrecognized material prototype ' + material.type)
    const parameters = Object.fromEntries(Object.keys(similarMaterial.parameters).map((k) => [k, material[k]]))
    MaterialLibrary.materials.set(material.uuid, {
      material,
      parameters,
      prototype: similarMaterial.prototype
    })
    return materialIdToDefaultArgs(material.uuid)
  }
}
