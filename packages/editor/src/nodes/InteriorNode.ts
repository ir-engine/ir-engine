import { Interior } from '@xrengine/engine/src/scene/classes/Interior'
import EditorNodeMixin from './EditorNodeMixin'
import DirectionalPlaneHelper from '@xrengine/engine/src/scene/classes/DirectionalPlaneHelper'

const defaultTextureUrl = '/cubemap/cube.dds'

export default class InteriorNode extends EditorNodeMixin(Interior) {
  static legacyComponentName = 'interior'
  static nodeName = 'Interior'

  static initialElementProps = {
    cubeMap: new URL(defaultTextureUrl, (window as any)?.location).href
  }

  static async deserialize(json, loadAsync?, onError?): Promise<InteriorNode> {
    const node = (await super.deserialize(json)) as InteriorNode
    const props = json.components.find((c) => c.name === InteriorNode.legacyComponentName).props
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
      interior: {
        cubeMap: this.cubeMap,
        tiling: this.tiling,
        size: this.size
      }
    })
  }

  prepareForExport() {
    super.prepareForExport()
    this.addGLTFComponent(InteriorNode.legacyComponentName, {
      cubeMap: this.cubeMap,
      tiling: this.tiling,
      size: this.size
    })
    this.replaceObject()
  }
}
