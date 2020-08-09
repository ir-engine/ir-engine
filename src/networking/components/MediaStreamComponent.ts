import { SingletonComponent } from "../../common/components/SingletonComponent"
import { Types } from "ecsy"

export class MediaStreamComponent extends SingletonComponent<any> {
  public initialized = false
  public videoPaused = false
  public audioPaused = false
  public mediaStream: MediaStream

  localScreen
  camVideoProducer
  camAudioProducer
  screenVideoProducer
  screenAudioProducer
  consumers = []
  screenShareVideoPaused = false
  screenShareAudioPaused = false
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
