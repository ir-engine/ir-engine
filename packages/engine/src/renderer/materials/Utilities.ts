import { Texture } from 'three'

export function formatMaterialArgs(args) {
  if (!args) return args
  let _args = Object.entries(args).map(([k, v]) =>
    (v as Texture).isTexture && ((v as any).isDud || (v as Texture).source.data === null) ? [k, null] : [k, v]
  )
  _args = { ..._args }
  return _args
}
