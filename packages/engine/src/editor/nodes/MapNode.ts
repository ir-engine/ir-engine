import { Object3D, BoxBufferGeometry, Material, Vector3 } from 'three'
import { createBuildings, createRoads, createGround } from '../../map/MeshBuilder'
import { fetchVectorTiles, fetchRasterTiles } from '../../map/MapBoxClient'
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
      scale,
      showRasterTiles
    } = json.components.find((c) => c.name === 'map').props
    node.isGlobal = isGlobal
    node.useTimeOfDay = useTimeOfDay
    node.useDirectionalShadows = useDirectionalShadows
    node.useStartCoordinates = useStartCoordinates
    node.startLatitude = startLatitude
    node.startLongitude = startLongitude
    node.name = name
    node.showRasterTiles = showRasterTiles
    console.log('setting node.scale, which is', node.scale)
    node.scale.set(scale.x, scale.y, scale.z)
    return node
  }
  constructor(editor) {
    super(editor)
  }
  getStartLongLat() {
    return [parseFloat(this.startLongitude) || -84.388, parseFloat(this.startLatitude) || 33.749]
  }
  async addMap(editor) {
    console.log('creating map')
    const renderer = editor.renderer.renderer
    const center = this.getStartLongLat()
    const vectorTiles = await fetchVectorTiles(center)
    const rasterTiles = this.showRasterTiles ? await fetchRasterTiles(center) : []

    this.sceneNodes = [
      createBuildings(vectorTiles, center, renderer),

      createRoads(vectorTiles, center, renderer),

      createGround(rasterTiles, center[1])
    ]

    this.sceneNodes.forEach((node) => {
      node.position.multiplyScalar(this.scale.x)
      node.scale.multiplyScalar(this.scale.x)
      this.add(node)
    })
  }
  async refreshGroundNode() {
    const center = this.getStartLongLat()
    const rasterTiles = this.showRasterTiles ? await fetchRasterTiles(center) : []
    this.sceneNodes[1] = createGround(rasterTiles, center[1])
    this.add(this.sceneNodes[1])
  }
  copy(source, recursive = true) {
    super.copy(source, recursive)
    return this
  }
  onChange(prop?: string) {
    if (prop) {
      if (prop === 'showRasterTiles') {
        this.sceneNodes[1].removeFromParent()
        this.refreshGroundNode()
      }
    } else {
      this.addMap(this.editor)
    }
  }
  onUpdate(delta: number, time: number) {}
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
        startLongitude: this.startLongitude,
        showRasterTiles: this.showRasterTiles
      }
    } as any
    return super.serialize(projectID, components)
  }
  prepareForExport() {
    super.prepareForExport()
  }
}
