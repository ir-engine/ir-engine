/* eslint-disable no-prototype-builtins */
import AFRAME from 'aframe'
import PropertyMapper from './ComponentUtils'
import secondsToString from '../../../utils/secondsToString'

const THREE = AFRAME.THREE

export const ComponentName = 'video-controls'

export interface buffered {
  start: number,
  end: number
}

export interface Data {
  [key: string]: any,
  viewportWidth: number,
  barHeight: number,
  videosrc: string,
  backButtonHref: string,
  playing: boolean
}

export const ComponentSchema: AFRAME.MultiPropertySchema<Data> = {
  viewportWidth: { default: 1 },
  barHeight: { default: 0.12 },
  videosrc: { default: 'videosrc' },
  backButtonHref: { default: '/' },
  playing: { default: false }
}

export interface Props {
  createTimeline: ({ name, width, height, color, t, y, z, opacity }) => THREE.Mesh,
  createBufferedBar: ({ xStart, width, height, name }) => THREE.Mesh,
  setTimelineWidth: (mesh: THREE.Mesh, width: number) => void,
  updateBuffered: () => void,
  getBarFullWidth: (width: number) => void,
  createTimelineButton: ({ name, x, size, map }) => THREE.Mesh,
  createText: (text: string, width: number, height: number,
    fontSize: number, wrapCount: number, align: string,
    baseline: string, anchor: string) => AFRAME.Entity,
  createBackground: (w: number, h: number, color: string, x: number, y: number, z: number, opacity: number) => AFRAME.Entity,
  createTimeRemaining: (x: number) => AFRAME.Entity,
  updateTimeRemainingText: (text: string) => void,
  updateSeekBar: () => void,
  createControls: () => void,
  teardownControls: () => void,
  playBtnImageMap: any,
  pauseBtnImageMap: any,
  backBtnImageMap: any,
  addHandlers: () => void,
  removeHandlers: () => void,
  clickHandler: (e: any) => void,
  playPauseHandler: () => void,
  seekHandler: (e: any) => void,
  backButtonHandler: () => void,
  duration: number,
  bufferedArr: buffered[],
  timeline: {},
  fullBarName: string,
  currentTimeBarName: string,
  playPauseButtonName: string,
  timeRemainingTextName: string,
  backButtonName: string
  videoEl: HTMLVideoElement,
  cameraAngleHandler: (e: any) => void,
  setTimelineVisibility(visibility: boolean),
  firstCreate: boolean
}

export const Component: AFRAME.ComponentDefinition<Props> = {
  schema: ComponentSchema,
  data: {
  } as Data,

  videoEl: null,
  duration: 0,
  bufferedArr: [] as buffered[],
  timeline: {},
  playBtnImageMap: null,
  pauseBtnImageMap: null,
  backBtnImageMap: null,
  fullBarName: 'fullBarTimeline',
  currentTimeBarName: 'currentTimeBarTimeline',
  playPauseButtonName: 'playPauseButton',
  backButtonName: 'backButton',
  timeRemainingTextName: 'timeRemainingText',
  firstCreate: true,

  init() {
    const loader = new THREE.TextureLoader()

    this.videoEl = document.querySelector(this.data.videosrc)
    this.duration = this.videoEl.duration

    this.el.classList.add('clickable')
    this.el.setAttribute('clickable', { clickevent: 'playpause' })

    this.el.setAttribute('highlight__playpause', { id: 'playpause', meshes: [this.playPauseButtonName] })
    this.el.setAttribute('highlight__back', { id: 'back', meshes: [this.backButtonName] })

    this.el.setAttribute('camera-angle', {})
    this.el.setAttribute('fade', { fadeInEvent: 'fade-in-video-controls', fadeOutEvent: 'fade-out-video-controls' })

    // TODO: make pause/play icons the same for CSS and VR versions.
    // currently CSS is using MUI icons, and VR is using images in public/icons/
    const playBtnImageSrc = '/icons/play-shadow.png'
    const pauseBtnImageSrc = '/icons/pause-shadow.png'
    const backBtnImageSrc = '/icons/back-btn-shadow.png'
    this.playBtnImageMap = loader.load(playBtnImageSrc)
    this.pauseBtnImageMap = loader.load(pauseBtnImageSrc)
    this.backBtnImageMap = loader.load(backBtnImageSrc)
    if (this.el.sceneEl?.hasLoaded) this.createControls()
    else this.el.sceneEl?.addEventListener('loaded', this.createControls.bind(this))
  },

  play() {
    this.addHandlers()
  },

  pause() {
    this.removeHandlers()
  },

  update(oldData: Data) {
    const changedData = Object.keys(this.data).filter(x => this.data[x] !== oldData[x])
    if (changedData.includes('viewportWidth')) {
      this.teardownControls()
      this.createControls()
    }
    if (['playing'].some(prop => changedData.includes(prop))) {
      const playPauseButton = this.el.getObject3D(this.playPauseButtonName)

      if (playPauseButton) playPauseButton.material.map = this.data.playing ? this.pauseBtnImageMap : this.playBtnImageMap
    }
  },

  tick() {
    this.updateSeekBar()
    // setBufferedArr(getArrayFromTimeRanges((videoEl as HTMLVideoElement).buffered))
    // if bufferedArr has changed:
    //   dispatch buffer-change event (can we use a videoEl event instead?)
    //   updateBuffered() if inVR
    this.updateTimeRemainingText()
  },

  // function getArrayFromTimeRanges(timeRanges) {
  //   const output = []
  //   for (let i = 0; i < timeRanges.length; i++) {
  //     output.push({
  //       start: timeRanges.start(i),
  //       end: timeRanges.end(i)
  //     })
  //   }
  //   return output
  // }

  remove() {
    this.el.removeAttribute('camera-angle')
  },

  createControls() {
    const fullBar = this.createTimeline({
      name: this.fullBarName,
      width: this.getBarFullWidth(this.data.viewportWidth),
      height: this.data.barHeight,
      opacity: 0.5,
      t: 1,
      color: 0xFFFFFF
    })
    const currentTimeBar = this.createTimeline({
      name: this.currentTimeBarName,
      width: this.getBarFullWidth(this.data.viewportWidth),
      height: this.data.barHeight,
      opacity: 1,
      t: 1,
      color: 0x00ceff
    })
    currentTimeBar.position.z += 0.0005
    // position the current time bar slightly in front of full bar, so it's colour is not changed

    const playPauseButton = this.createTimelineButton({
      name: this.playPauseButtonName,
      size: 1,
      x: fullBar.position.x - 0.8,
      map: this.data.playing ? this.pauseBtnImageMap : this.playBtnImageMap
    })

    const backButton = this.createTimelineButton({
      name: this.backButtonName,
      size: 1,
      x: fullBar.position.x - 2,
      map: this.backBtnImageMap
    })

    const timeRemainingText = this.createTimeRemaining(fullBar.position.x)
    this.timeline[this.fullBarName] = { mesh: fullBar }
    this.timeline[this.currentTimeBarName] = { mesh: currentTimeBar }
    this.timeline[this.playPauseButtonName] = { mesh: playPauseButton }
    this.timeline[this.backButtonName] = { mesh: backButton }
    this.timeline[this.timeRemainingTextName] = { entity: timeRemainingText }

    this.el.setObject3D(fullBar.name, fullBar)
    this.el.setObject3D(currentTimeBar.name, currentTimeBar)
    this.el.setObject3D(playPauseButton.name, playPauseButton)
    this.el.setObject3D(backButton.name, backButton)
    // append child because it's an aframe entity instead
    this.el.appendChild(timeRemainingText)
    // but also add as THREE.js object
    this.el.setObject3D(this.timeRemainingTextName, timeRemainingText.object3D)

    // fade controls after timeout after they are first created
    if (this.firstCreate) {
      const setTimelineVisibility = this.setTimelineVisibility.bind(this)
      const el = this.el
      setTimeout(() => {
        if (el.components['camera-angle'].direction === 'out') setTimelineVisibility(false)
      }, 5 * 1000)
      this.firstCreate = false
    }
  },

  teardownControls() {
    Object.entries(this.timeline).forEach(([name, value]) => {
      if (this.el.object3DMap.hasOwnProperty(name)) {
        this.el.removeObject3D(name)
      }
      // if an aframe entity, remove it
      // @ts-ignore
      if (value.entity) {
        // @ts-ignore
        this.el.removeChild(value.entity)
      }
    })
    this.timeline = []
  },

  createTimeline({ name, width, height, color, t, opacity = 1 }) {
    const matTimeline = new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      transparent: opacity < 1,
      opacity,
      color
    })

    const geomTimeline = new THREE.PlaneBufferGeometry(1, height)
    const meshTimeline = new THREE.Mesh(geomTimeline, matTimeline)
    meshTimeline.name = name
    // translate geom positions so that it can grow from the left
    meshTimeline.position.x = -width / 2

    this.setTimelineWidth(meshTimeline, width * t)
    return meshTimeline
  },

  setTimelineWidth(mesh, width) {
    const positions = (mesh.geometry as any).attributes.position.array as Array<number>
    // top left x
    positions[0] = 0
    // bottom left x
    positions[6] = 0
    // top right x
    positions[3] = width
    // bottom right x
    positions[9] = width
  },

  createBufferedBar({ xStart, width, height, name }) {
    const matBufferedBar = new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      transparent: true,
      opacity: 0.5,
      color: 0xffffff,
      morphTargets: true
    })

    const minWidth = 0.001 * width
    const geomBufferedBar = new THREE.PlaneBufferGeometry(minWidth, height)
    geomBufferedBar.translate(minWidth / 2, 0, 0)
    geomBufferedBar.morphAttributes.position = []

    const bufferedPositions = geomBufferedBar.attributes.position.array
    const bufferedMorphPositions = []

    const minWidthPercent = 0.001
    for (let j = 0; j < bufferedPositions.length; j += 3) {
      const x = bufferedPositions[j]
      const y = bufferedPositions[j + 1]
      const z = bufferedPositions[j + 2]
      bufferedMorphPositions.push(
        x / minWidthPercent,
        y,
        z
      )
    }

    geomBufferedBar.morphAttributes.position[0] = new THREE.Float32BufferAttribute(bufferedMorphPositions, 3)

    const meshBufferedBar = new THREE.Mesh(geomBufferedBar, matBufferedBar)
    meshBufferedBar.name = name
    // translate geom positions so that it can grow from the left
    meshBufferedBar.position.x = width * (-1 / 2 + xStart)

    // setBufferedBars(bars => [...bars, meshBufferedBar])
    this.el.setObject3D(meshBufferedBar.name, meshBufferedBar)
    return meshBufferedBar
  },

  updateBuffered() {
    let i = 0
    const bufferedLengths = this.bufferedArr.length

    const currentBufferedIndices = []
    this.bufferedBars.forEach(obj => currentBufferedIndices.push(+obj.name.match(/\d+$/)))

    while (i < bufferedLengths) {
      const start = this.bufferedArr[i].start
      const end = this.bufferedArr[i].end
      if (currentBufferedIndices.includes(i)) {
        const meshBuffered = this.bufferedBars[i]
        meshBuffered.position.x = (-1 / 2 + (start / this.duration)) * this.getBarFullWidth(this.data.viewportWidth)
        const bufferedPercent = (end - start) / this.duration
        meshBuffered.morphTargetInfluences[0] = bufferedPercent
      } else {
        if (start !== undefined && end !== undefined) {
          this.createBufferedBar({
            xStart: start / this.duration,
            width: this.getBarFullWidth(this.data.viewportWidth),
            height: this.data.barHeight,
            name: 'bufferedBar' + i
          })
        }
      }
      i++
    }
  },

  createTimelineButton({ name, x, size, map }) {
    const matButton = new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      transparent: true,
      opacity: 0.8,
      map
    })

    const geomButton = new THREE.PlaneBufferGeometry(size, size)
    const meshButton = new THREE.Mesh(geomButton, matButton)
    meshButton.name = name
    // translate geom positions so that it can grow from the left
    meshButton.position.x = x
    return meshButton
  },

  createText(text: string, width: number, height: number, fontSize: number, wrapCount: number, align: string,
    baseline: string, anchor: string) {
    const textEntity = document.createElement('a-entity')

    textEntity.setAttribute('text-cell', {
      font: 'roboto',
      width: width,
      height: height,
      align: align,
      baseline: baseline,
      color: '#FFF',
      transparent: false,
      fontsize: fontSize,
      text: text,
      wrapcount: wrapCount,
      anchor: anchor
    })
    return textEntity
  },

  createBackground(width: number, height: number, color: string, x: number, y: number, z: number, opacity: number = 1) {
    const bg = document.createElement('a-plane')
    bg.setAttribute('color', color)
    bg.setAttribute('width', width)
    bg.setAttribute('height', height)
    if (opacity !== 1) bg.setAttribute('opacity', opacity)
    bg.object3D.position.set(x + width / 2, y, z)

    return bg
  },

  createTimeRemaining(x: number) {
    const textEntity = this.createText('time remaining', 0.75, 0.21, 7, 40, 'left', 'center', 'center')
    this.timeRemainingTextEl = textEntity
    const textBG = this.createBackground(0.75, 0.21, 'black', x, 0.26, -0.01, 0.15)

    textBG.appendChild(textEntity)

    return textBG
  },

  getBarFullWidth(width) {
    return width / 200
  },

  updateSeekBar() {
    const currentTimeBar = this.el.getObject3D(this.currentTimeBarName)
    const currentTime = this.videoEl.currentTime
    const duration = this.videoEl.duration

    if (!currentTime || !duration) return
    this.setTimelineWidth(currentTimeBar, this.getBarFullWidth(this.data.viewportWidth) * (currentTime / duration))
    currentTimeBar.geometry.attributes.position.needsUpdate = true
  },

  updateTimeRemainingText() {
    const currentTime = this.videoEl.currentTime
    const duration = this.videoEl.duration
    const timeRemaining = duration - currentTime
    this.timeRemainingTextEl.setAttribute('text-cell', { text: '-' + secondsToString(timeRemaining) })
  },

  clickHandler(e) {
    switch (e.detail.intersection.object.name) {
      case this.playPauseButtonName:
        this.playPauseHandler()
        break
      case this.fullBarName:
      case this.currentTimeBarName:
        this.seekHandler(e)
        break
      case this.backButtonName:
        this.backButtonHandler()
        break
    }
  },

  seekHandler(e) {
    const t = e.detail.intersection.uv.x
    const duration = this.videoEl.duration
    const newCurrentTime = t * (duration || 0) // default duration to 0 because it is possibly NaN if video metadata not loaded
    this.videoEl.currentTime = newCurrentTime
    this.updateSeekBar()
  },

  playPauseHandler() {
    let playing = false
    try {
      if (this.videoEl.paused) {
        this.videoEl.play()
        playing = true
      } else {
        this.videoEl.pause()
        playing = false
      }
    } catch (error) {
      console.log('error in playPauseHandler')
      console.error(error)
    }

    this.el.setAttribute('playing', playing)
    const clickEvent = new CustomEvent('setPlaying',
      {
        bubbles: true,
        detail: playing
      }
    )
    this.el.dispatchEvent(clickEvent)
  },

  backButtonHandler() {
    const clickEvent = new CustomEvent('navigate',
      {
        bubbles: true,
        detail: { url: this.data.backButtonHref }
      }
    )
    this.el.dispatchEvent(clickEvent)
  },

  cameraAngleHandler(e: any) {
    const visibility = e.detail.direction === 'in'
    if (e.detail.axis === 'y') this.setTimelineVisibility(visibility)
  },

  setTimelineVisibility(visibility: boolean) {
    visibility ? this.el.emit('fade-in-video-controls') : this.el.emit('fade-out-video-controls')
    this.el.getObject3D(this.timeRemainingTextName).visible = visibility
  },

  addHandlers: function() {
    this.el.addEventListener('playpause', this.clickHandler.bind(this))
    this.el.addEventListener('camera-passed-threshold', this.cameraAngleHandler.bind(this))
  },

  removeHandlers: function () {
    this.el.removeEventListener('playpause', this.clickHandler)
    this.el.removeEventListener('camera-passed-threshold', this.cameraAngleHandler.bind(this))
  }
}

const primitiveProps = ['videosrc', 'viewportWidth', 'barHeight', 'backButtonHref', 'playing']

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
