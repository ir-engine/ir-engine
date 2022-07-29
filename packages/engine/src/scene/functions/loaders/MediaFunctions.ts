import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import UpdateableObject3D from '../../classes/UpdateableObject3D'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { MediaComponent, MediaComponentType } from '../../components/MediaComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { UpdatableComponent } from '../../components/UpdatableComponent'
import { PlayMode } from '../../constants/PlayMode'

export const SCENE_COMPONENT_MEDIA = 'media'
export const SCENE_COMPONENT_MEDIA_DEFAULT_VALUES = {
  controls: false,
  autoplay: false,
  autoStartTime: 0,
  paths: [],
  playMode: PlayMode.Loop
} as Partial<MediaComponentType>

export const deserializeMedia: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<MediaComponentType>
) => {
  const props = parseMediaProperties(json.props)
  addComponent(entity, MediaComponent, { ...props, currentSource: 0, playing: false })
  addComponent(entity, Object3DComponent, { value: new UpdateableObject3D() })
  addComponent(entity, UpdatableComponent, {})
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_MEDIA)
}

export const serializeMedia: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, MediaComponent) as MediaComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_MEDIA,
    props: {
      controls: component.controls,
      autoplay: component.autoplay,
      autoStartTime: component.autoStartTime,
      paths: component.paths,
      playMode: component.playMode
    }
  }
}

export const updateAutoStartTimeForMedia = (entity: Entity) => {
  const component = getComponent(entity, MediaComponent)
  if (!component) return

  const obj3d = getComponent(entity, Object3DComponent).value

  if (component.startTimer) clearTimeout(component.startTimer)
  if (!component.autoStartTime) return

  const timeDiff = component.autoStartTime - Date.now()

  // If media will play in future then wait.
  if (timeDiff > 0) {
    component.startTimer = setTimeout(() => {
      if (obj3d?.userData.videoEl) obj3d.userData.videoEl.play()
    }, timeDiff)

    return
  }

  const loop = component.playMode === PlayMode.Loop || component.playMode === PlayMode.SingleLoop

  if (obj3d.userData.videoEl) {
    if (!obj3d.userData.videoEl.src) return

    // If loop is not enable and media is played once for its full duration then don't start it again
    if (!loop && -timeDiff > obj3d.userData.videoEl.duration) return

    const offset = (-timeDiff / 1000) % obj3d.userData.videoEl.duration
    obj3d.userData.videoEl.currentTime = offset
    obj3d.userData.videoEl.play()
  } else {
    if (!obj3d.userData.audioEl.buffer) return

    // If loop is not enable and media is played once for its full duration then don't start it again
    if (!loop && -timeDiff > obj3d.userData.audioEl.buffer.duration) return

    const offset = (-timeDiff / 1000) % obj3d.userData.audioEl.buffer.duration
    obj3d.userData.audioEl.offset = offset
    obj3d.userData.audioEl.play()
  }
}

const parseMediaProperties = (props: MediaComponentType): MediaComponentType => {
  return {
    controls: props.controls ?? SCENE_COMPONENT_MEDIA_DEFAULT_VALUES.controls,
    autoplay: props.autoplay ?? SCENE_COMPONENT_MEDIA_DEFAULT_VALUES.autoplay,
    autoStartTime: props.autoStartTime ?? SCENE_COMPONENT_MEDIA_DEFAULT_VALUES.autoStartTime,
    playMode: props.playMode ?? SCENE_COMPONENT_MEDIA_DEFAULT_VALUES.playMode,
    paths: props.paths ?? SCENE_COMPONENT_MEDIA_DEFAULT_VALUES.paths
  } as MediaComponentType
}
