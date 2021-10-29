import React, { useState, useEffect } from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import BooleanInput from '../inputs/BooleanInput'
import { HandPaper } from '@styled-icons/fa-solid/HandPaper'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import { SceneManager } from '../../managers/SceneManager'

type BoxColliderNodeEditorProps = {
  node?: any
  t: Function
  multiEdit: boolean
}

/**
 * BoxColliderNodeEditor is used to provide properties to customize box collider element.
 *
 * @author Robert Long
 * @type {[component class]}
 */
const BoxColliderNodeEditor = (props: BoxColliderNodeEditorProps) => {
  let [options, setOptions] = useState([])

  useEffect(() => {
    const options = []
    const sceneNode = SceneManager.instance.scene
    sceneNode.traverse((o) => {
      if (o.isNode && o !== sceneNode && o.nodeName === 'Game') {
        options.push({ label: o.name, value: o.uuid, nodeName: o.nodeName })
      }
    })
    setOptions(options)
  }, [])

  // function to handle changes in payloadName property
  const onChangeRole = (role) => {
    CommandManager.instance.setPropertyOnSelection('role', role)
  }

  //function to handle the changes in target
  const onChangeTarget = (target) => {
    CommandManager.instance.setPropertyOnSelection('target', target)
  }
  // function to handle the changes on trigger property
  const onChangeTrigger = (isTrigger) => {
    CommandManager.instance.setPropertyOnSelection('isTrigger', isTrigger)
  }

  //rendering view to cusomize box collider element
  BoxColliderNodeEditor.description = props.t('editor:properties.boxCollider.description')

  return (
    <NodeEditor {...props} description={BoxColliderNodeEditor.description}>
      <InputGroup name="Trigger" label={props.t('editor:properties.boxCollider.lbl-isTrigger')}>
        <BooleanInput value={props.node?.isTrigger} onChange={onChangeTrigger} />
      </InputGroup>
    </NodeEditor>
  )
}

BoxColliderNodeEditor.iconComponent = HandPaper
BoxColliderNodeEditor.description = i18n.t('editor:properties.boxCollider.description')

export default withTranslation()(BoxColliderNodeEditor)
