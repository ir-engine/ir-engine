import { Component } from "../../ecs/classes/Component"
import { Types } from "../../ecs/types/Types"

export class MediaStreamComponent extends Component<any> {
  static instance: MediaStreamComponent = null
  public videoPaused = false
  public audioPaused = false
  public mediaStream: MediaStream

  localScreen
  camVideoProducer
  camAudioProducer
  screenVideoProducer
  screenAudioProducer
  consumers: any[] = []
  screenShareVideoPaused = false
  screenShareAudioPaused = false
  constructor() {
    super()
    MediaStreamComponent.instance = this
    this.consumers = []
    this.mediaStream = null
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

MediaStreamComponent.schema = {
  initialized: { type: Types.Boolean },
  localScreen: { type: Types.Ref },
  camVideoProducer: { type: Types.Ref },
  camAudioProducer: { type: Types.Ref },
  screenVideoProducer: { type: Types.Ref },
  screenAudioProducer: { type: Types.Ref },
  consumers: { type: Types.Array },
  screenShareVideoPaused: { type: Types.Boolean },
  screenShareAudioPaused: { type: Types.Boolean },
  videoPaused: { type: Types.Boolean },
  audioPaused: { type: Types.Boolean },
  mediaStream: { type: Types.Ref }
}
