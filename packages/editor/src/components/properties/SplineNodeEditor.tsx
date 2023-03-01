import React from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { GroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'

import TimelineIcon from '@mui/icons-material/Timeline'

import { PropertiesPanelButton } from '../inputs/Button'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

/**
 * SplineNodeEditor used to create and customize splines in the scene.
 *
 * @param       {Object} props
 * @constructor
 */

export const SplineNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const onAddNode = () => {
    const obj3d = getComponent(props.entity, GroupComponent)[0]
    const newSplineObject = obj3d.userData.helper.addPoint()
    obj3d.add(newSplineObject)
  }

  return (
    <NodeEditor description={t('editor:properties.spline.description')} {...props}>
      <PropertiesPanelButton onClick={onAddNode}>{t('editor:properties.spline.lbl-addNode')}</PropertiesPanelButton>
    </NodeEditor>
  )
}

SplineNodeEditor.iconComponent = TimelineIcon

export default SplineNodeEditor
