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

// https://github.com/mozilla/hubs/blob/27eb7f3d9eba3b938f1ca47ed5b161547b6fb3f2/src/components/gltf-model-plus.js
import { MeshBasicMaterial, MeshStandardMaterial, RepeatWrapping, Texture } from 'three'

import { GLTFLoaderPlugin } from '../GLTFLoader'
import { ImporterExtension } from './ImporterExtension'

export type MOZ_lightmap = {
  index: number
  texCoord: number
  intensity: number
  extensions: {
    [extname: string]: any
  }
}

export class HubsLightMapExtension extends ImporterExtension implements GLTFLoaderPlugin {
  name = 'MOZ_lightmap'

  // @TODO: Ideally we should use extendMaterialParams hook.
  loadMaterial(materialIndex) {
    const parser = this.parser
    const json = parser.json
    const materialDef = json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return null
    }

    const extensionDef: MOZ_lightmap = materialDef.extensions[this.name]

    const pending: any[] = []

    pending.push(parser.loadMaterial(materialIndex))
    pending.push(parser.getDependency('texture', extensionDef.index))

    return Promise.all(pending).then((results) => {
      const material: MeshStandardMaterial | MeshBasicMaterial = results[0]
      const lightMap: Texture = (results[1] as Texture).clone()

      const transform = extensionDef.extensions ? extensionDef.extensions['KHR_texture_transform'] : undefined
      if (transform !== undefined) {
        lightMap.wrapS = RepeatWrapping
        lightMap.wrapT = RepeatWrapping
        lightMap.rotation = transform.rotation ?? 0
        lightMap.offset.x = transform.offset[0]
        lightMap.offset.y = transform.offset[1]
        lightMap.repeat.x = transform.scale[0]
        lightMap.repeat.y = transform.scale[1]
      }
      material.lightMap = lightMap
      material.lightMapIntensity = extensionDef.intensity ?? 1.0
      //fix for change to MeshBasicMaterial shading WRT lightmaps
      if (material.type === 'MeshBasicMaterial') {
        material.lightMapIntensity *= Math.PI
      }
      return material
    })
  }
  /*
  loadTexture( textureIndex ) {

		const parser = this.parser;
		const json = parser.json;
    const name = this.name;
		const textureDef = json.textures[ textureIndex ];

		const source = textureDef.source
		const loader = parser.options.ktx2Loader;

		if ( ! loader ) {

			if ( json.extensionsRequired && json.extensionsRequired.indexOf( name ) >= 0 ) {

				throw new Error( 'THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures' );

			} else {

				// Assumes that the extension is optional and that a fallback texture is present
				return null;

			}

		}

		return parser.loadTextureImage( textureIndex, source, loader );

	}*/
}
