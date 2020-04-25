import AFRAME from 'aframe'
const THREE = AFRAME.THREE

export const ComponentName = 'player-vr-ui'

type GetIntersection = (entity: AFRAME.Entity) => THREE.Intersection
type CallbackFunctionVariadic = (...args: any[]) => void;
type DetailEvent = AFRAME.DetailEvent<any>

export interface PlayerVrUiComponentProps {
  _playPauseNeedsUpdate: boolean,
  _activePlayButton: boolean,
  _hoverPlayButton: boolean,
  _buttons: Map<string, THREE.Mesh>,
  _listeners: Map<string, CallbackFunctionVariadic>,
  _getIntersection: GetIntersection | null,
  _create: () => void,
  _initListeners: () => void,
  _onRaycasterIntersected: (evt: DetailEvent) => void,
  _onRaycasterIntersectedCleared: () => void,
  _onMouseDown: (evt: DetailEvent) => void,
  _onMouseUp: () => void,
  _attachListeners: () => void,
  _dettachListeners: () => void,
  _enable: () => void,
  _disable: () => void,
  _updatePlayPauseGroup: () => void,
  _onHover: () => void,
  _onPlayPauseButtonTrigger: (buttonName: string) => void,
  _createPlayPauseGroup: (parentGroup: THREE.Group) => void,
  _createPlayPauseButton: (parentGroup: THREE.Group, isPlayButton: boolean) => void
}

export interface PlayerVrUiComponentData {
  disabled: boolean,
  isPlaying: boolean,
  color: number,
  activeColor: number,
  hoverColor: number,
  disabledColor: number,
  disabledOpacity: number
}

export const PlayerVrUiComponentSchema: AFRAME.MultiPropertySchema<PlayerVrUiComponentData> = {
  disabled: { type: 'boolean', default: false },
  isPlaying: { type: 'boolean', default: false },
  color: { default: 0xe8f1ff },
  activeColor: { type: 'number', default: 0xFFD704 },
  hoverColor: { type: 'number', default: 0x04FF5F },
  disabledColor: { type: 'number', default: 0xA9A9A9 },
  disabledOpacity: { type: 'number', default: 0.2 }
}

export const PlayerVrUiComponent: AFRAME.ComponentDefinition<PlayerVrUiComponentProps> = {
  schema: PlayerVrUiComponentSchema,
  data: {
  } as PlayerVrUiComponentData,
  _playPauseNeedsUpdate: false,
  _activePlayButton: false,
  _hoverPlayButton: false,
  _getIntersection: null,
  _buttons: new Map(),
  _listeners: new Map(),

  init() {
    this._create()
    this._initListeners()
  },

  update(oldData) {
    this._updatePlayPauseGroup()
    if (this.data.disabled !== oldData.disabled) {
      if (this.data.disabled) {
        this._disable()
      } else {
        this._enable()
      }
    }
  },

  tick() {
    if (this.data.disabled) {
      return
    }
    if (this._getIntersection) {
      this._onHover()
    }
    if (this._playPauseNeedsUpdate) {
      this._updatePlayPauseGroup()
      this._playPauseNeedsUpdate = false
    }
  },

  remove() {
    this._disable()
    this._buttons.clear()
    this.el.removeObject3D('videocontrols')
  },

  _initListeners() {
    this._listeners = new Map([
      ['raycaster-intersected', this._onRaycasterIntersected.bind(this)],
      ['raycaster-intersected-cleared', this._onRaycasterIntersectedCleared.bind(this)],
      ['mousedown', this._onMouseDown.bind(this)],
      ['mouseup', this._onMouseUp.bind(this)]
    ])
  },

  _attachListeners() {
    this._listeners.forEach((listener, evtName) => this.el.addEventListener(evtName, listener))
  },

  _dettachListeners() {
    this._listeners.forEach((listener, evtName) => this.el.removeEventListener(evtName, listener))
  },

  _enable() {
    this._attachListeners()
  },

  _disable() {
    this._dettachListeners()
    this._activePlayButton = this._hoverPlayButton = false
    this._getIntersection = null
  },

  _onHover() {
    let hoverPlayButton = false
    const intersection = this._getIntersection?.(this.el)
    if (intersection) {
      switch (intersection.object.name) {
        case 'play':
        case 'pause':
          hoverPlayButton = true
          break
      }
    }

    if (this._hoverPlayButton !== hoverPlayButton && !this._activePlayButton) {
      this._playPauseNeedsUpdate = true
    }
    this._hoverPlayButton = hoverPlayButton
  },

  _onRaycasterIntersected(evt) {
    this._getIntersection = evt.detail.getIntersection
  },

  _onRaycasterIntersectedCleared() {
    this._getIntersection = null
    if (this._hoverPlayButton && !this._activePlayButton) {
      this._playPauseNeedsUpdate = true
    }
    this._hoverPlayButton = false
  },

  _onMouseDown(evt) {
    const intersection = evt.detail.intersection
    switch (intersection.object.name) {
      case 'play':
      case 'pause':
        this._onPlayPauseButtonTrigger(intersection.object.name)
        break
    }
  },

  _onMouseUp() {
    if (this._activePlayButton) {
      this._activePlayButton = false
      this._playPauseNeedsUpdate = true
    }
  },

  _onPlayPauseButtonTrigger(buttonName) {
    this._activePlayButton = true
    this._playPauseNeedsUpdate = true
    this.el.emit('trigger' + buttonName)
  },

  _create() {
    const rootGroup = new THREE.Group()

    this._createPlayPauseGroup(rootGroup)

    this.el.setObject3D('videocontrols', rootGroup)
  },

  _createPlayPauseGroup(parentGroup) {
    const playPauseGroup = new THREE.Group()
    playPauseGroup.name = 'playPauseGroup'

    this._createPlayPauseButton(playPauseGroup, true)
    this._createPlayPauseButton(playPauseGroup, false)

    parentGroup.add(playPauseGroup)
  },

  _createPlayPauseButton(parentGroup, isPlayButton) {
    let buttonName

    const playPauseButton = new THREE.Shape()
    const hole = new THREE.Path()
    const playWidth = 0.1
    const playHeight = 0.1

    if (isPlayButton) {
      buttonName = 'play'

      playPauseButton.moveTo(playHeight / 2, 0)
      playPauseButton.lineTo(-playHeight / 2, playWidth / 2)
      playPauseButton.lineTo(-playHeight / 2, -playWidth / 2)
      playPauseButton.lineTo(playHeight / 2, 0)
    } else {
      buttonName = 'pause'

      playPauseButton.moveTo(-playWidth / 2, -playHeight / 2)
      playPauseButton.lineTo(-playWidth / 2, playHeight / 2)
      playPauseButton.moveTo(playWidth / 2, playHeight / 2)
      playPauseButton.lineTo(playWidth / 2, -playHeight / 2)
      hole.moveTo(playWidth / 4, playHeight / 2)
      hole.lineTo(playWidth / 4, -playHeight / 2)
      hole.lineTo(-playWidth / 4, -playHeight / 2)
      hole.lineTo(-playWidth / 4, playHeight / 2)
      playPauseButton.holes = [hole]
    }

    const geomPlayPauseButton = new THREE.ShapeBufferGeometry(playPauseButton)
    const matPlayPauseButton = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      color: this.data.color
    })
    const meshPlayPauseButton = new THREE.Mesh(geomPlayPauseButton, matPlayPauseButton)
    meshPlayPauseButton.name = buttonName

    // button background
    const matButtonBg = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    })
    const geomButtonBg = new THREE.PlaneBufferGeometry(playWidth, playHeight)
    const meshButtonBg = new THREE.Mesh(geomButtonBg, matButtonBg)
    meshButtonBg.name = buttonName
    meshPlayPauseButton.add(meshButtonBg)

    parentGroup.add(meshPlayPauseButton)
    this._buttons.set(buttonName, meshPlayPauseButton)
  },

  _updatePlayPauseGroup() {
    const data = this.data

    const playButton = this._buttons.get('play') as THREE.Mesh
    const pauseButton = this._buttons.get('pause') as THREE.Mesh
    playButton.visible = !data.isPlaying
    pauseButton.visible = data.isPlaying

    let color: number
    let opacity = 1
    let isTransparent = false
    if (data.disabled) {
      isTransparent = true
      opacity = data.disabledOpacity
      color = data.disabledColor
    } else if (this._activePlayButton) {
      color = data.activeColor
    } else {
      color = this._hoverPlayButton ? data.hoverColor : data.color
    }

    [pauseButton, playButton].forEach(button => {
      const material = button.material as THREE.MeshBasicMaterial
      material.opacity = opacity
      material.transparent = isTransparent
      material.color.set(color)
    })
  }
}

const ComponentSystem = {
  name: ComponentName,
  component: PlayerVrUiComponent
}

export default ComponentSystem
