/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import {
  AdditiveBlending,
  AddOperation,
  BackSide,
  Color,
  DoubleSide,
  FrontSide,
  MixOperation,
  MultiplyBlending,
  MultiplyOperation,
  NoBlending,
  NormalBlending,
  ObjectSpaceNormalMap,
  SubtractiveBlending,
  TangentSpaceNormalMap
} from 'three'

import { BoolArg, ColorArg, FloatArg, NormalizedFloatArg, SelectArg, TextureArg, Vec2Arg } from './DefaultArgs'

export const BasicArgs = {
  alphaTest: NormalizedFloatArg,
  alphaMap: TextureArg,
  map: TextureArg,
  color: { ...ColorArg, default: new Color(1, 1, 1) },
  opacity: { ...FloatArg, default: 1 },
  blending: {
    ...SelectArg,
    default: NormalBlending,
    options: [
      { label: 'Normal', value: NormalBlending },
      { label: 'Additive', value: AdditiveBlending },
      { label: 'Subtractive', value: SubtractiveBlending },
      { label: 'Multiply', value: MultiplyBlending },
      { label: 'None', value: NoBlending }
    ]
  },
  depthTest: { ...BoolArg, default: true },
  depthWrite: { ...BoolArg, default: true },
  side: {
    ...SelectArg,
    default: FrontSide,
    options: [
      { label: 'Front', value: FrontSide },
      { label: 'Back', value: BackSide },
      { label: 'Both', value: DoubleSide }
    ]
  },
  toneMapped: BoolArg,
  transparent: BoolArg,
  vertexColors: BoolArg
}

export const BumpMapArgs = {
  bumpMap: TextureArg,
  bumpScale: { ...FloatArg, default: 1 }
}

export const LightMapArgs = {
  lightMap: TextureArg,
  lightMapIntensity: FloatArg
}

export const DisplacementMapArgs = {
  displacementMap: TextureArg,
  displacementScale: { ...FloatArg, default: 1 },
  displacementBias: FloatArg
}

export const EmissiveMapArgs = {
  emissive: ColorArg,
  emissiveMap: TextureArg,
  emissiveIntensity: { ...FloatArg, default: 0 }
}

export const EnvMapArgs = {
  combine: {
    ...SelectArg,
    default: MultiplyOperation,
    options: [
      { label: 'Multiply', value: MultiplyOperation },
      { label: 'Mix', value: MixOperation },
      { label: 'Add', value: AddOperation }
    ]
  },
  envMap: TextureArg,
  envMapIntensity: { ...FloatArg, default: 1.0 },
  reflectivity: FloatArg,
  refractionRatio: { ...FloatArg, default: 0.98 }
}

export const AoMapArgs = {
  aoMap: TextureArg,
  aoMapIntensity: NormalizedFloatArg
}

export const MetalnessMapArgs = {
  metalness: FloatArg,
  metalnessMap: TextureArg
}

export const NormalMapArgs = {
  normalMap: TextureArg,
  normalMapType: {
    ...SelectArg,
    default: TangentSpaceNormalMap,
    options: [
      { label: 'Object Space', value: ObjectSpaceNormalMap },
      { label: 'Tangent Space', value: TangentSpaceNormalMap }
    ]
  },
  normalScale: Vec2Arg
}

export const RoughhnessMapArgs = {
  roughness: { ...FloatArg, default: 1 },
  roughnessMap: TextureArg
}
