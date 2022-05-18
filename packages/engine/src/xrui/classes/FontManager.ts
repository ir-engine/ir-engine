import { ExtrudeGeometry, Vector3 } from 'three'
import { Font, FontLoader } from '../../assets/font/FontLoader'
import { Engine } from '../../ecs/classes/Engine'

export class FontManager {
  static instance: FontManager = new FontManager()
  private _loader: FontLoader = new FontLoader()
  _defaultFont: Font

  create3dText(text: string, scale: Vector3 = new Vector3(1, 1, 1), fontResolution: number = 120): ExtrudeGeometry {
    const textShapes = this._defaultFont.generateShapes(text, fontResolution)
    const geometry = new ExtrudeGeometry(textShapes, { bevelEnabled: false })
    const invRes = 1 / fontResolution
    geometry.scale(scale.x * invRes, scale.y * invRes, scale.z * invRes)
    geometry.computeBoundingBox()
    const xMid = -0.5 * (geometry.boundingBox?.max.x! - geometry.boundingBox?.min.x!)
    geometry.translate(xMid, 0, 1)
    return geometry
  }

  getDefaultFont(): Promise<Font> {
    return new Promise((resolve) => {
      if (this._defaultFont) {
        resolve(this._defaultFont)
      }
      this._loader.load(Engine.publicPath + '/fonts/IBMPlexSans-Regular.json', (font) => {
        this._defaultFont = font
        resolve(this._defaultFont)
      })
    })
  }
}
