import EditorNodeMixin from './EditorNodeMixin'
import DirectionalPlaneHelper from '@xrengine/engine/src/scene/classes/DirectionalPlaneHelper'
import { Water } from '@xrengine/engine/src/scene/classes/Water'

const defaultSkyBoxUrl = '/cubemap/'

export default class WaterNode extends EditorNodeMixin(Water) {
  static legacyComponentName = 'water'
  static nodeName = 'Water'

  static initialElementProps = {
    skyBox: new URL(defaultSkyBoxUrl, (window as any)?.location).href
  }

  async serialize(projectID) {
    return await super.serialize(projectID, {
      water: {
        skyBox: this.skyBox
      }
    })
  }

  static async deserialize(json, loadAsync?, onError?): Promise<WaterNode> {
    const node = (await super.deserialize(json)) as WaterNode
    const props = json.components.find((c) => c.name === 'water').props
    Object.assign(node, props)
    return node
  }

  constructor() {
    super()
    this.disableOutline = true
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

  prepareForExport() {
    super.prepareForExport()
    this.addGLTFComponent('water', {
      skyBox: this.skyBox
    })
    this.replaceObject()
  }
}
