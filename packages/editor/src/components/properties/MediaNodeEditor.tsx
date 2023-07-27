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

import React from 'react'
import { useTranslation } from 'react-i18next'

import { AllFileTypes } from '@etherealengine/engine/src/assets/constants/fileTypes'
import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { getEntityErrors } from '@etherealengine/engine/src/scene/components/ErrorComponent'
import { MediaComponent } from '@etherealengine/engine/src/scene/components/MediaComponent'
import { PlayMode } from '@etherealengine/engine/src/scene/constants/PlayMode'

import { SupportedFileTypes } from '../../constants/AssetTypes'
import ArrayInputGroup from '../inputs/ArrayInputGroup'
import BooleanInput from '../inputs/BooleanInput'
import { Button } from '../inputs/Button'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

const PlayModeOptions = [
  {
    label: 'Single',
    value: PlayMode.single
  },
  {
    label: 'Random',
    value: PlayMode.random
  },
  {
    label: 'Loop',
    value: PlayMode.loop
  },
  {
    label: 'SingleLoop',
    value: PlayMode.singleloop
  }
]

export const MediaNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const media = useComponent(props.entity, MediaComponent)
  const errors = getEntityErrors(props.entity, MediaComponent)

  const toggle = () => {
    media.paused.set(!media.paused.value)
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.media.name')}
      description={t('editor:properties.media.description')}
    >
      {errors ? (
        Object.entries(errors).map(([err, message]) => {
          return <div style={{ marginTop: 2, color: '#FF8C00' }}>{'Error: ' + err + '--' + message}</div>
        })
      ) : (
        <></>
      )}
      <InputGroup name="Volume" label={t('editor:properties.media.lbl-volume')}>
        <CompoundNumericInput
          min={0}
          max={1}
          step={0.01}
          value={media.volume.value}
          onChange={updateProperty(MediaComponent, 'volume')}
        />
      </InputGroup>
      <InputGroup name="Is Music" label={t('editor:properties.media.lbl-isMusic')}>
        <BooleanInput value={media.isMusic.value} onChange={updateProperty(MediaComponent, 'isMusic')} />
      </InputGroup>
      <InputGroup
        name="Controls"
        label={t('editor:properties.media.lbl-controls')}
        info={t('editor:properties.media.info-controls')}
      >
        <BooleanInput value={media.controls.value} onChange={updateProperty(MediaComponent, 'controls')} />
      </InputGroup>
      <InputGroup
        name="Auto Play"
        label={t('editor:properties.media.lbl-paused')}
        info={t('editor:properties.media.info-paused')}
      >
        <BooleanInput value={media.paused.value} onChange={updateProperty(MediaComponent, 'paused')} />
      </InputGroup>
      <InputGroup
        name="Synchronize"
        label={t('editor:properties.media.lbl-synchronize')}
        info={t('editor:properties.media.info-synchronize')}
      >
        <BooleanInput value={media.synchronize.value} onChange={updateProperty(MediaComponent, 'synchronize')} />
      </InputGroup>
      <ArrayInputGroup
        name="Source Paths"
        prefix="Content"
        values={media.resources.value}
        onChange={updateProperty(MediaComponent, 'resources')}
        label={t('editor:properties.media.paths')}
        acceptFileTypes={AllFileTypes}
        itemType={SupportedFileTypes}
      ></ArrayInputGroup>
      <InputGroup name="Play Mode" label={t('editor:properties.media.playmode')}>
        <SelectInput
          key={props.entity}
          options={PlayModeOptions}
          value={media.playMode.value}
          onChange={updateProperty(MediaComponent, 'playMode')}
        />
        {media.resources && media.resources.length > 0 && media.resources[0] && (
          <Button style={{ marginLeft: '5px', width: '60px' }} type="submit" onClick={toggle}>
            {media.paused ? t('editor:properties.media.playtitle') : t('editor:properties.media.pausetitle')}
          </Button>
        )}
      </InputGroup>
    </NodeEditor>
  )
}

export default MediaNodeEditor
