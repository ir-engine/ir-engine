import Player from './Player'
import MP4Reader from './MP4Reader'
import Stream from './Stream'
import Bytestream from './Bytestream'
import Size from './Size'

import { timeout } from './utils'

type Statistics = {
  elapsed?: number
  videoStartTime?: number
  videoPictureCounter?: number
  windowStartTime?: number
  windowPictureCounter?: number
  fps?: number
  fpsMin?: number
  fpsMax?: number
  fpsSinceStart?: number
  webGLTextureUploadTime?: number
}

export default class MP4Player {
  static defaultConfig = {
    filter: 'original',
    filterHorLuma: 'optimized',
    filterVerLumaEdge: 'optimized',
    getBoundaryStrengthsA: 'optimized'
  }

  private statistics: Statistics

  public reader: MP4Reader
  public size: Size
  public readonly avc: Player
  public readonly stream: Stream
  public readonly useWorkers: boolean
  public readonly webgl: boolean | 'auto'
  public readonly render: boolean
  public readonly canvas: HTMLCanvasElement

  constructor(stream: Stream, useWorkers: boolean, webgl: boolean, render: boolean) {
    this.stream = stream
    this.useWorkers = useWorkers
    this.webgl = webgl
    this.render = render

    this.statistics = {
      videoStartTime: 0,
      videoPictureCounter: 0,
      windowStartTime: 0,
      windowPictureCounter: 0,
      fps: 0,
      fpsMin: 1000,
      fpsMax: -1000,
      webGLTextureUploadTime: 0
    }

    this.avc = new Player({
      reuseMemory: true,
      workerFile: "./WasmVideoDecoder.js",
      webgl,
      size: {
        width: 640,
        height: 368
      }
    })

    this.webgl = this.avc.webgl

    this.avc.onPictureDecoded = () =>
      this.updateStatistics()

    this.canvas = this.avc.canvas
  }

  private updateStatistics() {
    const stats = this.statistics
    stats.videoPictureCounter += 1
    stats.windowPictureCounter += 1

    const now = Date.now()

    if (!stats.videoStartTime)
      stats.videoStartTime = now

    const videoElapsedTime = now - stats.videoStartTime
    stats.elapsed = videoElapsedTime / 1000


    if (!stats.windowStartTime) {
      stats.windowStartTime = now
      return
    }

      const windowElapsedTime = now - stats.windowStartTime
      let fps = (stats.windowPictureCounter / windowElapsedTime) * 1000
      stats.windowStartTime = now
      stats.windowPictureCounter = 0

      if (fps < stats.fpsMin)
        stats.fpsMin = fps

      if (fps > stats.fpsMax)
        stats.fpsMax = fps

      stats.fps = fps

    fps = (stats.videoPictureCounter / videoElapsedTime) * 1000
    stats.fpsSinceStart = fps
    console.log("videoElapsedTime", videoElapsedTime)
    this.notifyStatisticsUpdateListeners()
  }

  private statisticsUpdateListeners: Function[] = []

  public onStatisticsUpdated(handler: (stats: Statistics) => void) {
    this.statisticsUpdateListeners.push(handler)

    // Return an unsubscribe function
    return () =>
      this.statisticsUpdateListeners =
      this.statisticsUpdateListeners.filter(x => x !== handler)
  }

  private notifyStatisticsUpdateListeners() {
    this.statisticsUpdateListeners.forEach(listener =>
      listener(this.statistics)
    )
  }

  readAll(callback: Function) {
    console.info('MP4Player::readAll()')

    this.stream.readAll({
      onComplete: buffer => {
        this.reader = new MP4Reader(new Bytestream(buffer))
        this.reader.read()

        const video = this.reader.tracks[1]
        this.size = new Size(video.trak.tkhd.width, video.trak.tkhd.height)
        console.info(`MP4Player::readAll(), length: ${this.reader.stream.length}`)

        if (callback)
          callback()
      }
    })
  }

  async play() {
    const reader = this.reader

    if (!reader) {
      this.readAll(() => this.play())
      return
    }

    const video = reader.tracks[1]
    // const audio = reader.tracks[2]

    const avc = reader.tracks[1].trak.mdia.minf.stbl.stsd.avc1.avcC
    const sps = avc.sps[0]
    const pps = avc.pps[0]

    // Decode Sequence & Picture Parameter Sets
    this.avc.decode(sps)
    this.avc.decode(pps)

    // Decode Pictures
    for (let pic = 0; pic < 3000; pic++) {
      await timeout(20)

      for (const nal of video.getSampleNALUnits(pic))
        this.avc.decode(nal)
    }
  }
}
