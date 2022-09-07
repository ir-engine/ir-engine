import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { addComponent, hasComponent, removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ScreenshareTargetComponent } from '@xrengine/engine/src/scene/components/ScreenshareTargetComponent'

import ScreenShareIcon from '@mui/icons-material/ScreenShare'

import BooleanInput from '../inputs/BooleanInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

export const ScreenshareTargetNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.node.entity
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(hasComponent(entity, ScreenshareTargetComponent))
  }, [])

  const onChange = (enable) => {
    setEnabled(enable)
    if (enable) {
      addComponent(entity, ScreenshareTargetComponent, true)
    } else {
      removeComponent(entity, ScreenshareTargetComponent)
    }
  }

  return (
    <NodeEditor
      {...props}
      component={ScreenshareTargetComponent}
      name={t('editor:properties.screenshare.name')}
      description={t('editor:properties.screenshare.description')}
    >
      <BooleanInput value={enabled} onChange={onChange} />
    </NodeEditor>
  )
}

ScreenshareTargetNodeEditor.iconComponent = ScreenShareIcon

export default ScreenshareTargetNodeEditor
