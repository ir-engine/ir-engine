import { Mesh, Object3D, BoxBufferGeometry, Material } from 'three'
import { createBuildings, createRoads, createGround, safelySetGroundScaleAndPosition } from '../../map/MeshBuilder'
import { fetchVectorTiles, fetchRasterTiles } from '../../map/MapBoxClient'
import EditorNodeMixin from './EditorNodeMixin'
import { debounce } from 'lodash'
import { getStartCoords } from '../../map'
import { MapProps } from '../../map/MapProps'

const PROPS_THAT_REFRESH_MAP_ON_CHANGE = ['startLatitude', 'startLongitude', 'useDeviceGeolocation']

export default class MapNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = 'map'
  static nodeName = 'Map'
  static _geometry = new BoxBufferGeometry()
  static _material = new Material()

  mapLayers: { [name: string]: Object3D | undefined }

  static async deserialize(editor, json) {
    const node = await super.deserialize(editor, json)
    const {
      isGlobal,
      name,
      useTimeOfDay,
      useDirectionalShadows,
      useDeviceGeolocation,
      startLatitude,
      startLongitude,
      scale,
      showRasterTiles
    } = json.components.find((c) => c.name === 'map').props
    node.isGlobal = isGlobal
    node.useTimeOfDay = useTimeOfDay
    node.useDirectionalShadows = useDirectionalShadows
    node.useDeviceGeolocation = useDeviceGeolocation
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
  applyScale(object3d: Object3D) {
    object3d.position.multiplyScalar(this.scale.x)
    object3d.scale.multiplyScalar(this.scale.x)
  }
  async addMap(editor) {
    console.log('creating map')
    const renderer = editor.renderer.renderer
    const center = await getStartCoords(this.getProps())
    const vectorTiles = await fetchVectorTiles(center)
    const rasterTiles = this.showRasterTiles ? await fetchRasterTiles(center) : []

    this.mapLayers = {
      building: createBuildings(vectorTiles, center, renderer),

      road: createRoads(vectorTiles, center, renderer),

      ground: createGround(rasterTiles, center[1])
    }

    Object.values(this.mapLayers).forEach((layer) => {
      if (layer) {
        this.applyScale(layer)
        this.add(layer)
      }
    })
    safelySetGroundScaleAndPosition(this.mapLayers.ground, this.mapLayers.building)
  }
  async refreshGroundLayer() {
    const center = await getStartCoords(this.getProps())
    const rasterTiles = this.showRasterTiles ? await fetchRasterTiles(center) : []
    this.mapLayers.ground.removeFromParent()
    this.mapLayers.ground = createGround(rasterTiles, center[1])
    this.applyScale(this.mapLayers.ground)
    safelySetGroundScaleAndPosition(this.mapLayers.ground, this.mapLayers.building)
    this.add(this.mapLayers.ground)
  }

  debounceAndRefreshAllLayers = debounce(() => {
    Object.values(this.mapLayers).forEach((layer) => {
      layer?.removeFromParent()
    })
    this.addMap(this.editor)
  }, 3000)

  copy(source, recursive = true) {
    super.copy(source, recursive)
    return this
  }
  onChange(prop?: string) {
    if (prop) {
      if (prop === 'showRasterTiles') {
        this.refreshGroundLayer()
      } else if (PROPS_THAT_REFRESH_MAP_ON_CHANGE.indexOf(prop) >= 0) {
        this.debounceAndRefreshAllLayers()
      }
    } else {
      this.addMap(this.editor)
    }
  }
  onUpdate(delta: number, time: number) {}
  getProps(): MapProps {
    return {
      name: this.name,
      scale: this.scale,
      isGlobal: this.isGlobal,
      useTimeOfDay: this.useTimeOfDay,
      useDirectionalShadows: this.useDirectionalShadows,
      useDeviceGeolocation: this.useDeviceGeolocation,
      startLatitude: this.startLatitude,
      startLongitude: this.startLongitude,
      showRasterTiles: this.showRasterTiles
    }
  }
  serialize(projectID) {
    const components = {
      map: {
        id: this.id,
        ...this.getProps()
      }
    } as any
    return super.serialize(projectID, components)
  }
  prepareForExport() {
    super.prepareForExport()
  }
}
