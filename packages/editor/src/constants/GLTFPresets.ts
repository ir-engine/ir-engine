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

import {
  DefaultModelTransformParameters as defaultParams,
  ModelTransformParameters
} from '@ir-engine/engine/src/assets/classes/ModelTransform'
import { Devices, VariantMetadata } from '@ir-engine/engine/src/scene/components/VariantComponent'

export type LODVariantDescriptor = {
  params: ModelTransformParameters
  suffix: string
  variantMetadata: VariantMetadata
}

export const LODList: LODVariantDescriptor[] = [
  {
    params: {
      ...defaultParams,
      dst: 'Desktop - Low',
      maxTextureSize: 1024
    },
    suffix: 'desktop-low',
    variantMetadata: { device: Devices.DESKTOP }
  },
  {
    params: {
      ...defaultParams,
      dst: 'Desktop - Medium',
      maxTextureSize: 2048
    },
    suffix: 'desktop-medium',
    variantMetadata: { device: Devices.DESKTOP }
  },
  {
    params: {
      ...defaultParams,
      dst: 'Desktop - High',
      maxTextureSize: 2048
    },
    suffix: 'desktop-high',
    variantMetadata: { device: Devices.DESKTOP }
  },
  {
    params: {
      ...defaultParams,
      dst: 'Mobile - Low',
      maxTextureSize: 512
    },
    suffix: 'mobile-low',
    variantMetadata: { device: Devices.MOBILE }
  },
  {
    params: {
      ...defaultParams,
      dst: 'Mobile - High',
      maxTextureSize: 512
    },
    suffix: 'mobile-high',
    variantMetadata: { device: Devices.MOBILE }
  },
  {
    params: {
      ...defaultParams,
      dst: 'XR - Low',
      maxTextureSize: 1024
    },
    suffix: 'xr-low',
    variantMetadata: { device: Devices.XR }
  },
  {
    params: {
      ...defaultParams,
      dst: 'XR - Medium',
      maxTextureSize: 1024
    },
    suffix: 'xr-medium',
    variantMetadata: { device: Devices.XR }
  },
  {
    params: {
      ...defaultParams,
      dst: 'XR - High',
      maxTextureSize: 2048
    },
    suffix: 'xr-high',
    variantMetadata: { device: Devices.XR }
  }
]

export const defaultLODs: LODVariantDescriptor[] = [
  {
    params: {
      ...defaultParams,
      dst: '-LOD0',
      maxTextureSize: 2048
    },
    suffix: '-LOD0',
    variantMetadata: {
      minDistance: 0,
      maxDistance: 10
    }
  },
  {
    params: {
      ...defaultParams,
      dst: '-LOD1',
      maxTextureSize: 1024,
      simplifyRatio: 0.85,
      simplifyErrorThreshold: 0.01
    },
    suffix: '-LOD1',
    variantMetadata: {
      minDistance: 10,
      maxDistance: 20
    }
  },
  {
    params: {
      ...defaultParams,
      dst: '-LOD2',
      maxTextureSize: 512,
      simplifyRatio: 0.75,
      simplifyErrorThreshold: 0.01
    },
    suffix: '-LOD2',
    variantMetadata: {
      minDistance: 20,
      maxDistance: 30
    }
  }
]
