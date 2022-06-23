import { Color, Texture } from 'three'

export function extractDefaults(defaultArgs) {
  return formatMaterialArgs(
    Object.fromEntries(Object.entries(defaultArgs).map(([k, v]: [string, any]) => [k, v.default])),
    defaultArgs
  )
}

export function formatMaterialArgs(args, defaultArgs: any = undefined) {
  if (!args) return args
  return Object.fromEntries(
    Object.entries(args).map(([k, v]: [string, any]) => {
      if (!!defaultArgs && defaultArgs[k]) {
        switch (defaultArgs[k].type) {
          case 'color':
            return [k, (v as Color).isColor ? v : new Color(v)]
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
  )
}
