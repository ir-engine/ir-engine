import { Audio, Object3D, PositionalAudio } from 'three'

export const AudioType = {
  Stereo: 'stereo',
  PannerNode: 'pannernode'
}

export const DistanceModelType = {
  Linear: 'linear',
  Inverse: 'inverse',
  Exponential: 'exponential'
}

export const AudioTypeOptions = Object.values(AudioType).map((v) => ({
  label: v,
  value: v
}))

export const DistanceModelOptions = Object.values(DistanceModelType).map((v) => ({
  label: v,
  value: v
}))

const elementPlaying = (element: HTMLMediaElement): boolean => {
  return element && !!(element.currentTime > 0 && !element.paused && !element.ended && element.readyState > 2)
}

export default class AudioSource extends Object3D {
  el: any
  _src: string
  audioListener: any
  controls: boolean
  _audioType: any
  audio: any
  audioSource: any
  isSynced: boolean
  constructor(audioListener, elTag = 'audio', id?: string) {
    super()

    let el: HTMLVideoElement | HTMLAudioElement = null!
    if (elTag === 'video' && id) {
      const videoElement = document.getElementById(id) as HTMLVideoElement
      if (videoElement) {
        el = videoElement
      }
    }

    if (!el) {
      el = document.createElement(elTag) as any
      el.setAttribute('crossOrigin', 'anonymous')
      el.setAttribute('loop', 'true')
      el.setAttribute('preload', 'none')
      el.setAttribute('playsInline', 'true')
      el.setAttribute('playsinline', 'true')
      el.setAttribute('webkit-playsInline', 'true')
      el.setAttribute('webkit-playsinline', 'true')
      el.setAttribute('muted', 'true')
      el.muted = true // Needed for some browsers to load videos
    }

    this.el = el
    this.audioListener = audioListener
    this.controls = true
    this.audioType = AudioType.PannerNode
    this.volume = 1
  }

  get src() {
    return this._src
  }
  set src(value) {
    this._src = value
    this.load().catch(console.error)
  }
  get duration() {
    return this.el.duration
  }
  get autoPlay() {
    return this.el.autoplay
  }
  set autoPlay(value) {
    this.el.autoplay = value
  }
  get loop() {
    return this.el.loop
  }
  set loop(value) {
    this.el.loop = value
  }
  get audioType() {
    return this._audioType
  }
  set audioType(type) {
    if (type === this._audioType) return
    let audio
    const oldAudio = this.audio
    if (type === AudioType.PannerNode) {
      audio = new PositionalAudio(this.audioListener)
    } else {
      audio = new Audio(this.audioListener)
    }
    if (oldAudio) {
      audio.gain.gain.value = oldAudio.getVolume()
      if (this.audioSource) {
        oldAudio.disconnect()
      }
      ;(this as any).remove(oldAudio)
    }
    if (this.audioSource) {
      audio.setNodeSource(this.audioSource)
    }
    this.audio = audio
    ;(this as any).add(audio)
    this._audioType = type
  }
  get volume() {
    return this.audio.getVolume()
  }
  set volume(value) {
    this.audio.gain.gain.value = value
  }
  get distanceModel() {
    if (this.audioType === AudioType.PannerNode) {
      return this.audio.getDistanceModel()
    }
    return null
  }
  set distanceModel(value) {
    if (this.audioType === AudioType.PannerNode) {
      this.audio.setDistanceModel(value)
    }
  }
  get rolloffFactor() {
    if (this.audioType === AudioType.PannerNode) {
      return this.audio.getRolloffFactor()
    }
    return null
  }
  set rolloffFactor(value) {
    if (this.audioType === AudioType.PannerNode) {
      this.audio.setRolloffFactor(value)
      return
    }
  }
  get refDistance() {
    if (this.audioType === AudioType.PannerNode) {
      return this.audio.getRefDistance()
    }
    return null
  }
  set refDistance(value) {
    if (this.audioType === AudioType.PannerNode) {
      this.audio.setRefDistance(value)
    }
  }
  get maxDistance() {
    if (this.audioType === AudioType.PannerNode) {
      return this.audio.getMaxDistance()
    }
    return null
  }
  set maxDistance(value) {
    if (this.audioType === AudioType.PannerNode) {
      this.audio.setMaxDistance(value)
    }
  }
  get coneInnerAngle() {
    if (this.audioType === AudioType.PannerNode) {
      return this.audio.panner.coneInnerAngle
    }
    return null
  }
  set coneInnerAngle(value) {
    if (this.audioType === AudioType.PannerNode) {
      this.audio.panner.coneInnerAngle = value
    }
  }
  get coneOuterAngle() {
    if (this.audioType === AudioType.PannerNode) {
      return this.audio.panner.coneOuterAngle
    }
    return null
  }
  set coneOuterAngle(value) {
    if (this.audioType === AudioType.PannerNode) {
      this.audio.panner.coneOuterAngle = value
    }
  }
  get coneOuterGain() {
    if (this.audioType === AudioType.PannerNode) {
      return this.audio.panner.coneOuterGain
    }
    return null
  }
  set coneOuterGain(value) {
    if (this.audioType === AudioType.PannerNode) {
      this.audio.panner.coneOuterGain = value
    }
  }
  loadMedia(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.el.src = this._src

      // If media source requires to be synchronized then pause it for now.
      if (this.isSynced) {
        this.el.pause()
      }

      let cleanup: any = null
      const onLoadedData = () => {
        cleanup()
        resolve()
      }
      const onError = (error) => {
        cleanup()
        console.log(`Error loading video "${this.el.src}"`)
        resolve()
      }
      cleanup = () => {
        this.el.removeEventListener('loadeddata', onLoadedData)
        this.el.removeEventListener('error', onError)
      }
      this.el.addEventListener('loadeddata', onLoadedData)
      this.el.addEventListener('error', onError)
      //added resolve here just to make promise fullfill
      resolve()
    })
  }
  async load(src?: string, contentType?: string): Promise<this> {
    await this.loadMedia()
    if (!this.audioSource) {
      this.audioSource = this.audioListener.context.createMediaElementSource(this.el)
      this.audio.setNodeSource(this.audioSource)
    }
    return this
  }
  copy(source, recursive = true) {
    super.copy(source, false)
    if (recursive) {
      for (let i = 0; i < source.children.length; i++) {
        const child = source.children[i]
        if (child !== source.audio) {
          ;(this as any).add(child.clone())
        }
      }
    }
    this.controls = source.controls
    this.autoPlay = source.autoPlay
    this.loop = source.loop
    this.audioType = source.audioType
    this.volume = source.volume
    this.distanceModel = source.distanceModel
    this.rolloffFactor = source.rolloffFactor
    this.refDistance = source.refDistance
    this.maxDistance = source.maxDistance
    this.coneInnerAngle = source.coneInnerAngle
    this.coneOuterAngle = source.coneOuterAngle
    this.coneOuterGain = source.coneOuterGain
    this._src = source._src
    this.isSynced = source.synchronize
    return this
  }
  play() {
    this.el.play()
  }
  pause() {
    this.el.pause()
  }
  toggle() {
    if (elementPlaying(this.el)) {
      this.pause()
    } else {
      this.play()
    }
  }
}
