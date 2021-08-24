import { Mesh, Object3D, BoxBufferGeometry, Material } from 'three'
import {
  createBuildings,
  createRoads,
  createGroundMesh,
  createWater,
  createLandUse,
  createLabels,
  safelySetGroundScaleAndPosition
} from '@xrengine/engine/src/map/MeshBuilder'
import { fetchVectorTiles, fetchRasterTiles } from '@xrengine/engine/src/map/MapBoxClient'
import EditorNodeMixin from './EditorNodeMixin'
import { debounce } from 'lodash'
import { getStartCoords } from '@xrengine/engine/src/map'
import { MapProps } from '@xrengine/engine/src/map/MapProps'
import { GeoLabelNode } from '@xrengine/engine/src/map/GeoLabelNode'

const PROPS_THAT_REFRESH_MAP_ON_CHANGE = ['startLatitude', 'startLongitude', 'useDeviceGeolocation']

export default class MapNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = 'map'
  static nodeName = 'Map'
  static _geometry = new BoxBufferGeometry()
  static _material = new Material()

  mapLayers: { [name: string]: Object3D | undefined }

  labels: GeoLabelNode[]

  static async deserialize(editor, json) {
    const node = await super.deserialize(editor, json)
    const {
      name,
      useTimeOfDay,
      useDirectionalShadows,
      useDeviceGeolocation,
      startLatitude,
      startLongitude,
      scale,
      showRasterTiles,
      enableDebug
    } = json.components.find((c) => c.name === 'map').props
    node.useTimeOfDay = useTimeOfDay
    node.useDirectionalShadows = useDirectionalShadows
    node.useDeviceGeolocation = useDeviceGeolocation
    node.startLatitude = startLatitude
    node.startLongitude = startLongitude
    node.name = name
    node.showRasterTiles = showRasterTiles
    node.enableDebug = enableDebug
    console.log('setting node.scale, which is', node.scale)
    node.scale.set(scale.x, scale.y, scale.z)
    return node
  }
  constructor(editor) {
    super(editor)
  }
  applyScale(object3d: Object3D) {
    object3d.position.multiplyScalar(this.scale.x)
    object3d.scale.copy(this.scale)
  }
  async addMap(editor) {
    console.log('creating map')
    const center = await getStartCoords(this.getProps())
    const vectorTiles = await fetchVectorTiles(center)
    const rasterTiles = this.showRasterTiles ? await fetchRasterTiles(center) : []

    this.mapLayers = {
      building: createBuildings(vectorTiles, center),

      road: createRoads(vectorTiles, center),

      ground: createGroundMesh(rasterTiles, center[1]),

      water: createWater(vectorTiles, center),

      landUse: createLandUse(vectorTiles, center)
    }

    Object.values(this.mapLayers).forEach((layer) => {
      if (layer) {
        this.applyScale(layer)
        this.add(layer)
      }
    })
    safelySetGroundScaleAndPosition(this.mapLayers.ground, this.mapLayers.building)

    this.labels = createLabels(vectorTiles, center, this.scale.x)

    this.labels.forEach((label) => {
      label.scale.copy(this.scale)
      this.add(label.object3d)
    })
  }
  async refreshGroundLayer() {
    const center = await getStartCoords(this.getProps())
    const rasterTiles = this.showRasterTiles ? await fetchRasterTiles(center) : []
    this.mapLayers.ground.removeFromParent()
    this.mapLayers.ground = createGroundMesh(rasterTiles, center[1])
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

  copy(source: MapNode, recursive = true) {
    super.copy(source, recursive)
    Object.entries(source.getProps()).forEach(([prop, value]) => {
      if (value?.copy) {
        value.copy(this[prop])
      } else {
        this[prop] = value
      }
    })
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
  onUpdate(delta: number, time: number) {
    void delta
    void time
    this.labels?.forEach((label) => {
      label.onUpdate(this.editor.camera)
    })
  }
  getProps(): MapProps {
    return {
      name: this.name,
      scale: this.scale,
      useTimeOfDay: this.useTimeOfDay,
      useDirectionalShadows: this.useDirectionalShadows,
      useDeviceGeolocation: this.useDeviceGeolocation,
      startLatitude: this.startLatitude,
      startLongitude: this.startLongitude,
      showRasterTiles: this.showRasterTiles,
      enableDebug: this.enableDebug
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
