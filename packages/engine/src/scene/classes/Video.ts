import {
  LinearFilter,
  sRGBEncoding,
  PlaneBufferGeometry,
  MeshBasicMaterial,
  DoubleSide,
  Mesh,
  SphereBufferGeometry,
  RGBAFormat,
  VideoTexture
} from 'three'
import Hls from 'hls.js'
import isHLS from '../functions/isHLS'
import AudioSource from './AudioSource'
import { Engine } from '../../ecs/classes/Engine'
import isDash from '../functions/isDash'

export const VideoProjection = {
  Flat: 'flat' as const,
  Equirectangular360: '360-equirectangular' as const
}

export type VideoProjectionType = typeof VideoProjection.Flat | typeof VideoProjection.Equirectangular360

export default class Video extends AudioSource {
  _texture: any
  _mesh: Mesh
  _projection: VideoProjectionType
  hls: Hls
  dash: any
  startTime: number
  isLivestream: boolean

  constructor(audioListener, id: string) {
    super(audioListener, 'video', id)
    this._texture = new VideoTexture(this.el)
    this._texture.minFilter = LinearFilter
    this._texture.encoding = sRGBEncoding
    const geometry = new PlaneBufferGeometry()
    const material = new MeshBasicMaterial({ color: 0xffffff })
    material.map = this._texture
    material.side = DoubleSide
    this._mesh = new Mesh(geometry, material)
    this._mesh.name = 'VideoMesh'
    this.add(this._mesh)
    this._projection = 'flat'
    this.el.addEventListener('play', () => {
      console.log('video is now playing')
    })
    this.el.addEventListener('pause', () => {
      console.log('video is now paused')
    })
  }
  /// https://resources.theoverlay.io/basscoast-final/manifest.mpd
  async loadVideo() {
    await new Promise<void>(async (resolve, reject) => {
      if (isHLS(this.src)) {
        if (!this.hls) {
          this.hls = new Hls()
        }
        this.hls.on(Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                // try to recover network error
                console.log('fatal network error encountered, try to recover', event, data)
                this.hls.startLoad()
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('fatal media error encountered, try to recover', event, data)
                // this.hls.recoverMediaError();
                break
              default:
                // cannot recover
                console.log('HLS fatal error encountered, destroying video...', event, data)
                this.hls.destroy()
                break
            }
          }
        })
        this.hls.once(Hls.Events.LEVEL_LOADED, () => {
          resolve()
        })
        this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {})
          this.hls.loadSource(this.src)
        })
        this.hls.attachMedia(this.el)
      } else if (isDash(this.src)) {
        // const { MediaPlayer } = await import('dashjs')
        // this.dash = MediaPlayer().create();
        // this.dash.initialize(this.el, src, this.autoPlay)
        // this.dash.on('ERROR', (e) => {
        //   console.log('ERROR', e)
        // })
        // resolve()
      } else {
        this.el.src = this.src
        const onLoadedMetadata = () => {
          console.log('on load metadata')
          cleanup()
          resolve()
        }
        const onError = (error) => {
          cleanup()
          console.log(`Error loading video "${this.el.src}"`, error)
          resolve()
          // reject(
          //   new RethrownError()
          // );
        }
        const cleanup = () => {
          this.el.removeEventListener('loadeddata', onLoadedMetadata)
          this.el.removeEventListener('error', onError)
        }
        this.el.addEventListener('loadeddata', onLoadedMetadata)
        this.el.addEventListener('error', onError)
      }
      if (this.autoPlay) this.play()
    })
  }
  get projection() {
    return this._projection
  }
  set projection(projection) {
    if (projection === this._projection) {
      return
    }
    const material = new MeshBasicMaterial()
    let geometry
    if (projection === '360-equirectangular') {
      geometry = new SphereBufferGeometry(1, 64, 32)
      // invert the geometry on the x-axis so that all of the faces point inward
      geometry.scale(-1, 1, 1)
    } else {
      geometry = new PlaneBufferGeometry()
      material.side = DoubleSide
    }
    material.map = this._texture
    this._projection = projection
    const nextMesh = new Mesh(geometry, material)
    nextMesh.name = 'VideoMesh'
    const meshIndex = (this as any).children.indexOf(this._mesh)
    if (meshIndex === -1) {
      ;(this as any).add(nextMesh)
    } else {
      ;(this as any).children.splice(meshIndex, 1, nextMesh)
      nextMesh.parent = this
    }
    this._mesh = nextMesh
  }
  async load() {
    if (!this.src) return this
    await this.loadVideo()
    if (Engine.useAudioSystem) {
      this.audioSource = this.audioListener.context.createMediaElementSource(this.el)
      this.audio.setNodeSource(this.audioSource)
    }
    if (this._texture.format === RGBAFormat) {
      ;(this._mesh.material as MeshBasicMaterial).transparent = true
    }
    ;(this._mesh.material as MeshBasicMaterial).map = this._texture
    ;(this._mesh.material as MeshBasicMaterial).needsUpdate = true
    return this
  }
  clone(recursive) {
    return new (this.constructor as any)(this.audioListener).copy(this, recursive)
  }
  copy(source, recursive = true) {
    super.copy(source, false)
    if (recursive) {
      for (let i = 0; i < source.children.length; i++) {
        const child = source.children[i]
        if (child !== source.audio && child !== source._mesh) {
          ;(this as any).add(child.clone())
        }
      }
    }
    this.projection = source.projection
    this.isSynced = source.isSynced
    return this
  }
  seek(value: number) {
    if (this.dash) {
      this.dash.seek(value)
      return
    }
    this.el.currentTime = value
  }
}
