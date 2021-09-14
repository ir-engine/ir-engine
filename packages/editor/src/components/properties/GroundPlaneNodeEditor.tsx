import React, { Component } from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ColorInput from '../inputs/ColorInput'
import BooleanInput from '../inputs/BooleanInput'
import { SquareFull } from '@styled-icons/fa-solid/SquareFull'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'

/**
 * Declaring GroundPlaneNodeEditor properties.
 *
 * @author Robert Long
 * @type {Object}
 */

type GroundPlaneNodeEditorProps = {
  editor?: object
  node?: any
  t: Function
}

/**
 * IconComponent is used to render GroundPlaneNode
 *
 * @author Robert Long
 * @type {class component}
 */
export class GroundPlaneNodeEditor extends Component<GroundPlaneNodeEditorProps, {}> {
  // setting icon component name
  static iconComponent = SquareFull

  // setting description will show on properties container
  static description = i18n.t('editor:properties.groundPlane.description')

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
    GroundPlaneNodeEditor.description = this.props.t('editor:properties.groundPlane.description')
    const node = this.props.node
    return (
      <NodeEditor {...this.props} description={GroundPlaneNodeEditor.description}>
        <InputGroup name="Color" label={this.props.t('editor:properties.groundPlane.lbl-color')}>
          <ColorInput value={node.color} onChange={this.onChangeColor} />
        </InputGroup>
        <InputGroup name="Receive Shadow" label={this.props.t('editor:properties.groundPlane.lbl-receiveShadow')}>
          <BooleanInput value={node.receiveShadow} onChange={this.onChangeReceiveShadow} />
        </InputGroup>
        <InputGroup name="Walkable" label={this.props.t('editor:properties.groundPlane.lbl-walkable')}>
          <BooleanInput value={(this.props.node as any).walkable} onChange={this.onChangeWalkable} />
        </InputGroup>
      </NodeEditor>
    )
  }
}

export default withTranslation()(GroundPlaneNodeEditor)
