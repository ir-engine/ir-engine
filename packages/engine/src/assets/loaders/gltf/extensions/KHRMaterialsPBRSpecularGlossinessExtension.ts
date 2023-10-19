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

import { CanvasTexture, Texture } from 'three'
import { isClient } from '../../../../common/functions/getEnvironment'
import createReadableTexture from '../../../functions/createReadableTexture'
import { GLTFLoaderPlugin } from '../GLTFLoader'
import { ImporterExtension } from './ImporterExtension'

export type KHRMaterialsPBRSpecularGlossiness = {
  diffuseTexture: {
    index: number
  }
  specularGlossinessTexture: {
    index: number
  }
}

export class KHRMaterialsPBRSpecularGlossinessExtension extends ImporterExtension implements GLTFLoaderPlugin {
  name = 'KHR_materials_pbrSpecularGlossiness'

  extendMaterialParams(materialIndex: number, materialParams: { [key: string]: any }): Promise<void> {
    if (!isClient) return Promise.resolve()
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]
    if (!materialDef.extensions?.[this.name]) return Promise.resolve()
    const extension: KHRMaterialsPBRSpecularGlossiness = materialDef.extensions[this.name]
    const assignDiffuse = async () => {
      if (!extension.diffuseTexture) return
      return parser.assignTexture(materialParams, 'map', extension.diffuseTexture)
    }
    const invertSpecular = async () => {
      if (!extension.specularGlossinessTexture) return
      const dud = {
        texture: null as Texture | null
      }
      await parser.assignTexture(dud, 'texture', extension.specularGlossinessTexture)
      const mapData: Texture = (await createReadableTexture(dud.texture!, { canvas: true })) as Texture
      const canvas = mapData.image as HTMLCanvasElement
      const ctx = canvas.getContext('2d')!
      ctx.globalCompositeOperation = 'difference'
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'source-over'
      const invertedTexture = new CanvasTexture(canvas)
      materialParams.roughnessMap = invertedTexture
      //materialParams.metalnessMap = dud.texture!
      //dud.texture and mapData are disposed by garbage collection after this function returns
    }
    return Promise.all([assignDiffuse(), invertSpecular()]).then(() => Promise.resolve())
  }
}
