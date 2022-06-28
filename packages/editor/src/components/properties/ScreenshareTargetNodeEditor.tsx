import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent, hasComponent, removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'
import { ScreenshareTargetComponent } from '@xrengine/engine/src/scene/components/ScreenshareTargetComponent'
import {
  deserializeScreenshareTarget,
  SCENE_COMPONENT_SCREENSHARETARGET,
  SCENE_COMPONENT_SCREENSHARETARGET_DEFAULT_VALUES
} from '@xrengine/engine/src/scene/functions/loaders/ScreenshareTargetFunctions'

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
      deserializeScreenshareTarget(entity, { name: '', props: SCENE_COMPONENT_SCREENSHARETARGET_DEFAULT_VALUES })
    } else {
      const editorComponent = getComponent(entity, EntityNodeComponent).components
      editorComponent.splice(editorComponent.indexOf(SCENE_COMPONENT_SCREENSHARETARGET), 1)
      removeComponent(entity, ScreenshareTargetComponent)
    }
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.screenshare.name')}
      description={t('editor:properties.screenshare.description')}
    >
      <BooleanInput value={enabled} onChange={onChange} />
    </NodeEditor>
  )
}

ScreenshareTargetNodeEditor.iconComponent = ScreenShareIcon

export default ScreenshareTargetNodeEditor
