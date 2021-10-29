import React from 'react'
import NodeEditor from './NodeEditor'
import TimelineIcon from '@mui/icons-material/Timeline'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { PropertiesPanelButton } from '../inputs/Button'

/**
 * Define properties for SplineNodeEditor component.
 *
 * @author Hamza Mushtaq
 * @type {Object}
 */
type SplineNodeEditorProps = {
  node?: object
  t: Function
}

/**
 * SplineNodeEditor used to create and customize splines in the scene.
 *
 * @author Hamza Mushtaq
 * @param       {Object} props
 * @constructor
 */

const SplineNodeEditor = (props: SplineNodeEditorProps) => {
  const onAddNode = () => {
    props.node?.onAddNodeToSpline()
  }

  return (
    <NodeEditor description={SplineNodeEditor.description} {...props}>
      <PropertiesPanelButton onClick={onAddNode}>
        {props.t('editor:properties.spline.lbl-addNode')}
      </PropertiesPanelButton>
    </NodeEditor>
  )
}

SplineNodeEditor.iconComponent = TimelineIcon
SplineNodeEditor.description = i18n.t('editor:properties.spline.description')

export default withTranslation()(SplineNodeEditor)
