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
import { SRGBColorSpace } from 'three'

import { GLTFParser } from '../GLTFLoader'

function mapMaterials(object3D, fn) {
  if (!object3D.material) return []

  if (Array.isArray(object3D.material)) {
    return object3D.material.map(fn)
  } else {
    return fn(object3D.material)
  }
}

export class HubsComponentsExtension {
  name = 'MOZ_hubs_components'

  parser: GLTFParser
  constructor(parser) {
    this.parser = parser
  }

  afterRoot({ scenes, parser }) {
    const deps: any[] = []

    const resolveComponents = (gltfRootType, obj) => {
      const idx = parser.associations.get(obj)?.[gltfRootType]
      if (idx === undefined) return
      const ext = parser.json[gltfRootType][idx].extensions?.[this.name]
      if (!ext) return

      // TODO putting this into userData is a bit silly, we should just inflate here, but entities need to be inflated first...
      obj.userData.gltfExtensions = Object.assign(obj.userData.gltfExtensions || {}, {
        MOZ_hubs_components: ext
      })

      for (const componentName in ext) {
        const props = ext[componentName]
        for (const propName in props) {
          const value = props[propName]
          const type = value?.__mhc_link_type
          if (type && value.index !== undefined) {
            deps.push(
              parser.getDependency(type, value.index).then((loadedDep) => {
                // TODO similar to above, this logic being spread out in multiple places is not great...
                // Node refences are assumed to always be in the scene graph. These referneces are late-resolved in inflateComponents
                // otherwise they will need to be updated when cloning (which happens as part of caching).
                if (type === 'node') return

                if (type === 'texture' && !parser.json.textures[value.index].extensions?.MOZ_texture_rgbe) {
                  // For now assume all non HDR textures linked in hubs components are sRGB.
                  // We can allow this to be overridden later if needed
                  loadedDep.colorSpace = SRGBColorSpace
                }

                props[propName] = loadedDep

                return loadedDep
              })
            )
          }
        }
      }
    }

    for (let i = 0; i < scenes.length; i++) {
      // TODO this should be done by GLTFLoader
      parser.associations.set(scenes[i], { scenes: i })
      scenes[i].traverse((obj) => {
        resolveComponents('scenes', obj)
        resolveComponents('nodes', obj)
        mapMaterials(obj, resolveComponents.bind(this, 'materials'))
      })
    }

    return Promise.all(deps)
  }
}
