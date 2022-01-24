import VideocamIcon from '@mui/icons-material/Videocam'
import React, { useState } from 'react'
import InputGroup from '../inputs/InputGroup'
import { Button } from '../inputs/Button'
import AudioSourceProperties from './AudioSourceProperties'
import NodeEditor from './NodeEditor'
import { useTranslation } from 'react-i18next'
import SelectInput from '../inputs/SelectInput'
import ArrayInputGroup from '../inputs/ArrayInputGroup'
import { ItemTypes } from '../../constants/AssetTypes'
import { VolumetricFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import { EditorComponentType, updateProperty } from './Util'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { VolumetricComponent } from '@xrengine/engine/src/scene/components/VolumetricComponent'
import { VolumetricPlayMode } from '@xrengine/engine/src/scene/constants/VolumetricPlayMode'
import { toggleVolumetric } from '@xrengine/engine/src/scene/functions/loaders/VolumetricFunctions'

const PlayModeOptions = [
  {
    label: 'Single',
    value: VolumetricPlayMode.Single
  },
  {
    label: 'Random',
    value: VolumetricPlayMode.Random
  },
  {
    label: 'Loop',
    value: VolumetricPlayMode.Loop
  },
  {
    label: 'SingleLoop',
    value: VolumetricPlayMode.SingleLoop
  }
]

/**
 * VolumetricNodeEditor provides the editor view to customize properties.
 *
 * @author Robert Long
 * @param       {any} props
 * @constructor
 */
export const VolumetricNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const [isPlaying, setPlaying] = useState(false)

  const toggle = () => {
    setPlaying(toggleVolumetric(props.node.entity))
  }

  const volumetricComponent = getComponent(props.node.entity, VolumetricComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.volumetric.name')}
      description={t('editor:properties.volumetric.description')}
    >
      <ArrayInputGroup
        name="UVOL Paths"
        prefix="uvol"
        values={volumetricComponent.paths}
        onChange={updateProperty(VolumetricComponent, 'paths')}
        label={t('editor:properties.volumetric.uvolPaths')}
        acceptFileTypes={VolumetricFileTypes}
        itemType={ItemTypes.Volumetrics}
      ></ArrayInputGroup>
      <InputGroup name="Play Mode" label={t('editor:properties.volumetric.playmode')}>
        <SelectInput
          options={PlayModeOptions}
          value={volumetricComponent.playMode}
          onChange={updateProperty(VolumetricComponent, 'playMode')}
        />
        {volumetricComponent.paths && volumetricComponent.paths.length > 0 && volumetricComponent.paths[0] && (
          <Button style={{ marginLeft: '5px', width: '60px' }} type="submit" onClick={toggle}>
            {isPlaying ? t('editor:properties.volumetric.pausetitle') : t('editor:properties.volumetric.playtitle')}
          </Button>
        )}
      </InputGroup>
    </NodeEditor>
  )
}

//setting iconComponent with icon name
VolumetricNodeEditor.iconComponent = VideocamIcon

export default VolumetricNodeEditor
