import React, { Component } from 'react'
import NodeEditor from './NodeEditor'
import TimelineIcon from '@mui/icons-material/Timeline'
import i18n from 'i18next'
import { useTranslation, withTranslation } from 'react-i18next'
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

export class SplineNodeEditor extends Component<SplineNodeEditorProps, {}> {
  //setting icon component name
  static iconComponent = TimelineIcon
  static description = i18n.t('editor:properties.spline.description')
  onAddNode = () => {
    ;(this.props.node as any).onAddNodeToSpline()
  }

  render() {
    SplineNodeEditor.description = this.props.t('editor:properties.spline.description')
    //returning view to customize properties
    return (
      <NodeEditor description={SplineNodeEditor.description} {...this.props}>
        <PropertiesPanelButton onClick={this.onAddNode}>
          {this.props.t('editor:properties.spline.lbl-addNode')}
        </PropertiesPanelButton>
      </NodeEditor>
    )
  }
}

export default withTranslation()(SplineNodeEditor)
