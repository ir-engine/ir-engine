import { Vector3, Quaternion, EventDispatcher, PerspectiveCamera, OrthographicCamera, Vector2, MOUSE } from 'three'

const STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 }
const CHANGE_EVENT = { type: 'change' }
const START_EVENT = { type: 'start' }
const END_EVENT = { type: 'end' }

const EPS = 0.000001

const LAST_POSITION = new Vector3()
const LAST_ZOOM = { value: 1 }

export class THREETrackballControls extends EventDispatcher {
  camera: PerspectiveCamera | OrthographicCamera
  domElement: HTMLElement
  window: Window

  // API
  enabled: boolean
  screen: any

  rotateSpeed: number
  zoomSpeed: number
  panSpeed: number

  noRotate: boolean
  noZoom: boolean
  noPan: boolean

  staticMoving: boolean
  dynamicDampingFactor: number

  minDistance: number
  maxDistance: number

  keys: number[]
  mouseButtons: any
  target: Vector3

  private _state: number
  private _keyState: number
  private _eye: Vector3
  private _movePrev: Vector2
  private _moveCurr: Vector2
  private _lastAxis: Vector3
  private _lastAngle: number
  private _zoomStart: Vector2
  private _zoomEnd: Vector2
  private _touchZoomDistanceStart: number
  private _touchZoomDistanceEnd: number
  private _panStart: Vector2
  private _panEnd: Vector2

  private target0: Vector3
  private position0: Vector3
  private up0: Vector3
  private zoom0: number

  private keydown: EventListener
  private keyup: EventListener
  private mousedown: EventListener
  private mouseup: EventListener
  private mousemove: EventListener
  private mousewheel: EventListener
  private touchstart: EventListener
  private touchmove: EventListener
  private touchend: EventListener
  private contextmenu: EventListener

  constructor(camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement, domWindow?: Window) {
    super()

    if (domElement === undefined) console.warn('TrackballControls: The second parameter "domElement" is now mandatory.')

    this.camera = camera

    this.domElement = domElement
    this.window = domWindow !== undefined ? domWindow : window

    // Set to false to disable this control
    this.enabled = true
    this.screen = { left: 0, top: 0, width: 0, height: 0 }

    this.rotateSpeed = 1.0
    this.zoomSpeed = 1.2
    this.panSpeed = 0.3

    this.noRotate = false
    this.noZoom = false
    this.noPan = false

    this.staticMoving = false
    this.dynamicDampingFactor = 0.2

    // How far you can dolly in and out ( PerspectiveCamera only )
    this.minDistance = 0
    this.maxDistance = Infinity

    this.keys = [65 /*A*/, 83 /*S*/, 68 /*D*/]

    // Replace ZOOM by DOLLY (threejs r111)
    this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }

    // "target" sets the location of focus, where the camera orbits around
    this.target = new Vector3()

    this._state = STATE.NONE
    this._keyState = STATE.NONE

    this._eye = new Vector3()

    this._movePrev = new Vector2()
    this._moveCurr = new Vector2()

    this._lastAxis = new Vector3()
    this._lastAngle = 0

    this._zoomStart = new Vector2()
    this._zoomEnd = new Vector2()

    this._touchZoomDistanceStart = 0
    this._touchZoomDistanceEnd = 0

    this._panStart = new Vector2()
    this._panEnd = new Vector2()

    this.target0 = this.target.clone()
    this.position0 = this.camera.position.clone()
    this.up0 = this.camera.up.clone()
    this.zoom0 = this.camera.zoom

    // event handlers - FSM: listen for events and reset state

    this.keydown = (event: KeyboardEvent) => {
      if (this.enabled === false) return
      this.window.removeEventListener('keydown', this.keydown)
      if (this._keyState !== STATE.NONE) {
        return
      } else if (event.keyCode === this.keys[STATE.ROTATE] && !this.noRotate) {
        this._keyState = STATE.ROTATE
      } else if (event.keyCode === this.keys[STATE.ZOOM] && !this.noZoom) {
        this._keyState = STATE.ZOOM
      } else if (event.keyCode === this.keys[STATE.PAN] && !this.noPan) {
        this._keyState = STATE.PAN
      }
    }

    this.keyup = () => {
      if (this.enabled === false) {
        return
      }
      this._keyState = STATE.NONE
      this.window.addEventListener('keydown', this.keydown, false)
    }

    this.mousedown = (event: MouseEvent) => {
      if (this.enabled === false) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      if (this._state === STATE.NONE) {
        switch (event.button) {
          case this.mouseButtons.LEFT:
            this._state = STATE.ROTATE
            break
          case this.mouseButtons.MIDDLE:
            this._state = STATE.ZOOM
            break
          case this.mouseButtons.RIGHT:
            this._state = STATE.PAN
            break
          default:
            this._state = STATE.NONE
        }
      }
      const state = this._keyState !== STATE.NONE ? this._keyState : this._state

      if (state === STATE.ROTATE && !this.noRotate) {
        this._moveCurr.copy(this.getMouseOnCircle(event.pageX, event.pageY))
        this._movePrev.copy(this._moveCurr)
      } else if (state === STATE.ZOOM && !this.noZoom) {
        this._zoomStart.copy(this.getMouseOnScreen(event.pageX, event.pageY))
        this._zoomEnd.copy(this._zoomStart)
      } else if (state === STATE.PAN && !this.noPan) {
        this._panStart.copy(this.getMouseOnScreen(event.pageX, event.pageY))
        this._panEnd.copy(this._panStart)
      }
      document.addEventListener('mousemove', this.mousemove, false)
      document.addEventListener('mouseup', this.mouseup, false)
      ;(this as any).dispatchEvent(START_EVENT)
    }

    this.mousemove = (event: MouseEvent) => {
      if (this.enabled === false) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      const state = this._keyState !== STATE.NONE ? this._keyState : this._state
      if (state === STATE.ROTATE && !this.noRotate) {
        this._movePrev.copy(this._moveCurr)
        this._moveCurr.copy(this.getMouseOnCircle(event.pageX, event.pageY))
      } else if (state === STATE.ZOOM && !this.noZoom) {
        this._zoomEnd.copy(this.getMouseOnScreen(event.pageX, event.pageY))
      } else if (state === STATE.PAN && !this.noPan) {
        this._panEnd.copy(this.getMouseOnScreen(event.pageX, event.pageY))
      }
    }

    this.mouseup = (event: MouseEvent) => {
      if (this.enabled === false) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      this._state = STATE.NONE
      document.removeEventListener('mousemove', this.mousemove)
      document.removeEventListener('mouseup', this.mouseup)
      ;(this as any).dispatchEvent(END_EVENT)
    }

    this.mousewheel = (event: WheelEvent) => {
      if (this.enabled === false) {
        return
      }
      if (this.noZoom === true) return
      event.preventDefault()
      event.stopPropagation()
      switch (event.deltaMode) {
        case 2:
          // Zoom in pages
          this._zoomStart.y -= event.deltaY * 0.025
          break

        case 1:
          // Zoom in lines
          this._zoomStart.y -= event.deltaY * 0.01
          break

        default:
          // undefined, 0, assume pixels
          this._zoomStart.y -= event.deltaY * 0.00025
          break
      }
      ;(this as any).dispatchEvent(START_EVENT)
      ;(this as any).dispatchEvent(END_EVENT)
    }

    this.touchstart = (event: TouchEvent) => {
      if (this.enabled === false) {
        return
      }
      event.preventDefault()
      switch (event.touches.length) {
        case 1:
          this._state = STATE.TOUCH_ROTATE
          this._moveCurr.copy(this.getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY))
          this._movePrev.copy(this._moveCurr)
          break
        default:
          // 2 or more
          this._state = STATE.TOUCH_ZOOM_PAN
          const dx = event.touches[0].pageX - event.touches[1].pageX
          const dy = event.touches[0].pageY - event.touches[1].pageY
          this._touchZoomDistanceEnd = this._touchZoomDistanceStart = Math.sqrt(dx * dx + dy * dy)
          const x = (event.touches[0].pageX + event.touches[1].pageX) / 2
          const y = (event.touches[0].pageY + event.touches[1].pageY) / 2
          this._panStart.copy(this.getMouseOnScreen(x, y))
          this._panEnd.copy(this._panStart)
          break
      }
      ;(this as any).dispatchEvent(START_EVENT)
    }

    this.touchmove = (event: TouchEvent) => {
      if (this.enabled === false) {
        return
      }
      event.preventDefault()
      event.stopPropagation()

      switch (event.touches.length) {
        case 1:
          this._movePrev.copy(this._moveCurr)
          this._moveCurr.copy(this.getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY))
          break

        default:
          // 2 or more
          const dx = event.touches[0].pageX - event.touches[1].pageX
          const dy = event.touches[0].pageY - event.touches[1].pageY
          this._touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy)
          const x = (event.touches[0].pageX + event.touches[1].pageX) / 2
          const y = (event.touches[0].pageY + event.touches[1].pageY) / 2
          this._panEnd.copy(this.getMouseOnScreen(x, y))
          break
      }
    }

    this.touchend = (event: TouchEvent) => {
      if (this.enabled === false) {
        return
      }
      switch (event.touches.length) {
        case 0:
          this._state = STATE.NONE
          break

        case 1:
          this._state = STATE.TOUCH_ROTATE
          this._moveCurr.copy(this.getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY))
          this._movePrev.copy(this._moveCurr)
          break
      }
      ;(this as any).dispatchEvent(END_EVENT)
    }

    this.contextmenu = (event: MouseEvent) => {
      if (this.enabled === false) {
        return
      }
      event.preventDefault()
    }

    this.domElement.addEventListener('contextmenu', this.contextmenu, false)
    this.domElement.addEventListener('mousedown', this.mousedown, false)
    this.domElement.addEventListener('wheel', this.mousewheel, false)

    this.domElement.addEventListener('touchstart', this.touchstart, false)
    this.domElement.addEventListener('touchend', this.touchend, false)
    this.domElement.addEventListener('touchmove', this.touchmove, false)

    this.window.addEventListener('keydown', this.keydown, false)
    this.window.addEventListener('keyup', this.keyup, false)

    this.handleResize()

    // force an update at start
    this.update()
  }

  dispose(): void {
    this.domElement.removeEventListener('contextmenu', this.contextmenu, false)
    this.domElement.removeEventListener('mousedown', this.mousedown, false)
    this.domElement.removeEventListener('wheel', this.mousewheel, false)

    this.domElement.removeEventListener('touchstart', this.touchstart, false)
    this.domElement.removeEventListener('touchend', this.touchend, false)
    this.domElement.removeEventListener('touchmove', this.touchmove, false)

    document.removeEventListener('mousemove', this.mousemove, false)
    document.removeEventListener('mouseup', this.mouseup, false)

    this.window.removeEventListener('keydown', this.keydown, false)
    this.window.removeEventListener('keyup', this.keyup, false)
  }

  // ------------------------------------------------
  handleResize(): void {
    const box = this.domElement.getBoundingClientRect()
    // adjustments come from similar code in the jquery offset() function
    const d = this.domElement.ownerDocument.documentElement
    this.screen.left = box.left + this.window.pageXOffset - d.clientLeft
    this.screen.top = box.top + this.window.pageYOffset - d.clientTop
    this.screen.width = box.width
    this.screen.height = box.height
  }

  getMouseOnScreen = (pageX: number, pageY: number) => {
    const vector = new Vector2()
    return vector.set((pageX - this.screen.left) / this.screen.width, (pageY - this.screen.top) / this.screen.height)
  }

  getMouseOnCircle = (pageX: number, pageY: number) => {
    const vector = new Vector2()
    return vector.set(
      (pageX - this.screen.width * 0.5 - this.screen.left) / (this.screen.width * 0.5),
      (this.screen.height + 2 * (this.screen.top - pageY)) / this.screen.width
    )
  }

  rotateCamera = () => {
    const axis: Vector3 = new Vector3()
    const quaternion: Quaternion = new Quaternion()
    const eyeDirection: Vector3 = new Vector3()
    const cameraUpDirection: Vector3 = new Vector3()
    const cameraSidewaysDirection: Vector3 = new Vector3()
    const moveDirection: Vector3 = new Vector3()
    let angle: number

    moveDirection.set(this._moveCurr.x - this._movePrev.x, this._moveCurr.y - this._movePrev.y, 0)
    angle = moveDirection.length()

    if (angle) {
      this._eye.copy(this.camera.position).sub(this.target)

      eyeDirection.copy(this._eye).normalize()
      cameraUpDirection.copy(this.camera.up).normalize()
      cameraSidewaysDirection.crossVectors(cameraUpDirection, eyeDirection).normalize()

      cameraUpDirection.setLength(this._moveCurr.y - this._movePrev.y)
      cameraSidewaysDirection.setLength(this._moveCurr.x - this._movePrev.x)

      moveDirection.copy(cameraUpDirection.add(cameraSidewaysDirection))

      axis.crossVectors(moveDirection, this._eye).normalize()

      angle *= this.rotateSpeed
      quaternion.setFromAxisAngle(axis, angle)

      this._eye.applyQuaternion(quaternion)
      this.camera.up.applyQuaternion(quaternion)

      this._lastAxis.copy(axis)
      this._lastAngle = angle
    } else if (!this.staticMoving && this._lastAngle) {
      this._lastAngle *= Math.sqrt(1.0 - this.dynamicDampingFactor)
      this._eye.copy(this.camera.position).sub(this.target)
      quaternion.setFromAxisAngle(this._lastAxis, this._lastAngle)
      this._eye.applyQuaternion(quaternion)
      this.camera.up.applyQuaternion(quaternion)
    }
    this._movePrev.copy(this._moveCurr)
  }

  zoomCamera = () => {
    let factor = 0

    if (this._state === STATE.TOUCH_ZOOM_PAN) {
      factor = this._touchZoomDistanceStart / this._touchZoomDistanceEnd
      this._touchZoomDistanceStart = this._touchZoomDistanceEnd

      if (this.camera['isPerspectiveCamera']) {
        this._eye.multiplyScalar(factor)
      } else if (this.camera['isOrthographicCamera']) {
        this.camera.zoom *= factor
        this.camera.updateProjectionMatrix()
      } else {
        console.warn('TrackballControls: Unsupported camera type')
      }
    } else {
      factor = 1.0 + (this._zoomEnd.y - this._zoomStart.y) * this.zoomSpeed

      if (factor !== 1.0 && factor > 0.0) {
        if (this.camera['isPerspectiveCamera']) {
          this._eye.multiplyScalar(factor)
        } else if (this.camera['isOrthographicCamera']) {
          this.camera.zoom /= factor
          this.camera.updateProjectionMatrix()
        } else {
          console.warn('TrackballControls: Unsupported camera type')
        }
      }

      if (this.staticMoving) {
        this._zoomStart.copy(this._zoomEnd)
      } else {
        this._zoomStart.y += (this._zoomEnd.y - this._zoomStart.y) * this.dynamicDampingFactor
      }
    }
  }

  panCamera = () => {
    const mouseChange: Vector2 = new Vector2()
    const cameraUp: Vector3 = new Vector3()
    const pan: Vector3 = new Vector3()

    mouseChange.copy(this._panEnd).sub(this._panStart)

    if (mouseChange.lengthSq()) {
      if (this.camera['isOrthographicCamera']) {
        const scale_x =
          ((<OrthographicCamera>this.camera).right - (<OrthographicCamera>this.camera).left) /
          this.camera.zoom /
          this.domElement.clientWidth
        const scale_y =
          ((<OrthographicCamera>this.camera).top - (<OrthographicCamera>this.camera).bottom) /
          this.camera.zoom /
          this.domElement.clientWidth
        mouseChange.x *= scale_x
        mouseChange.y *= scale_y
      }
      mouseChange.multiplyScalar(this._eye.length() * this.panSpeed)

      pan.copy(this._eye).cross(this.camera.up).setLength(mouseChange.x)
      pan.add(cameraUp.copy(this.camera.up).setLength(mouseChange.y))

      this.camera.position.add(pan)
      this.target.add(pan)

      if (this.staticMoving) {
        this._panStart.copy(this._panEnd)
      } else {
        this._panStart.add(
          mouseChange.subVectors(this._panEnd, this._panStart).multiplyScalar(this.dynamicDampingFactor)
        )
      }
    }
  }

  checkDistances(): void {
    if (!this.noZoom || !this.noPan) {
      if (this._eye.lengthSq() > this.maxDistance * this.maxDistance) {
        this.camera.position.addVectors(this.target, this._eye.setLength(this.maxDistance))
        this._zoomStart.copy(this._zoomEnd)
      }
      if (this._eye.lengthSq() < this.minDistance * this.minDistance) {
        this.camera.position.addVectors(this.target, this._eye.setLength(this.minDistance))
        this._zoomStart.copy(this._zoomEnd)
      }
    }
  }

  update(): void {
    this._eye.subVectors(this.camera.position, this.target)
    if (!this.noRotate) {
      this.rotateCamera()
    }
    if (!this.noZoom) {
      this.zoomCamera()
    }
    if (!this.noPan) {
      this.panCamera()
    }
    this.camera.position.addVectors(this.target, this._eye)
    if (this.camera['isPerspectiveCamera']) {
      this.checkDistances()
      this.camera.lookAt(this.target)
      if (LAST_POSITION.distanceToSquared(this.camera.position) > EPS) {
        ;(this as any).dispatchEvent(CHANGE_EVENT)
        LAST_POSITION.copy(this.camera.position)
      }
    } else if (this.camera['isOrthographicCamera']) {
      this.camera.lookAt(this.target)
      if (LAST_POSITION.distanceToSquared(this.camera.position) > EPS || LAST_ZOOM.value !== this.camera.zoom) {
        ;(this as any).dispatchEvent(CHANGE_EVENT)
        LAST_POSITION.copy(this.camera.position)
        LAST_ZOOM.value = this.camera.zoom
      } else {
        console.warn('TrackballControls: Unsupported camera type')
      }
    }
  }

  reset(): void {
    this._state = STATE.NONE
    this._keyState = STATE.NONE
    this.target.copy(this.target0)
    this.camera.position.copy(this.position0)
    this.camera.up.copy(this.up0)
    this.camera.zoom = this.zoom0
    this._eye.subVectors(this.camera.position, this.target)
    this.camera.lookAt(this.target)
    ;(this as any).dispatchEvent(CHANGE_EVENT)
    LAST_POSITION.copy(this.camera.position)
    LAST_ZOOM.value = this.camera.zoom
  }
}
