// eslint-disable-next-line no-unused-vars
import AFRAME from 'aframe'
// eslint-disable-next-line no-unused-vars
import Camera, { CameraComponentOptions, defaultCameraComponentOptions } from './camera'
import FuseCursor from './fuse-cursor'
import { setComponent } from '../aframe-component'

export default class CameraRig {
  camera: Camera
  el: AFRAME.Entity | null = null
  cameraEl: AFRAME.Entity | null = null
  className: string
  fuseCursor: boolean

  constructor(className = 'player-camera', cameraOptions: Partial<CameraComponentOptions> = defaultCameraComponentOptions,
    fuseCursor: boolean = false) {
    this.camera = new Camera(cameraOptions)
    this.className = className
    this.fuseCursor = fuseCursor
    this.setupCameraRig()
  }

  setupCameraRig(): void {
    this.el = document.createElement('a-entity')
    this.el.classList.add('camera-rig')

    this.cameraEl = document.createElement('a-entity')
    this.cameraEl.classList.add('class')
    this.cameraEl.classList.add(this.className)
    setComponent(this.cameraEl, this.camera)

    this.el.appendChild(this.cameraEl)

    if (this.fuseCursor) {
      const cursor = new FuseCursor()
      this.el.appendChild(cursor.el as AFRAME.Entity)
      cursor.el?.object3D.position.set(0, 0, -1)
    }
  }

  setActive(): void {
    const cameraSystem = this.el?.sceneEl?.systems.camera
    // @ts-ignore
    if (cameraSystem) console.log('settingActive Camera: ') && cameraSystem.setActiveCamera(this.cameraEl)
  }

  removeDefaultCamera(): void {
    var cams = document.querySelectorAll('[camera]')
    // eslint-disable-next-line no-unused-expressions
    cams.forEach(el => { if (el.classList.contains('data-aframe-default-camera')) el.parentElement?.removeChild(el) })
  }
}
