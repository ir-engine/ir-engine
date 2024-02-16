import { makeInNOutFunctionDesc } from '../../../../VisualScriptModule.js'
import {
  Vec3,
  vec3Add,
  vec3Cross,
  vec3Dot,
  vec3Equals,
  vec3Length,
  vec3Mix,
  vec3MultiplyByScalar,
  vec3Negate,
  vec3Normalize,
  vec3Subtract
} from '../../Values/Internal/Vec3.js'

export const Constant = makeInNOutFunctionDesc({
  name: 'math/vec3/constant',
  label: 'Vec3',
  in: ['vec3'],
  out: 'vec3',
  exec: (a: Vec3) => a
})

export const Create = makeInNOutFunctionDesc({
  name: 'math/float/covert/toVec3',
  label: 'Float to Vec3',
  in: [{ x: 'float' }, { y: 'float' }, { z: 'float' }],
  out: 'vec3',
  exec: (x: number, y: number, z: number) => new Vec3(x, y, z)
})

export const Elements = makeInNOutFunctionDesc({
  name: 'math/vec3/convert/toFloat',
  label: 'Vec3 To Float',
  in: ['vec3'],
  out: [{ x: 'float' }, { y: 'float' }, { z: 'float' }],
  exec: (a: Vec3) => {
    return { x: a.x, y: a.y, z: a.z }
  }
})

export const Add = makeInNOutFunctionDesc({
  name: 'math/vec3/basic/add',
  label: '+',
  in: ['vec3', 'vec3'],
  out: 'vec3',
  exec: vec3Add
})

export const Subtract = makeInNOutFunctionDesc({
  name: 'math/vec3/basic/subtract',
  label: '-',
  in: ['vec3', 'vec3'],
  out: 'vec3',
  exec: vec3Subtract
})

export const Negate = makeInNOutFunctionDesc({
  name: 'math/vec3/negate',
  label: '-',
  in: ['vec3'],
  out: 'vec3',
  exec: vec3Negate
})

export const Scale = makeInNOutFunctionDesc({
  name: 'math/vec3/basic/scale',
  label: '×',
  in: ['vec3', 'float'],
  out: 'vec3',
  exec: vec3MultiplyByScalar
})

export const Length = makeInNOutFunctionDesc({
  name: 'math/vec3/length',
  label: 'Length',
  in: ['vec3'],
  out: 'float',
  exec: vec3Length
})

export const Normalize = makeInNOutFunctionDesc({
  name: 'math/vec3/normalize',
  label: 'Normalize',
  in: ['vec3'],
  out: 'vec3',
  exec: vec3Normalize
})

export const Cross = makeInNOutFunctionDesc({
  name: 'math/vec3/basic/cross',
  label: 'Cross',
  in: ['vec3', 'vec3'],
  out: 'vec3',
  exec: vec3Cross
})

export const Dot = makeInNOutFunctionDesc({
  name: 'math/vec3/basic/dot',
  label: 'Dot',
  in: ['vec3', 'vec3'],
  out: 'float',
  exec: vec3Dot
})

export const Mix = makeInNOutFunctionDesc({
  name: 'math/vec3/basic/mix',
  label: '÷',
  in: [{ a: 'vec3' }, { b: 'vec3' }, { t: 'float' }],
  out: 'vec3',
  exec: vec3Mix
})

export const Equal = makeInNOutFunctionDesc({
  name: 'math/vec3/compare/equal',
  label: '=',
  in: [{ a: 'vec3' }, { b: 'vec3' }, { tolerance: 'float' }],
  out: 'boolean',
  exec: vec3Equals
})
