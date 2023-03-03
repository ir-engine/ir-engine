import React from 'react'
import { useTranslation } from 'react-i18next'

import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'

import WaterIcon from '@mui/icons-material/Water'

import NodeEditor from './NodeEditor'

//declaring properties for WaterNodeEditor
type WaterNodeEditorProps = {
  entity: Entity
}

/**
 * WaterNodeEditor provides the editor to customize properties.
 *
 * @type {class component}
 */
export const WaterNodeEditor = (props: WaterNodeEditorProps) => {
  const { t } = useTranslation()

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.water.name')}
      description={t('editor:properties.water.description')}
    ></NodeEditor>
  )
}

WaterNodeEditor.iconComponent = WaterIcon

export default WaterNodeEditor
