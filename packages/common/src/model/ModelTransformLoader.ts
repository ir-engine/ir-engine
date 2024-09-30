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

import { NodeIO } from '@gltf-transform/core'
import {
  EXTMeshGPUInstancing,
  EXTMeshoptCompression,
  KHRDracoMeshCompression,
  KHRLightsPunctual,
  KHRMaterialsClearcoat,
  KHRMaterialsEmissiveStrength,
  KHRMaterialsPBRSpecularGlossiness,
  KHRMaterialsSpecular,
  KHRMaterialsTransmission,
  KHRMaterialsUnlit,
  KHRMeshQuantization,
  KHRTextureBasisu,
  KHRTextureTransform
} from '@gltf-transform/extensions'
import { EEMaterialExtension } from '@ir-engine/engine/src/assets/compression/extensions/EE_MaterialTransformer'
import { EEResourceIDExtension } from '@ir-engine/engine/src/assets/compression/extensions/EE_ResourceIDTransformer'
import { VRMExtension } from '@ir-engine/engine/src/assets/compression/extensions/EE_VRMTransformer'
import { MOZLightmapExtension } from '@ir-engine/engine/src/assets/compression/extensions/MOZ_LightmapTransformer'
import fetch from 'cross-fetch'
import draco3d from 'draco3dgltf'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'
import { FileLoader } from 'three'

const transformHistory: string[] = []
export default async function ModelTransformLoader() {
  const io = new NodeIO(fetch, {}).setAllowNetwork(true)
  io.registerExtensions([
    KHRLightsPunctual,
    KHRMaterialsSpecular,
    KHRMaterialsClearcoat,
    KHRMaterialsPBRSpecularGlossiness,
    KHRMaterialsUnlit,
    KHRMaterialsEmissiveStrength,
    KHRMaterialsTransmission,
    KHRDracoMeshCompression,
    EXTMeshGPUInstancing,
    EXTMeshoptCompression,
    KHRMeshQuantization,
    KHRTextureBasisu,
    KHRTextureTransform,
    MOZLightmapExtension,
    EEResourceIDExtension,
    EEMaterialExtension,
    VRMExtension
  ])
  io.registerDependencies({
    'meshopt.decoder': MeshoptDecoder,
    'meshopt.encoder': MeshoptEncoder,
    'draco3d.decoder': await draco3d.createDecoderModule(),
    'draco3d.encoder': await draco3d.createEncoderModule()
  })
  return {
    io,
    load: async (src, noHistory = false) => {
      const loader = new FileLoader()
      loader.setResponseType('arraybuffer')
      const data = (await loader.loadAsync(src)) as ArrayBuffer
      if (!noHistory) transformHistory.push(src)
      return io.readBinary(new Uint8Array(data))
    },
    //load: io.read,
    get prev(): string | undefined {
      return transformHistory.length > 0 ? transformHistory[0] : undefined
    }
  }
}
