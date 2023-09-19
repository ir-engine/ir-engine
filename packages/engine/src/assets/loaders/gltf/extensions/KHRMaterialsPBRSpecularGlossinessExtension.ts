import { CanvasTexture, Texture } from 'three'
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
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]
    if (!materialDef.extensions?.[this.name]) return Promise.resolve()
    const extension: KHRMaterialsPBRSpecularGlossiness = materialDef.extensions[this.name]
    const invertSpecular = async () => {
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
      //dud.texture and mapData are disposed by garbage collection after this function returns
    }
    return Promise.all([parser.assignTexture(materialParams, 'map', extension.diffuseTexture), invertSpecular()]).then(
      () => Promise.resolve()
    )
  }
}
