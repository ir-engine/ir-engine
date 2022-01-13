import React from 'react'
import NodeEditor from './NodeEditor'
import TimelineIcon from '@mui/icons-material/Timeline'
import { useTranslation } from 'react-i18next'
import { PropertiesPanelButton } from '../inputs/Button'
import { EditorComponentType } from './Util'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'

/**
 * SplineNodeEditor used to create and customize splines in the scene.
 *
 * @author Hamza Mushtaq
 * @param       {Object} props
 * @constructor
 */

export const SplineNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const onAddNode = () => {
    const obj3d = getComponent(props.node.entity, Object3DComponent).value
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
