import { useComponent } from '@etherealengine/ecs'
import NodeEditor from '@etherealengine/editor/src/components/properties/NodeEditor'
import { EditorComponentType } from '@etherealengine/editor/src/components/properties/Util'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { GrabbableComponent } from '../GrabbableComponent'

export const GrabbableComponentNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const grabbableComponent = useComponent(props.entity, GrabbableComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.grabbable.name')}
      description={t('editor:properties.grabbable.description')}
    >
      <div id={'grabbable-component'}></div>
    </NodeEditor>
  )
}
