import React, { Component } from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ColorInput from '../inputs/ColorInput'
import BooleanInput from '../inputs/BooleanInput'
import { SquareFull } from '@styled-icons/fa-solid/SquareFull'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'

/**
 * Declairing GroundPlaneNodeEditor properties.
 *
 * @author Robert Long
 * @type {Object}
 */

type GroundPlaneNodeEditorProps = {
  editor?: object
  node?: object
  t: Function
}

/**
 * IconComponent is used to render GroundPlaneNode and provide inputs to customize floorPlanNode.
 *
 * @author Robert Long
 * @type {class component}
 */
export class GroundPlaneNodeEditor extends Component<GroundPlaneNodeEditorProps, {}> {
  // setting icon component name
  static iconComponent = SquareFull

  // setting description will show on properties container
  static description = i18n.t('editor:properties.groundPlan.description')

  //function handles the changes in color property
  onChangeColor = (color) => {
    ;(this.props.editor as any).setPropertySelected('color', color)
  }

  //function handles the changes for receiveShadow property
  onChangeReceiveShadow = (receiveShadow) => {
    ;(this.props.editor as any).setPropertySelected('receiveShadow', receiveShadow)
  }

  // function handles the changes in walkable property
  onChangeWalkable = (walkable) => {
    ;(this.props.editor as any).setPropertySelected('walkable', walkable)
  }

  //rendering GroundPlaneNode node customization view
  render() {
    GroundPlaneNodeEditor.description = this.props.t('editor:properties.groundPlan.description')
    const node = this.props.node
    return (
      <NodeEditor
        {...this.props}
        /* @ts-ignore */
        description={GroundPlaneNodeEditor.description}
      >
        {/* @ts-ignore */}
        <InputGroup name="Color" label={this.props.t('editor:properties.groundPlan.lbl-color')}>
          {/* @ts-ignore */}
          <ColorInput value={node.color} onChange={this.onChangeColor} />
        </InputGroup>
        {/* @ts-ignore */}
        <InputGroup name="Receive Shadow" label={this.props.t('editor:properties.groundPlan.lbl-receiveShadow')}>
          <BooleanInput
            /* @ts-ignore */
            value={node.receiveShadow}
            onChange={this.onChangeReceiveShadow}
          />
        </InputGroup>
        {/* @ts-ignore */}
        <InputGroup name="Walkable" label={this.props.t('editor:properties.groundPlan.lbl-walkable')}>
          <BooleanInput value={(this.props.node as any).walkable} onChange={this.onChangeWalkable} />
        </InputGroup>
      </NodeEditor>
    )
  }
}

export default withTranslation()(GroundPlaneNodeEditor)
