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

import { ModelTransformParameters } from '@ir-engine/engine/src/assets/classes/ModelTransform'
import { useHookstate } from '@ir-engine/hyperflux'
import React from 'react'
import GLTFTransformProperties from './GLTFTransformProperties'

export default {
  title: 'editor/properties/GLTFTransformProperties',
  component: GLTFTransformProperties,
  parameters: {
    componentSubtitle: 'GLTFTransformProperties',
    design: {
      type: 'figma',
      url: ''
    }
  }
}

const defaultModelTransformParameters: ModelTransformParameters = {
  flipY: false,
  linear: false,
  mipmap: false,
  maxTextureSize: 2048,
  textureFormat: 'default',
  textureCompressionType: 'etc1',
  textureCompressionQuality: 75,
  uastcLevel: 2,
  compLevel: 6,
  maxCodebooks: false,
  dst: '',
  resourceUri: '',
  split: false,
  combineMaterials: false,
  instance: false,
  dedup: false,
  flatten: false,
  join: {
    enabled: false,
    options: {
      // Populate with default values for JoinOptions
    }
  },
  palette: {
    enabled: false,
    options: {
      // Populate with default values for PaletteOptions
    }
  },
  prune: false,
  reorder: false,
  resample: false,
  weld: {
    enabled: false
  },
  meshoptCompression: {
    enabled: false
  },
  dracoCompression: {
    enabled: false,
    options: {
      // Populate with default values for DracoOptions
    }
  },
  simplifyRatio: 1.0,
  simplifyErrorThreshold: 0.01,
  modelFormat: 'glb',
  resources: {
    geometries: [],
    images: []
  }
}

const GLTFTransformPropertiesRenderer = (args) => {
  const dummyTransformParams = useHookstate<ModelTransformParameters>(args.transformParms)
  return <GLTFTransformProperties transformParms={dummyTransformParams} itemCount={args.itemCount} />
}

export const Default = {
  args: {
    transformParms: defaultModelTransformParameters,
    itemCount: 0
  },
  render: GLTFTransformPropertiesRenderer
}
