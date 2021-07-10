import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NodeEditor from './NodeEditor'
import TimelineIcon from '@material-ui/icons/Timeline'
import i18n from 'i18next'
import { useTranslation, withTranslation } from 'react-i18next'
import { PropertiesPanelButton } from '../inputs/Button'

/**
 * PropTypes Defining properties for SplineNodeEditor component.
 *
 * @author Hamza Mushtaq
 * @type {Object}
 */
type SplineNodeEditorProps = {
  editor?: object
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
        {/* @ts-ignore */}
        <PropertiesPanelButton onClick={this.onAddNode}>
          {this.props.t('editor:properties.spline.lbl-addNode')}
        </PropertiesPanelButton>
      </NodeEditor>
    )
  }
}

export default withTranslation()(SplineNodeEditor)
