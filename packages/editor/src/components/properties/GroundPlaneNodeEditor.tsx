import React, { Component } from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ColorInput from '../inputs/ColorInput'
import BooleanInput from '../inputs/BooleanInput'
import { SquareFull } from '@styled-icons/fa-solid/SquareFull'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { GroundPlaneComponent } from '@xrengine/engine/src/scene/components/GroundPlaneComponent'

/**
 * Declaring GroundPlaneNodeEditor properties.
 *
 * @author Robert Long
 * @type {Object}
 */

type GroundPlaneNodeEditorProps = {
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
    // CommandManager.instance.setPropertyOnSelection('color', color)
    const groundPlaneComponent = getComponent(this.props.node.eid, GroundPlaneComponent)
    groundPlaneComponent.color = color
    this.forceUpdate()
  }

  //function handles the changes for receiveShadow property
  onChangeReceiveShadow = (receiveShadow) => {
    // CommandManager.instance.setPropertyOnSelection('receiveShadow', receiveShadow)
    const groundPlaneComponent = getComponent(this.props.node.eid, GroundPlaneComponent)
    groundPlaneComponent.receiveShadow = receiveShadow
    this.forceUpdate()
  }

  // function handles the changes in walkable property
  onChangeWalkable = (walkable) => {
    // CommandManager.instance.setPropertyOnSelection('walkable', walkable)
    const groundPlaneComponent = getComponent(this.props.node.eid, GroundPlaneComponent)
    groundPlaneComponent.walkable = walkable
    this.forceUpdate()
  }

  //rendering GroundPlaneNode node customization view
  render() {
    GroundPlaneNodeEditor.description = this.props.t('editor:properties.groundPlane.description')
    const groundPlaneComponent = getComponent(this.props.node.eid, GroundPlaneComponent)
    return (
      <NodeEditor {...this.props} description={GroundPlaneNodeEditor.description}>
        <InputGroup name="Color" label={this.props.t('editor:properties.groundPlane.lbl-color')}>
          <ColorInput value={groundPlaneComponent.color} onChange={this.onChangeColor} />
        </InputGroup>
        <InputGroup name="Receive Shadow" label={this.props.t('editor:properties.groundPlane.lbl-receiveShadow')}>
          <BooleanInput value={groundPlaneComponent.receiveShadow} onChange={this.onChangeReceiveShadow} />
        </InputGroup>
        <InputGroup name="Walkable" label={this.props.t('editor:properties.groundPlane.lbl-walkable')}>
          <BooleanInput value={groundPlaneComponent.walkable} onChange={this.onChangeWalkable} />
        </InputGroup>
      </NodeEditor>
    )
  }
}

export default withTranslation()(GroundPlaneNodeEditor)
