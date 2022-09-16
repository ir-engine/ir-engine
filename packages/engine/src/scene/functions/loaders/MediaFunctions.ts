import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, setComponent } from '../../../ecs/functions/ComponentFunctions'
import {
  MediaComponent,
  MediaComponentType,
  SCENE_COMPONENT_MEDIA_DEFAULT_VALUES
} from '../../components/MediaComponent'
import { MediaElementComponent } from '../../components/MediaElementComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { PlayMode } from '../../constants/PlayMode'

export const deserializeMedia: ComponentDeserializeFunction = (entity: Entity, data: MediaComponentType) => {
  const props = parseMediaProperties(data)
  setComponent(entity, MediaComponent, {
    ...props,
    currentSource: 0,
    playing: false,
    stopOnNextTrack: false
  })
  getNextPlaylistItem(entity)
}

export const serializeMedia: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, MediaComponent)
  return {
    paths: component.paths,
    playMode: component.playMode,
    controls: component.controls,
    autoplay: component.autoplay,
    autoStartTime: component.autoStartTime
  }
}

export function getNextPlaylistItem(entity: Entity) {
  const mediaComponent = getComponent(entity, MediaComponent)
  let nextTrack = 0
  if (mediaComponent.playMode == PlayMode.Random) {
    nextTrack = Math.floor(Math.random() * mediaComponent.paths.length)
  } else if (mediaComponent.playMode == PlayMode.Single) {
    nextTrack = (mediaComponent.currentSource + 1) % mediaComponent.paths.length
    if (mediaComponent.currentSource + 1 == mediaComponent.paths.length) {
      nextTrack = 0
      mediaComponent.stopOnNextTrack = true
    }
  } else if (mediaComponent.playMode == PlayMode.SingleLoop) {
    nextTrack = mediaComponent.currentSource
  } else {
    //PlayMode.Loop
    nextTrack = (mediaComponent.currentSource + 1) % mediaComponent.paths.length
  }
  return nextTrack
}

/** @todo refactor this into delayed action */
export const updateAutoStartTimeForMedia = (entity: Entity) => {
  const component = getComponent(entity, MediaComponent)
  if (!component) return

  const el = getComponent(entity, MediaElementComponent)

  if (component.startTimer) clearTimeout(component.startTimer)
  if (!component.autoStartTime) return

  const timeDiff = component.autoStartTime - Date.now()

  // If media will play in future then wait.
  if (timeDiff > 0) {
    component.startTimer = setTimeout(() => {
      el.play()
    }, timeDiff)

    return
  }

  const loop = component.playMode === PlayMode.Loop || component.playMode === PlayMode.SingleLoop

  if (!el.src) return

  // If loop is not enable and media is played once for its full duration then don't start it again
  if (!loop && -timeDiff > el.duration) return

  const offset = (-timeDiff / 1000) % el.duration
  el.currentTime = offset
  el.play()
}

const parseMediaProperties = (props: Partial<MediaComponentType>): Partial<MediaComponentType> => {
  const paths = props.paths?.map((p) => p.replace('drcs', 'mp4'))
  return {
    paths: paths ?? SCENE_COMPONENT_MEDIA_DEFAULT_VALUES.paths,
    playMode: props.playMode ?? SCENE_COMPONENT_MEDIA_DEFAULT_VALUES.playMode,
    controls: props.controls ?? SCENE_COMPONENT_MEDIA_DEFAULT_VALUES.controls,
    autoplay: props.autoplay ?? SCENE_COMPONENT_MEDIA_DEFAULT_VALUES.autoplay,
    autoStartTime: props.autoStartTime ?? SCENE_COMPONENT_MEDIA_DEFAULT_VALUES.autoStartTime
  } as Partial<MediaComponentType>
}
