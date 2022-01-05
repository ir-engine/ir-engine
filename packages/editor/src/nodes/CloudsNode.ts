import { Clouds } from '@xrengine/engine/src/scene/classes/Clouds'
import EditorNodeMixin from './EditorNodeMixin'
import DirectionalPlaneHelper from '@xrengine/engine/src/scene/classes/DirectionalPlaneHelper'
import { Vector3, Vector2, Color } from 'three'

const defaultCloudTextureUrl = '/clouds/cloud.png'

export default class CloudsNode extends EditorNodeMixin(Clouds) {
  static legacyComponentName = 'clouds'
  static nodeName = 'Clouds'

  static initialElementProps = {
    texture: new URL(defaultCloudTextureUrl, (window as any)?.location).href,
    worldScale: new Vector3(1000, 150, 1000),
    dimensions: new Vector3(8, 4, 8),
    noiseZoom: new Vector3(7, 11, 7),
    noiseOffset: new Vector3(0, 4000, 3137),
    spriteScaleRange: new Vector2(50, 100),
    fogColor: new Color(0x4584b4),
    fogRange: new Vector2(-100, 3000)
  }

  static async deserialize(json, loadAsync?, onError?): Promise<CloudsNode> {
    const node = (await super.deserialize(json)) as CloudsNode
    const props = json.components.find((c) => c.name === 'clouds').props
    Object.assign(node, props)
    return node
  }

  constructor() {
    super(null)
    this.userData.disableOutline = true
    this.helper = new DirectionalPlaneHelper()
    this.helper.visible = false
    this.add(this.helper)
  }

  onSelect() {
    this.helper.visible = true
  }

  onDeselect() {
    this.helper.visible = false
  }

  onUpdate(dt) {
    this.update(dt)
  }

  copy(source, recursive = true) {
    if (recursive) {
      this.remove(this.helper)
    }

    super.copy(source, recursive)

    if (recursive) {
      const helperIndex = source.children.indexOf(source.helper)

      if (helperIndex === -1) {
        throw new Error('Source helper could not be found.')
      }

      this.helper = this.children[helperIndex]
    }

    return this
  }

  async serialize(projectID) {
    return await super.serialize(projectID, {
      clouds: {
        texture: this.texture,
        worldScale: this.worldScale,
        dimensions: this.dimensions,
        noiseZoom: this.noiseZoom,
        noiseOffset: this.noiseOffset,
        spriteScaleRange: this.spriteScaleRange,
        fogColor: this.fogColor,
        fogRange: this.fogRange
      }
    })
  }

  prepareForExport() {
    super.prepareForExport()
    this.addGLTFComponent('clouds', {
      texture: this.texture,
      worldScale: this.worldScale,
      dimensions: this.dimensions,
      noiseZoom: this.noiseZoom,
      noiseOffset: this.noiseOffset,
      spriteScaleRange: this.spriteScaleRange,
      fogColor: this.fogColor,
      fogRange: this.fogRange
    })
    this.replaceObject()
  }
}
