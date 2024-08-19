/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { MeshPhysicalMaterial as Physical } from 'three'

import { ColorArg, FloatArg, NormalizedFloatArg, TextureArg } from '../constants/DefaultArgs'
import { MaterialPrototypeDefinition } from '../MaterialComponent'
import { MeshStandardArguments as StandardDefaults } from './MeshStandardMaterial.mat'

export const MeshPhysicalArguments = {
  ...StandardDefaults,
  clearcoat: { ...NormalizedFloatArg, default: 0.5 },
  clearcoatMap: TextureArg,
  clearcoatNormalMap: TextureArg,
  clearcoatRoughness: { ...NormalizedFloatArg, default: 0.5 },
  ior: { ...FloatArg, default: 1.5, min: 1.0, max: 2.333 },
  iridescence: NormalizedFloatArg,
  iridescenceMap: TextureArg,
  iridescenceIOR: { ...FloatArg, default: 1.3, min: 1.0, max: 2.333 },
  iridescenceThicknessMap: TextureArg,
  sheen: { ...NormalizedFloatArg, default: 0.5 },
  sheenMap: TextureArg,
  sheenColor: ColorArg,
  sheenColorMap: TextureArg,
  sheenRoughness: { ...NormalizedFloatArg, default: 0.5 },
  sheenRoughnessMap: TextureArg,
  specularIntensity: FloatArg,
  specularIntensityMap: TextureArg,
  specularColor: ColorArg,
  specularColorMap: TextureArg,
  thickness: FloatArg,
  thicknessMap: TextureArg,
  transmission: FloatArg,
  transmissionMap: TextureArg
}

export const MeshPhysicalMaterial: MaterialPrototypeDefinition = {
  prototypeId: 'MeshPhysicalMaterial',
  prototypeConstructor: Physical,
  arguments: MeshPhysicalArguments
}

export default MeshPhysicalMaterial
