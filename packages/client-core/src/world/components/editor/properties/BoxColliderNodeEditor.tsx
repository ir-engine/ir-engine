import React, { Component } from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import BooleanInput from '../inputs/BooleanInput'
import SelectInput from '../inputs/SelectInput'
import { HandPaper } from '@styled-icons/fa-solid/HandPaper'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import StringInput from '../inputs/StringInput'

type BoxColliderNodeEditorProps = {
  editor?: any
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
    const sceneNode = (this.props.editor as any).scene
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
    ;(this.props.editor as any).setPropertySelected('role', role)
  }

  //function to handle the changes in target
  onChangeTarget = (target) => {
    ;(this.props.editor as any).setPropertySelected('target', target)
  }
  // function to handle the changes on trigger property
  onChangeTrigger = (isTrigger) => {
    ;(this.props.editor as any).setPropertySelected('isTrigger', isTrigger)
  }

  renderInteractableTypeOptions = (node) => {
    //@ts-ignore
    const targetOption = this.state.options.find((o) => o.value === node.target)
    const target = targetOption ? targetOption.value : null
    const targetNotFound = node.target && target === null

    /*
    let selectValues = []
    if (node.target) {
      // Get current game mode -- check target game mode
      console.log('Target is', node.target)

      console.log('Editor nodes are', (this.props.editor as any).nodes)

      const nodeTarget = (this.props.editor as any).nodes.find((node) => node.uuid === target)

      if (nodeTarget) {
        console.log('nodeTarget', nodeTarget)

        const gameMode = Engine.gameModes.get(nodeTarget.gameMode)

        const gameObjectRoles = Object.keys(gameMode.gameObjectRoles)

        console.log('gameObjectRoles are', gameObjectRoles)

        selectValues = gameObjectRoles.map((role, index) => {
          return { label: role, value: index }
        })

        console.log('SelectValues are', selectValues)
      }
    }*/

    return (
      <>
        {/* @ts-ignore */}
        <InputGroup name="Game Target" label={this.props.t('editor:properties.model.lbl-target')}>
          {/* @ts-ignore */}
          <SelectInput
            error={targetNotFound}
            placeholder={
              targetNotFound
                ? this.props.t('editor:properties.model.ph-errorNode')
                : this.props.t('editor:properties.triggereVolume.ph-selectNode')
            }
            value={node.target}
            onChange={this.onChangeTarget}
            options={this.state.options}
            disabled={this.props.multiEdit}
          />
        </InputGroup>
        {node.target && (
          /* @ts-ignore */
          <InputGroup name="Role" label={i18n.t('editor:properties.model.lbl-role')}>
            {/* @ts-ignore */}
            <StringInput
              /* @ts-ignore */
              value={node.role}
              onChange={this.onChangeRole}
            />
          </InputGroup>
        )}
      </>
    )
  }

  //rendering view to cusomize box collider element
  render() {
    BoxColliderNodeEditor.description = this.props.t('editor:properties.boxCollider.description')
    const node = this.props.node as any
    return (
      <NodeEditor
        {...this.props}
        /* @ts-ignore */
        description={BoxColliderNodeEditor.description}
      >
        {/* @ts-ignore */}
        <InputGroup name="Trigger" label={this.props.t('editor:properties.boxCollider.lbl-isTrigger')}>
          <BooleanInput value={(this.props.node as any).isTrigger} onChange={this.onChangeTrigger} />
        </InputGroup>
        {this.renderInteractableTypeOptions(node)}
      </NodeEditor>
    )
  }
}

export default withTranslation()(BoxColliderNodeEditor)
