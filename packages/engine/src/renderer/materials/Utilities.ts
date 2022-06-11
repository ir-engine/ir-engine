import { Texture } from 'three'

export function formatMaterialArgs(args) {
  if (!args) return args
  let _args = Object.entries(args).map(([k, v]) => {
    const tex = v as Texture
    if (tex.isTexture) {
      if (tex.source.data != undefined) {
        return [k, v]
      }
      return [k, undefined]
    }
    if (v === '') return [k, undefined]
    return [k, v]
  })
  _args = Object.fromEntries(_args)
  return _args
}
