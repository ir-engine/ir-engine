import { Object3D, BoxBufferGeometry, Material } from 'three'
import EditorNodeMixin from './EditorNodeMixin'
import { debounce } from 'lodash'
import { getStartCoords } from '@xrengine/engine/src/map'
import { MapProps } from '@xrengine/engine/src/map/MapProps'
import { getPhases, startPhases } from '@xrengine/engine/src/map/functions/PhaseFunctions'
import { addChildFast, setPosition } from '@xrengine/engine/src/map/util'
import { MapAction, mapReducer } from '@xrengine/engine/src/map/MapReceptor'

const PROPS_THAT_REFRESH_MAP_ON_CHANGE = ['startLatitude', 'startLongitude', 'useDeviceGeolocation']

export default class MapNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = 'map'
  static nodeName = 'Map'
  static _geometry = new BoxBufferGeometry()
  static _material = new Material()

  mapLayers: { [name: string]: Object3D | undefined }

  static async deserialize(json) {
    const node = await super.deserialize(json)
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
  constructor() {
    super()
    this.addMap()
  }
  applyScale(object3d: Object3D) {
    object3d.position.multiplyScalar(this.scale.x)
    object3d.scale.copy(this.scale)
  }
  async addMap() {
    console.log('creating map')
    const args = this.getProps()
    const center = await getStartCoords(args)
    const subSceneChildren = []
    const subScene = this as unknown as Object3D

    const state = mapReducer(null, MapAction.initialize(center, args.scale?.x))

    await startPhases(state, getPhases({ exclude: ['navigation'] }))

    for (const object of state.completeObjects.values()) {
      if (object.mesh) {
        setPosition(object.mesh, object.centerPoint)
        addChildFast(subScene, object.mesh, subSceneChildren)
      }
    }
    for (const object of state.labelCache.values()) {
      if (object.mesh) {
        setPosition(object.mesh, object.centerPoint)
        addChildFast(subScene, object.mesh, subSceneChildren)
        object.mesh.update()
      }
    }
    subScene.children = subSceneChildren
  }
  debounceRefresh = debounce(() => {
    this.addMap()
  }, 500)

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
    if (PROPS_THAT_REFRESH_MAP_ON_CHANGE.includes(prop)) {
      this.debounceRefresh()
    }
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
