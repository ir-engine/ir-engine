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

import { VolumetricFileTypes } from '@etherealengine/engine/src/assets/constants/fileTypes'
import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { VolumetricComponent } from '@etherealengine/engine/src/scene/components/VolumetricComponent'
import { PlayMode } from '@etherealengine/engine/src/scene/constants/PlayMode'

import VideocamIcon from '@mui/icons-material/Videocam'
import { ItemTypes } from '../../constants/AssetTypes'
import ArrayInputGroup from '../inputs/ArrayInputGroup'
import BooleanInput from '../inputs/BooleanInput'
import { Button } from '../inputs/Button'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, commitProperties, commitProperty, updateProperty } from './Util'

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

/**
 * VolumetricNodeEditor provides the editor view to customize properties.
 *
 * @param       {any} props
 * @constructor
 */
export const VolumetricNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const volumetricComponent = useComponent(props.entity, VolumetricComponent)

  const toggle = () => {
    commitProperties(VolumetricComponent, {
      paused: !volumetricComponent.paused.value
    })
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.volumetric.name')}
      description={t('editor:properties.volumetric.description')}
    >
      <InputGroup name="useLoadingEffect" label={t('editor:properties.volumetric.lbl-useLoadingEffect')}>
        <BooleanInput
          onChange={commitProperty(VolumetricComponent, 'useLoadingEffect')}
          value={volumetricComponent.useLoadingEffect.value}
        />
      </InputGroup>

      <InputGroup
        name="Autoplay"
        label={t('editor:properties.media.lbl-autoplay')}
        info={t('editor:properties.media.info-autoplay')}
      >
        <BooleanInput
          onChange={commitProperty(VolumetricComponent, 'autoplay')}
          value={volumetricComponent.autoplay.value}
        />
      </InputGroup>

      <InputGroup name="Volume" label={t('editor:properties.media.lbl-volume')}>
        <CompoundNumericInput
          min={0}
          max={1}
          step={0.01}
          value={volumetricComponent.volume.value}
          onChange={updateProperty(VolumetricComponent, 'volume')}
          onRelease={commitProperty(VolumetricComponent, 'volume')}
        />
      </InputGroup>

      <ArrayInputGroup
        name="Source Paths"
        prefix="Content"
        values={volumetricComponent.paths.value}
        onChange={commitProperty(VolumetricComponent, 'paths')}
        label={t('editor:properties.media.paths')}
        acceptFileTypes={VolumetricFileTypes}
        acceptDropItems={ItemTypes.Volumetrics}
      />

      <InputGroup name="Play Mode" label={t('editor:properties.media.playmode')}>
        <SelectInput
          key={props.entity}
          options={PlayModeOptions}
          value={volumetricComponent.playMode.value}
          onChange={commitProperty(VolumetricComponent, 'playMode')}
        />
        {volumetricComponent.paths && volumetricComponent.paths.length > 0 && volumetricComponent.paths[0] && (
          <Button style={{ marginLeft: '5px', width: '60px' }} type="submit" onClick={toggle}>
            {volumetricComponent.paused.value
              ? t('editor:properties.media.playtitle')
              : t('editor:properties.media.pausetitle')}
          </Button>
        )}
      </InputGroup>
    </NodeEditor>
  )
}

//setting iconComponent with icon name
VolumetricNodeEditor.iconComponent = VideocamIcon

export default VolumetricNodeEditor
