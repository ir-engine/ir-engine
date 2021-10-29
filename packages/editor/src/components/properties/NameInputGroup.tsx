import React, { Component, useState } from 'react'
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
const NameInputGroup = (props: Types) => {
  const getNameFromComponent = () => {
    const nameComponent = getComponent(props.node.eid, NameComponent)
    return nameComponent.name
  }

  const setNameToComponent = (name) => {
    const nameComponent = getComponent(props.node.eid, NameComponent)
    nameComponent.name = name
  }

  let [name, setName] = useState(getNameFromComponent())
  let [focusedNode, setFocusedNode] = useState(null)

  //function to handle change in name property
  const onUpdateName = (name) => {
    setName(name)
    setNameToComponent(name)
  }

  //function called when element get focused
  //Updating state of component
  const onFocus = () => {
    setFocusedNode(props.node)
    setName(getNameFromComponent())
  }

  // function to handle onBlur event on name property
  const onBlurName = () => {
    // Check that the focused node is current node before setting the property.
    // This can happen when clicking on another node in the HierarchyPanel
    if (props?.node?.name !== name && props?.node === focusedNode) {
      CommandManager.instance.setPropertyOnSelection('name', name)
    }

    setFocusedNode(null)
  }

  //function to handle keyUp event on name property
  const onKeyUpName = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // CommandManager.instance.setPropertyOnSelection('name', (this.state as any).name)
    }
  }
  //rendering view NameInputGroup component
  let n = name

  if (!focusedNode) {
    n = getNameFromComponent()
  }

  return (
    <InputGroup name="Name" label={props.t('editor:properties.name.lbl-name')} className={styles.nameInput}>
      <StringInput value={n} onChange={onUpdateName} onFocus={onFocus} onBlur={onBlurName} onKeyUp={onKeyUpName} />
    </InputGroup>
  )
}

export default withTranslation()(NameInputGroup)
