/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import PanToolIcon from '@mui/icons-material/PanTool'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { defineQuery, useQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { CallbackComponent } from '@etherealengine/spatial/src/common/CallbackComponent'

import { UUIDComponent, getComponent, hasComponent, useComponent } from '@etherealengine/ecs'
import BooleanInput from '@etherealengine/editor/src/components/inputs/BooleanInput'
import InputGroup from '@etherealengine/editor/src/components/inputs/InputGroup'
import SelectInput from '@etherealengine/editor/src/components/inputs/SelectInput'
import { NodeEditor } from '@etherealengine/editor/src/components/properties/NodeEditor'
import {
  EditorComponentType,
  commitProperty,
  updateProperty
} from '@etherealengine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@etherealengine/editor/src/functions/EditorControlFunctions'
import { SelectionState } from '@etherealengine/editor/src/services/SelectionServices'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { TriggerComponent } from '@etherealengine/spatial/src/physics/components/TriggerComponent'
import Slider from '@etherealengine/ui/src/primitives/tailwind/Slider'
import { VideoTriggerComponent } from './VideoTriggerComponent'
import { MediaComponent } from './scene/components/MediaComponent'
import { VideoComponent } from './scene/components/VideoComponent'

const callbackQuery = defineQuery([CallbackComponent])

export const VideoTriggerNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const component = useComponent(props.entity, VideoTriggerComponent)

  const availableVideos = useQuery([VideoComponent]).map((entity) => {
    const name = getComponent(entity, NameComponent)
    const uuid = getComponent(entity, UUIDComponent)
    return {
      label: name,
      value: uuid
    }
  })

  const availableMedia = useQuery([MediaComponent]).map((entity) => {
    const name = getComponent(entity, NameComponent)
    const uuid = getComponent(entity, UUIDComponent)
    return {
      label: name,
      value: uuid
    }
  })

  useEffect(() => {
    if (!hasComponent(props.entity, TriggerComponent)) {
      const nodes = SelectionState.getSelectedEntities()
      EditorControlFunctions.addOrRemoveComponent(nodes, TriggerComponent, true)
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.videoTrigger.name')}
      description={t('editor:properties.videoTrigger.description')}
    >
      <InputGroup name="VideoEntity" label={t('editor:properties.videoTrigger.lbl-video')}>
        <SelectInput
          key={props.entity}
          options={availableVideos}
          value={component.videoEntityUUID.value!}
          onChange={commitProperty(VideoTriggerComponent, 'videoEntityUUID') as any}
        />
      </InputGroup>
      <InputGroup name="MediaEntity" label={t('editor:properties.videoTrigger.lbl-media')}>
        <SelectInput
          key={props.entity}
          options={availableMedia}
          value={component.mediaEntityUUID.value!}
          onChange={commitProperty(VideoTriggerComponent, 'mediaEntityUUID') as any}
        />
      </InputGroup>
      <InputGroup name="ResetOnEnter" label={t('editor:properties.videoTrigger.lbl-resetEnter')}>
        <BooleanInput
          value={component.resetEnter.value}
          onChange={commitProperty(VideoTriggerComponent, 'resetEnter')}
        />
      </InputGroup>
      <InputGroup name="ResetOnExit" label={t('editor:properties.videoTrigger.lbl-resetExit')}>
        <BooleanInput value={component.resetExit.value} onChange={commitProperty(VideoTriggerComponent, 'resetExit')} />
      </InputGroup>

      <InputGroup name="TargetAudioVolume" label={t('editor:properties.videoTrigger.lbl-tagetAudioVolume')}>
        <Slider
          min={0}
          max={100}
          step={1}
          value={component.targetAudioVolume.value}
          onChange={updateProperty(VideoTriggerComponent, 'targetAudioVolume')}
          onRelease={() => commitProperty(VideoTriggerComponent, 'targetAudioVolume')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

VideoTriggerNodeEditor.iconComponent = PanToolIcon

export default VideoTriggerNodeEditor
