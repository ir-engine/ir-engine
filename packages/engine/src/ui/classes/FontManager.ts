import { Font, FontLoader } from "three";
import { Engine } from "../../ecs/classes/Engine";

export class FontManager {
	static instance: FontManager;
  private _loader: FontLoader;
  private _defaultFont: Font;

  constructor() {
    FontManager.instance = this;
    this._loader = new FontLoader();
  }


	getDefaultFont(): Promise<Font> {
		return new Promise(resolve => {
      if (this._defaultFont) {
        resolve(this._defaultFont);
			}
			this._loader.load(Engine.publicPath + '/fonts/IBMPlexSans-Regular.json', font => {
				this._defaultFont = font;
				resolve(this._defaultFont);
			});
		});
	}
}
