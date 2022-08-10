import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { VideoComponent } from '@xrengine/engine/src/scene/components/VideoComponent'

import VideocamIcon from '@mui/icons-material/Videocam'

import InputGroup from '../inputs/InputGroup'
import { ControlledStringInput } from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

/**
 * VideoNodeEditor used to render editor view for property customization.
 *
 * @param       {any} props
 * @constructor
 */
export const VideoNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const [_, setState] = useState(0)
  const obj3d = getComponent(props.node.entity, Object3DComponent)?.value

  const forceUpdate = () => setState(Math.random())

  useEffect(() => {
    if (obj3d && obj3d.userData.videoEl) {
      obj3d.userData.videoEl.addEventListener('playing', forceUpdate)
      obj3d.userData.videoEl.addEventListener('pause', forceUpdate)
    }
    return () => {
      if (obj3d && obj3d.userData.videoEl) {
        obj3d.userData.videoEl.removeEventListener('playing', forceUpdate)
        obj3d.userData.videoEl.removeEventListener('pause', forceUpdate)
      }
    }
  }, [props.node.entity])

  const videoComponent = getComponent(props.node.entity, VideoComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.video.name')}
      description={t('editor:properties.video.description')}
    >
      <InputGroup name="Location" label={t('editor:properties.video.lbl-id')}>
        <ControlledStringInput
          value={videoComponent.elementId}
          onChange={updateProperty(VideoComponent, 'elementId')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

// setting iconComponent with icon name
VideoNodeEditor.iconComponent = VideocamIcon

export default VideoNodeEditor
