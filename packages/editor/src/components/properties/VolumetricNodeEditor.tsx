import React from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { VolumetricComponent } from '@xrengine/engine/src/scene/components/VolumetricComponent'

import VideocamIcon from '@mui/icons-material/Videocam'

import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

/**
 * VolumetricNodeEditor provides the editor view to customize properties.
 *
 * @param       {any} props
 * @constructor
 */
export const VolumetricNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const volumetricComponent = getComponent(props.node.entity, VolumetricComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.volumetric.name')}
      description={t('editor:properties.volumetric.description')}
    >
      <InputGroup name="useLoadingEffect" label={t('editor:properties.volumetric.lbl-useLoadingEffect')}>
        <BooleanInput
          onChange={updateProperty(VolumetricComponent, 'useLoadingEffect')}
          value={volumetricComponent.useLoadingEffect.value}
        />
      </InputGroup>
    </NodeEditor>
  )
}

//setting iconComponent with icon name
VolumetricNodeEditor.iconComponent = VideocamIcon

export default VolumetricNodeEditor
