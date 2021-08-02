import { Object3D, BoxBufferGeometry, Material, Vector3 } from 'three'
import { addMap } from '../../map'
import EditorNodeMixin from './EditorNodeMixin'

export default class MapNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = 'map'
  static nodeName = 'Map'
  static _geometry = new BoxBufferGeometry()
  static _material = new Material()

  static async deserialize(editor, json) {
    const node = await super.deserialize(editor, json)
    const {
      isGlobal,
      name,
      useTimeOfDay,
      useDirectionalShadows,
      useStartCoordinates,
      startLatitude,
      startLongitude,
      scale
    } = json.components.find((c) => c.name === 'map').props
    node.isGlobal = isGlobal
    node.useTimeOfDay = useTimeOfDay
    node.useDirectionalShadows = useDirectionalShadows
    node.useStartCoordinates = useStartCoordinates
    node.startLatitude = startLatitude
    node.startLongitude = startLongitude
    node.name = name
    console.log('setting node.scale, which is', node.scale)
    node.scale.set(scale.x, scale.y, scale.z)
    return node
  }
  constructor(editor) {
    super(editor)
    console.log('creating map')
    addMap(editor.scene as any, editor.renderer.renderer, {
      name: this.name,
      isGlobal: this.isGlobal,
      scale: this.scale,
      useTimeOfDay: this.useTimeOfDay,
      useDirectionalShadows: this.useDirectionalShadows,
      useStartCoordinates: this.useStartCoordinates,
      startLatitude: this.startLatitude,
      startLongitude: this.startLongitude
    })
  }
  copy(source, recursive = true) {
    super.copy(source, recursive)
    return this
  }
  onUpdate(delta: number, time: number) {
    // this.map.renderSync(time);
  }
  serialize(projectID) {
    const components = {
      map: {
        id: this.id,
        name: this.name,
        scale: this.scale,
        isGlobal: this.isGlobal,
        useTimeOfDay: this.useTimeOfDay,
        useDirectionalShadows: this.useDirectionalShadows,
        useStartCoordinates: this.useStartCoordinates,
        startLatitude: this.startLatitude,
        startLongitude: this.startLongitude
      }
    } as any
    return super.serialize(projectID, components)
  }
  prepareForExport() {
    super.prepareForExport()
  }
}
