import { AssetManifestSource } from '../components/assets/AssetManifestSource'
import { BaseSource } from '../components/assets/sources'
import EditorEvents from '../constants/EditorEvents'
import { CommandManager } from './CommandManager'
import ElementsSource from '../components/assets/sources/ElementsSource'
import { MyAssetsSource } from '../components/assets/sources/MyAssetsSource'

export class SourceManager {
  static instance: SourceManager = new SourceManager()

  sources: BaseSource[]

  defaultUploadSource: BaseSource

  constructor() {
    this.sources = []
  }

  /**
   * Function registerSource used to add image, audio, video, asset files to the scene.
   *
   * @author Robert Long
   * @param  {any} source contains source file data
   */
  registerSource(source: BaseSource) {
    this.sources.push(source)

    if (source.uploadSource && !this.defaultUploadSource) {
      this.defaultUploadSource = source
    }
  }

  /**
   * Function installAssetSource adding asset using url.
   *
   * @author Robert Long
   * @param  {any}  manifestUrl contains url of source
   */
  async installAssetSource(manifestUrl) {
    const res = await fetch(new URL(manifestUrl, (window as any).location).href)
    const json = await res.json()
    this.sources.push(new AssetManifestSource(json.name, manifestUrl))
    CommandManager.instance.emitEvent(EditorEvents.SETTINGS_CHANGED)
  }

  /**
   * Function getSource used to get source from sources array using sourceId.
   *
   * @author Robert Long
   * @param  {any} sourceId
   * @return {any} source data
   */
  getSource(sourceId) {
    return this.sources.find((source) => source.id === sourceId)
  }

  /**
   * Function setSource emitting event setSource using sourceId.
   *
   * @author Robert Long
   * @param sourceId
   */
  setSource(sourceId) {
    CommandManager.instance.emitEvent(EditorEvents.SOURCE_CHANGED, sourceId)
  }
}

export const registerPredefinedSources = () => {
  SourceManager.instance.registerSource(new ElementsSource())
  SourceManager.instance.registerSource(new MyAssetsSource())
}
