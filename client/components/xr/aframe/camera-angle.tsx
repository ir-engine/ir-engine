import AFRAME from 'aframe'
import PropertyMapper from './ComponentUtils'

const THREE = AFRAME.THREE

export const ComponentName = 'camera-angle'

export interface Data {
  [key: string]: any,
  cameraEl: string,
  yBotThrehold: number
}

export const ComponentSchema: AFRAME.MultiPropertySchema<Data> = {
  cameraEl: { default: '' },
  yBotThrehold: { default: -1 / 3 }
}

export interface Props {
  addHandlers: () => void,
  removeHandlers: () => void,
  aHandler: () => void,
  aProp: boolean,
  cameraEl: AFRAME.Entity,
  camera: THREE.Object3D,
  setCameraEl: () => void,
  setActiveCameraHandler: (e: any) => void,
  passedThreshold: (axis: string) => void,
  direction: string,
  flipDirection: () => void,
}

export const Component: AFRAME.ComponentDefinition<Props> = {
  schema: ComponentSchema,
  data: {
  } as Data,

  aProp: true,
  cameraEl: null,
  camera: null,
  direction: 'out',

  init () {
    this.setActiveCameraHandler = this.setActiveCameraHandler.bind(this)

    if (this.el.sceneEl?.hasLoaded) this.setCameraEl()
    else this.el.sceneEl?.addEventListener('loaded', this.setCameraEl.bind(this))
  },

  play() {
    this.addHandlers()
  },

  pause() {
    this.removeHandlers()
  },

  update(oldData: Data) {
    const changedData = Object.keys(this.data).filter(x => this.data[x] !== oldData[x])
    if (changedData.includes('cameraEl')) {
      this.setCameraEl()
    }
  },

  tick() {
    const wd = new THREE.Vector3()
    this.camera.getWorldDirection(wd)
    if (this.direction === 'out' && wd.y < this.data.yBotThrehold) {
      this.passedThreshold('y')
    } else if (this.direction === 'in' && wd.y > this.data.yBotThrehold) { this.passedThreshold('y') }
  },

  setCameraEl() {
    if (this.data.cameraEl === '') {
      this.cameraEl = this.el.sceneEl?.systems.camera.activeCameraEl
    } else {
      this.cameraEl = document.querySelector(this.data.cameraEl)
    }
    this.camera = this.cameraEl.getObject3D('camera')
  },

  aHandler() {

  },

  setActiveCameraHandler(e: any) {
    this.cameraEl = e.detail.cameraEl
    this.camera = this.cameraEl.getObject3D('camera')
  },

  passedThreshold(axis: string) {
    this.flipDirection()
    this.el.emit('camera-passed-threshold', { direction: this.direction, axis: axis })
  },

  flipDirection() {
    this.direction = this.direction === 'out' ? 'in' : 'out'
  },

  addHandlers: function() {
    this.el.addEventListener('an-event', this.aHandler.bind(this))
    this.el.sceneEl.addEventListener('camera-set-active', this.setActiveCameraHandler)
  },

  removeHandlers: function() {
    this.el.removeEventListener('an-event', this.aHandler)
    this.el.sceneEl.removeEventListener('camera-set-active', this.setActiveCameraHandler)
  }

}

const primitiveProps = ['cameraEl', 'yBotThrehold']

export const Primitive: AFRAME.PrimitiveDefinition = {
  defaultComponents: {
    ComponentName: {}
  },
  deprecated: false,
  mappings: {
    ...PropertyMapper(primitiveProps, ComponentName)
  }
}

const ComponentSystem = {
  name: ComponentName,
  // system: SystemDef,
  component: Component,
  primitive: Primitive
}

export default ComponentSystem
