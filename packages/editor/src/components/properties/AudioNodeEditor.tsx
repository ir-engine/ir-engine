import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'

import VolumeUpIcon from '@mui/icons-material/VolumeUp'

import AudioSourceProperties from './AudioSourceProperties'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

/**
 * AudioNodeEditor used to customize audio element on the scene.
 *
 * @param       {Object} props
 * @constructor
 */
export const AudioNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const [_, setState] = useState(0)
  const engineState = useEngineState()
  const entity = props.node.entity

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.audio.name')}
      description={t('editor:properties.audio.description')}
    >
      <AudioSourceProperties node={props.node} multiEdit={props.multiEdit} />
    </NodeEditor>
  )
}

//setting icon component name
AudioNodeEditor.iconComponent = VolumeUpIcon

export default AudioNodeEditor
