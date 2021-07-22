import { Object3D, BoxBufferGeometry, Material } from 'three'
import { addMap } from '../../map'
import EditorNodeMixin from './EditorNodeMixin'
import { Editor } from '@xrengine/client-core'

export default class MapNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = 'map'
  static nodeName = 'Map'
  static _geometry = new BoxBufferGeometry()
  static _material = new Material()

  static async deserialize(editor, json) {
    console.log('Deserializing The MapNode')
    const node = await super.deserialize(editor, json)
    const {
      isGlobal,
      name,
      // style,
      // useTimeOfDay,
      // useDirectionalShadows,
      useStartCoordinates,
      startLatitude,
      startLongitude
    } = json.components.find((c) => c.name === 'map').props
    node.isGlobal = isGlobal
    // node.style = style;
    // node.useTimeOfDay = useTimeOfDay;
    // node.useDirectionalShadows = useDirectionalShadows;
    node.useStartCoordinates = useStartCoordinates
    node.startLatitude = startLatitude
    node.startLongitude = startLongitude
    node.name = name
    return node
  }
  constructor(editor: Editor) {
    super(editor)
    console.log('creating map')
    addMap(editor.scene as any, editor.renderer.renderer)
  }
  copy(source, recursive = true) {
    super.copy(source, recursive)
    return this
  }
  onUpdate(delta: number, time: number) {
    // this.map.renderSync(time);
  }
  serialize() {
    const components = {
      map: {
        id: this.id,
        name: this.name,
        isGlobal: this.isGlobal,
        // style: this.style,
        // useTimeOfDay: this.useTimeOfDay,
        // useDirectionalShadows: this.useDirectionalShadows,
        useStartCoordinates: this.useStartCoordinates,
        startLatitude: this.startLatitude,
        startLongitude: this.startLongitude
      }
    } as any
    return super.serialize(components)
  }
  prepareForExport() {
    super.prepareForExport()
  }
}
