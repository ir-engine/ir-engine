import {
  Color,
  Material,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshMatcapMaterial,
  MeshStandardMaterial,
  Texture
} from 'three'

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

export function materialTypeToDefaultArgs(type: string): Object {
  const material = MaterialLibrary.materials.get(type)
  if (!material) throw new Error('could not find Material ' + type)
  const prototype = MaterialLibrary.prototypes.get(material.prototype)
  if (!prototype) throw new Error('could not find Material Prototype for Material ' + material)
  return injectDefaults(prototype.arguments, material.parameters)
}

export function materialTypeToFactory(type: string): (parms: any) => Material {
  const material = MaterialLibrary.materials.get(type)
  if (!material) throw new Error('could not find Material ' + type)
  const prototype = MaterialLibrary.prototypes.get(material.prototype)
  if (!prototype) throw new Error('could not find Material Prototype for Material ' + material)
  return (parms) => {
    const result = new prototype.baseMaterial({ ...material.parameters, ...parms })
    if (prototype.onBeforeCompile) {
      result.onBeforeCompile = prototype.onBeforeCompile
      result.needsUpdate = true
    }
    return result
  }
}

export function materialToDefaultArgs(material: Material): Object {
  return materialTypeToDefaultArgs(material.type)
}
