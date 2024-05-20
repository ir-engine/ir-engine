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
  DefaultModelTransformParameters as defaultParams,
  ModelTransformParameters
} from '@etherealengine/engine/src/assets/classes/ModelTransform'

export type LODVariantDescriptor = {
  params: ModelTransformParameters
  suffix: string
  variantMetadata: Record<string, any>
}

export const LODList: LODVariantDescriptor[] = [
  {
    params: {
      ...defaultParams,
      src: 'Desktop - Low',
      dst: 'Desktop - Low',
      maxTextureSize: 1024
    },
    suffix: 'desktop-low',
    variantMetadata: { device: 'DESKTOP' }
  },
  {
    params: {
      ...defaultParams,
      src: 'Desktop - Medium',
      dst: 'Desktop - Medium',
      maxTextureSize: 2048
    },
    suffix: 'desktop-medium',
    variantMetadata: { device: 'DESKTOP' }
  },
  {
    params: {
      ...defaultParams,
      src: 'Desktop - High',
      dst: 'Desktop - High',
      maxTextureSize: 2048
    },
    suffix: 'desktop-high',
    variantMetadata: { device: 'DESKTOP' }
  },
  {
    params: {
      ...defaultParams,
      src: 'Mobile - Low',
      dst: 'Mobile - Low',
      maxTextureSize: 512
    },
    suffix: 'mobile-low',
    variantMetadata: { device: 'MOBILE' }
  },
  {
    params: {
      ...defaultParams,
      src: 'Mobile - High',
      dst: 'Mobile - High',
      maxTextureSize: 512
    },
    suffix: 'mobile-high',
    variantMetadata: { device: 'MOBILE' }
  },
  {
    params: {
      ...defaultParams,
      src: 'XR - Low',
      dst: 'XR - Low',
      maxTextureSize: 1024
    },
    suffix: 'xr-low',
    variantMetadata: { device: 'XR' }
  },
  {
    params: {
      ...defaultParams,
      src: 'XR - Medium',
      dst: 'XR - Medium',
      maxTextureSize: 1024
    },
    suffix: 'xr-medium',
    variantMetadata: { device: 'XR' }
  },
  {
    params: {
      ...defaultParams,
      src: 'XR - High',
      dst: 'XR - High',
      maxTextureSize: 2048
    },
    suffix: 'xr-high',
    variantMetadata: { device: 'XR' }
  }
]

export const defaultLODs: LODVariantDescriptor[] = [
  {
    params: {
      ...defaultParams,
      src: '-LOD0',
      dst: '-LOD0',
      maxTextureSize: 2048
    },
    suffix: '-LOD0',
    variantMetadata: {}
  },
  {
    params: {
      ...defaultParams,
      src: '-LOD1',
      dst: '-LOD1',
      maxTextureSize: 1024,
      simplifyRatio: 0.85,
      simplifyErrorThreshold: 0.01
    },
    suffix: '-LOD1',
    variantMetadata: {}
  },
  {
    params: {
      ...defaultParams,
      src: '-LOD2',
      dst: '-LOD2',
      maxTextureSize: 512,
      simplifyRatio: 0.75,
      simplifyErrorThreshold: 0.01
    },
    suffix: '-LOD2',
    variantMetadata: {}
  }
]
