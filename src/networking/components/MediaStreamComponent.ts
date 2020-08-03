// TODO: Clean me up, add schema, etc
import { Component } from "ecsy"

export default class MediaStreamComponent extends Component<any> {
  static instance: MediaStreamComponent
  initialized = false
  localScreen
  camVideoProducer
  camAudioProducer
  screenVideoProducer
  screenAudioProducer
  consumers = []
  screenShareVideoPaused = false
  screenShareAudioPaused = false

  public videoPaused = false
  public audioPaused = false
  public mediaStream: MediaStream

  constructor() {
    super()
    MediaStreamComponent.instance = this
    this.videoPaused = true
    this.audioPaused = true
  }

  public toggleVideoPaused(): boolean {
    this.videoPaused = !this.videoPaused
    return this.videoPaused
  }

  public toggleAudioPaused(): boolean {
    this.audioPaused = !this.audioPaused
    return this.audioPaused
  }
}
