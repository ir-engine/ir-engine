import React, { Component } from 'react'
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
export class BoxColliderNodeEditor extends Component<BoxColliderNodeEditorProps, { options: any }> {
  //initializing props and state
  constructor(props) {
    super(props)
    this.state = {
      options: []
    }
  }

  componentDidMount() {
    const options = []
    const sceneNode = SceneManager.instance.scene
    sceneNode.traverse((o) => {
      if (o.isNode && o !== sceneNode && o.nodeName === 'Game') {
        options.push({ label: o.name, value: o.uuid, nodeName: o.nodeName })
      }
    })
    this.setState({ options })
  }
  //defining iconComponent with component name
  static iconComponent = HandPaper

  //defining description and shows this description in NodeEditor  with title of elementt,
  // available to add in scene in assets.
  static description = i18n.t('editor:properties.boxCollider.description')

  // function to handle changes in payloadName property
  onChangeRole = (role) => {
    CommandManager.instance.setPropertyOnSelection('role', role)
  }

  //function to handle the changes in target
  onChangeTarget = (target) => {
    CommandManager.instance.setPropertyOnSelection('target', target)
  }
  // function to handle the changes on trigger property
  onChangeTrigger = (isTrigger) => {
    CommandManager.instance.setPropertyOnSelection('isTrigger', isTrigger)
  }

  //rendering view to cusomize box collider element
  render() {
    BoxColliderNodeEditor.description = this.props.t('editor:properties.boxCollider.description')
    return (
      <NodeEditor {...this.props} description={BoxColliderNodeEditor.description}>
        <InputGroup name="Trigger" label={this.props.t('editor:properties.boxCollider.lbl-isTrigger')}>
          <BooleanInput value={(this.props.node as any).isTrigger} onChange={this.onChangeTrigger} />
        </InputGroup>
      </NodeEditor>
    )
  }
}

export default withTranslation()(BoxColliderNodeEditor)
