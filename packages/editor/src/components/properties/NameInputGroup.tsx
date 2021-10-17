import React, { Component } from 'react'
import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import { withTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import styles from './styles.module.scss'

type Types = {
  node: any
  t: Function
}

type NameInputGroupState = {
  focusedNode: any
  name: string
}

/**
 * NameInputGroup is used to render input group PropertiesPanelContainer.
 *
 * @author Robert Long
 * @type {class component}
 */
export class NameInputGroup extends Component<Types, NameInputGroupState> {
  // updating state and properties
  constructor(props) {
    super(props)

    this.state = {
      name: this.getNameFromComponent(),
      focusedNode: null
    }

    this.t = this.props.t
  }

  t: Function

  //function to handle change in name property
  onUpdateName = (name) => {
    this.setState({ name }, this.setNameToComponent)
  }

  //function called when element get focused
  //Updating state of component
  onFocus = () => {
    this.setState({
      focusedNode: this.props.node,
      name: this.getNameFromComponent()
    })
  }

  // function to handle onBlur event on name property
  onBlurName = () => {
    // Check that the focused node is current node before setting the property.
    // This can happen when clicking on another node in the HierarchyPanel
    if (
      ((this.props as any).node as any).name !== (this.state as any).name &&
      (this.props as any).node === (this.state as any).focusedNode
    ) {
      CommandManager.instance.setPropertyOnSelection('name', (this.state as any).name)
    }

    this.setState({ focusedNode: null })
  }

  //function to handle keyUp event on name property
  onKeyUpName = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // CommandManager.instance.setPropertyOnSelection('name', (this.state as any).name)
    }
  }

  getNameFromComponent = () => {
    const nameComponent = getComponent(this.props.node.eid, NameComponent)
    return nameComponent.name
  }

  setNameToComponent = () => {
    const nameComponent = getComponent(this.props.node.eid, NameComponent)
    nameComponent.name = this.state.name
  }

  //rendering view NameInputGroup component
  render() {
    let name = this.state.name
    if (!this.state.focusedNode) {
      name = this.getNameFromComponent()
    }

    // const name = (this.state as any).focusedNode ? (this.state as any).name : ((this.props as any).node as any).name
    return (
      <InputGroup name="Name" label={this.t('editor:properties.name.lbl-name')} className={styles.nameInput}>
        <StringInput
          value={name}
          onChange={this.onUpdateName}
          onFocus={this.onFocus}
          onBlur={this.onBlurName}
          onKeyUp={this.onKeyUpName}
        />
      </InputGroup>
    )
  }
}

export default withTranslation()(NameInputGroup)
