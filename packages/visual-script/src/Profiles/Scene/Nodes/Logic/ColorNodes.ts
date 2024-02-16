import { makeInNOutFunctionDesc } from '../../../../VisualScriptModule.js'
import {
  hexToRGB,
  hslToRGB,
  rgbToHex,
  rgbToHSL,
  Vec3,
  vec3Add,
  vec3Equals,
  vec3Mix,
  vec3MultiplyByScalar,
  vec3Negate,
  vec3Subtract
} from '../../Values/Internal/Vec3.js'

export const Constant = makeInNOutFunctionDesc({
  name: 'math/color/constant',
  label: 'Color',
  in: ['color'],
  out: 'color',
  exec: (a: Vec3) => a
})

export const Create = makeInNOutFunctionDesc({
  name: 'math/color/convert/toColor/rgb',
  label: 'RGB To Color',
  in: [{ r: 'float' }, { g: 'float' }, { b: 'float' }],
  out: 'color',
  exec: (r: number, g: number, b: number) => new Vec3(r, g, b)
})

export const Elements = makeInNOutFunctionDesc({
  name: 'math/color/toRgb',
  label: 'Color to RGB',
  in: ['color'],
  out: [{ r: 'float' }, { g: 'float' }, { b: 'float' }],
  exec: (a: Vec3) => {
    return { r: a.x, g: a.y, b: a.z }
  }
})

export const Add = makeInNOutFunctionDesc({
  name: 'math/color/basic/add',
  label: '+',
  in: ['color', 'color'],
  out: 'color',
  exec: vec3Add
})

export const Subtract = makeInNOutFunctionDesc({
  name: 'math/color/basic/subtract',
  label: '-',
  in: ['color', 'color'],
  out: 'color',
  exec: vec3Subtract
})

export const Negate = makeInNOutFunctionDesc({
  name: 'math/color/negate',
  label: '-',
  in: ['color'],
  out: 'color',
  exec: vec3Negate
})

export const Scale = makeInNOutFunctionDesc({
  name: 'math/color/basic/scale',
  label: '×',
  in: ['color', 'float'],
  out: 'color',
  exec: vec3MultiplyByScalar
})

export const Mix = makeInNOutFunctionDesc({
  name: 'math/color/basic/mix',
  label: '÷',
  in: [{ a: 'color' }, { b: 'color' }, { t: 'float' }],
  out: 'color',
  exec: vec3Mix
})

export const HslToColor = makeInNOutFunctionDesc({
  name: 'math/color/convert/toColor/hsl',
  label: 'HSL to Color',
  in: ['vec3'],
  out: 'color',
  exec: hslToRGB
})

export const ColorToHsl = makeInNOutFunctionDesc({
  name: 'math/color/toHsl',
  label: 'Color to HSL',
  in: ['color'],
  out: 'vec3',
  exec: rgbToHSL
})

export const HexToColor = makeInNOutFunctionDesc({
  name: 'math/color/convert/toColor/hex',
  label: 'HEX to Color',
  in: ['float'],
  out: 'color',
  exec: hexToRGB
})

export const ColorToHex = makeInNOutFunctionDesc({
  name: 'math/color/toHex',
  label: 'Color to HEX',
  in: ['color'],
  out: 'float',
  exec: rgbToHex
})

export const Equal = makeInNOutFunctionDesc({
  name: 'math/color/compare/equal',
  label: '=',
  in: [{ a: 'color' }, { b: 'color' }, { tolerance: 'float' }],
  out: 'boolean',
  exec: vec3Equals
})
