import React, { useState, useEffect } from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import BooleanInput from '../inputs/BooleanInput'
import { useTranslation } from 'react-i18next'
import PanToolIcon from '@mui/icons-material/PanTool'
import { CommandManager } from '../../managers/CommandManager'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import SceneNode from '../../nodes/SceneNode'

type BoxColliderNodeEditorProps = {
  node?: any
  multiEdit: boolean
}

/**
 * BoxColliderNodeEditor is used to provide properties to customize box collider element.
 *
 * @author Robert Long
 * @type {[component class]}
 */
export const BoxColliderNodeEditor = (props: BoxColliderNodeEditorProps) => {
  let [options, setOptions] = useState([])
  const { t } = useTranslation()

  useEffect(() => {
    const options = []
    const sceneNode = Engine.scene as any as SceneNode
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

  return (
    <NodeEditor {...props} description={t('editor:properties.boxCollider.description')}>
      <InputGroup name="Trigger" label={t('editor:properties.boxCollider.lbl-isTrigger')}>
        <BooleanInput value={props.node?.isTrigger} onChange={onChangeTrigger} />
      </InputGroup>
    </NodeEditor>
  )
}

BoxColliderNodeEditor.iconComponent = PanToolIcon

export default BoxColliderNodeEditor
