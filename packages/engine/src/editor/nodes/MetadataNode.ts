//Import all the needed scripts and classes
import { Object3D, PlaneBufferGeometry, MeshBasicMaterial, Mesh, DoubleSide } from 'three'
import EditorNodeMixin from './EditorNodeMixin'
import loadTexture from '../functions/loadTexture'
import { Analytics } from '@styled-icons/material/Analytics'
/**
 * @author Alex Titonis
 */
//The helper object for the Icon Texture
let metadataHelperTexture = null
export default class MetadataNode extends EditorNodeMixin(Object3D) {
  static nodeName = 'Metadata'
  static legacyComponentName = '_metadata'

  static async load() {
    //OnLoad, load the .png file for the texture (this will be shown in the map - editor)
    metadataHelperTexture = await loadTexture('/editor/metadata-icon.png')
  }

  //On deserialization, it will look for the values with parent name '_metadata' and then get the _data from the props
  static async deserialize(editor, json) {
    const node = await super.deserialize(editor, json)
    const { _data } = json.components.find((c) => c.name == '_metadata').props
    node._data = _data
    return node
  }

  constructor(editor) {
    super(editor)
    this._data = ''
    const geometry = new PlaneBufferGeometry()
    const material = new MeshBasicMaterial()
    material.map = metadataHelperTexture
    material.side = DoubleSide
    material.transparent = true
    this.helper = new Mesh(geometry, material)
    this.helper.layers.set(1)
    this.add(this.helper)
  }

  //This function is called when the node is copied to another one, compying all the needed values from the one to the other
  copy(source, recursive = true) {
    if (recursive) {
      this.remove(this.helper)
    }

    super.copy(source, recursive)

    if (recursive) {
      const helperIndex = source.children.findIndex((child) => child === source.helper)
      if (helperIndex !== -1) {
        this.helper = this.children[helperIndex]
      }
    }

    this._data = source.data
    return this
  }

  //This function is called when serializing the scene, translating the needed values from the node to json
  async serialize(projectID) {
    return await super.serialize(projectID, {
      _metadata: {
        _data: this._data
      }
    })
  }

  //This function is called when exporting the node
  prepareForExport() {
    super.prepareForExport()
    this.remove(this.helper)
    this.addGLTFComponent('_metadata', { _data: this._data })
    this.addGLTFComponent('networked', { id: this.uuid })
    this.replaceObject()
  }
}
