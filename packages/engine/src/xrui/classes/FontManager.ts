import { Font, FontLoader } from 'three'
import { Engine } from '../../ecs/classes/Engine'

export class FontManager {
  static instance: FontManager = new FontManager()
  private _loader: FontLoader = new FontLoader()
  _defaultFont: Font

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
