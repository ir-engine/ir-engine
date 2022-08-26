import {
  Color,
  Material,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshMatcapMaterial,
  MeshStandardMaterial,
  Texture
} from 'three'

import { DefaultArguments } from './MaterialLibrary'

export function extractDefaults(defaultArgs) {
  return formatMaterialArgs(
    Object.fromEntries(Object.entries(defaultArgs).map(([k, v]: [string, any]) => [k, v.default])),
    defaultArgs
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

export function materialTypeToLibraryName(type: string): string {
  switch (type) {
    case 'MeshMatcapMaterial':
      return 'Matcap'
    case 'MeshStandardMaterial':
      return 'Standard'
    case 'MeshBasicMaterial':
      return 'Basic'
    case 'MeshLambertMaterial':
      return 'Lambert'
    case 'MeshPhongMaterial':
      return 'Phong'
    default:
      return type
  }
}

export function materialTypeToDefaultArgs(type: string): Object | undefined {
  return DefaultArguments[materialTypeToLibraryName(type)]
}

export function materialToDefaultArgs(material: Material): Object | undefined {
  return materialTypeToDefaultArgs(material.type)
}
