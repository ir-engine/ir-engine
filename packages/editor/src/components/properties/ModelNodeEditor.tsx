import { Cube } from '@styled-icons/fa-solid/Cube'
import ModelNode from '../../nodes/ModelNode'
import i18n from 'i18next'
import React, { Component, Fragment } from 'react'
import { withTranslation } from 'react-i18next'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import ModelInput from '../inputs/ModelInput'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { Object3D } from 'three'
import InteractableGroup from '../inputs/InteractableGroup'
import { CommandManager } from '../../managers/CommandManager'
import EditorCommands from '../../constants/EditorCommands'
import { SceneManager } from '../../managers/SceneManager'

/**
 * Declaring properties for ModalNodeEditor component.
 *
 * @author Robert Long
 * @type {Object}
 */
type ModelNodeEditorProps = {
  node?: object
  multiEdit?: boolean
  t: Function
}

//Declaring TriggerVolumeNodeEditor state
type ModelNodeEditorState = {
  options: any[]
}

/**
 * ModelNodeEditor used to create editor view for the properties of ModelNode.
 *
 * @author Robert Long
 * @type {class component}
 */
export class ModelNodeEditor extends Component<ModelNodeEditorProps, ModelNodeEditorState> {
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

  //initializing description and will appears on the editor view
  static description = i18n.t('editor:properties.model.description')

  //initializing iconComponent with image name
  static iconComponent = Cube

  onChangeGPUInstancingFlag = (isUsingGPUInstancing) => {
    CommandManager.instance.setPropertyOnSelection('isUsingGPUInstancing', isUsingGPUInstancing)
  }

  //function to handle change in property src
  onChangeSrc = (src, initialProps) => {
    CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.MODIFY_PROPERTY, {
      properties: { ...initialProps, src }
    })
  }

  // TODO
  // function to handle change in property src
  // onChangeEnvMap = (src, initialProps) => {
  //   CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.MODIFY_PROPERTY, { properties: { ...initialProps, src } })
  // };

  //fucntion to handle changes in activeChipIndex property
  onChangeAnimation = (activeClipIndex) => {
    CommandManager.instance.setPropertyOnSelection('activeClipIndex', activeClipIndex)
  }

  onChangeAnimationSource = (hasAvatarAnimations) => {
    CommandManager.instance.setPropertyOnSelection('hasAvatarAnimations', hasAvatarAnimations)
    ;(this.props.node as any).reload()
  }

  //function to handle change in collidable property
  // not currently in use, used by floor plan
  // onChangeCollidable = collidable => {
  //   CommandManager.instance.setPropertyOnSelection("collidable", collidable);
  // };

  onChangeTextureOverride = (textureOverride) => {
    console.log(textureOverride)
    CommandManager.instance.setPropertyOnSelection('textureOverride', textureOverride)
  }

  // function to handle changes in walkable property
  // not currently in use, used by floor plan
  // onChangeWalkable = walkable => {
  //   CommandManager.instance.setPropertyOnSelection("walkable", walkable);
  // };

  // function to handle changes in castShadow property
  onChangeCastShadow = (castShadow) => {
    CommandManager.instance.setPropertyOnSelection('castShadow', castShadow)
  }

  // function to handle changes in Receive shadow property
  onChangeReceiveShadow = (receiveShadow) => {
    CommandManager.instance.setPropertyOnSelection('receiveShadow', receiveShadow)
  }

  // function to handle changes in interactable property
  onChangeInteractable = (interactable) => {
    CommandManager.instance.setPropertyOnSelection('interactable', interactable)
  }

  // function to handle change in matrixAutoUpdate property
  onChangeUpdateDataMatrix = (matrixAutoUpdate) => {
    CommandManager.instance.setPropertyOnSelection('matrixAutoUpdate', matrixAutoUpdate)
  }

  // function to handle changes in payloadName property
  onChangeRole = (role, selected) => {
    CommandManager.instance.setPropertyOnSelection('role', selected.label)
  }

  //function to handle the changes in target
  onChangeTarget = (target) => {
    CommandManager.instance.setPropertyOnSelection('target', target)
  }

  // function to handle changes in isAnimationPropertyDisabled
  isAnimationPropertyDisabled() {
    const { multiEdit, node } = this.props as any
    if (multiEdit) {
      return CommandManager.instance.selected.some((selectedNode) => selectedNode.src !== node.src)
    }
    return false
  }

  // rendering view of ModelNodeEditor
  render() {
    ModelNodeEditor.description = this.props.t('editor:properties.model.description')
    const node = this.props.node as any
    return (
      <NodeEditor description={ModelNodeEditor.description} {...this.props}>
        <InputGroup
          name="Using GPU instancing Flag"
          label={this.props.t('editor:properties.model.lbl-usingGPUInstancingFlag')}
        >
          <BooleanInput value={node.isUsingGPUInstancing} onChange={this.onChangeGPUInstancingFlag} />
        </InputGroup>
        <InputGroup name="Model Url" label={this.props.t('editor:properties.model.lbl-modelurl')}>
          <ModelInput value={node.src} onChange={this.onChangeSrc} />
          {!(this.props.node as ModelNode).isValidURL && <div>{this.props.t('editor:properties.model.error-url')}</div>}
        </InputGroup>

        {/* TODO: implement environment map overrides. - source from scene env map, a custom BPCEM bake, URL string
         <InputGroup name="Environment Map" label={this.props.t('editor:properties.model.lbl-modelurl')}>
          <ModelInput value={node.src} onChange={this.onChangeSrc} />
          {!(this.props.node as ModelNode).isValidURL && <div>{this.props.t('editor:properties.model.error-url')}</div>}
        </InputGroup> */}
        <InputGroup name="Loop Animation" label={this.props.t('editor:properties.model.lbl-loopAnimation')}>
          <SelectInput
            disabled={this.isAnimationPropertyDisabled()}
            options={node.getClipOptions()}
            value={node.activeClipIndex}
            onChange={this.onChangeAnimation}
          />
        </InputGroup>
        <InputGroup name="Is Avatar" label={this.props.t('editor:properties.model.lbl-isAvatar')}>
          <BooleanInput value={node.hasAvatarAnimations} onChange={this.onChangeAnimationSource} />
        </InputGroup>
        {/* <InputGroup name="Collidable" label={this.props.t('editor:properties.model.lbl-collidable')}>
          // === not currently in use, used by floor plan === //
          <BooleanInput
            value={node.collidable}
            onChange={this.onChangeCollidable}
          />
        </InputGroup> */}
        <InputGroup name="Texture Override" label={this.props.t('editor:properties.model.lbl-textureOverride')}>
          <SelectInput
            options={SceneManager.instance.scene.children.map((obj: Object3D) => {
              return {
                label: obj.name,
                value: obj.uuid
              }
            })}
            value={node.textureOverride}
            onChange={this.onChangeTextureOverride}
          />
        </InputGroup>
        {/* <InputGroup name="Walkable" label={this.props.t('editor:properties.model.lbl-walkable')}>
            // === not currently in use, used by floor plan === //
            <BooleanInput
            value={node.walkable}
            onChange={this.onChangeWalkable}
          />
        </InputGroup> */}
        <InputGroup name="Cast Shadow" label={this.props.t('editor:properties.model.lbl-castShadow')}>
          <BooleanInput value={node.castShadow} onChange={this.onChangeCastShadow} />
        </InputGroup>
        <InputGroup name="Receive Shadow" label={this.props.t('editor:properties.model.lbl-receiveShadow')}>
          <BooleanInput value={node.receiveShadow} onChange={this.onChangeReceiveShadow} />
        </InputGroup>
        <InputGroup name="Interactable" label={this.props.t('editor:properties.model.lbl-interactable')}>
          <BooleanInput value={node.interactable} onChange={this.onChangeInteractable} />
        </InputGroup>
        <InputGroup name="MatrixAutoUpdate" label={this.props.t('editor:properties.model.lbl-matrixAutoUpdate')}>
          <BooleanInput value={node.matrixAutoUpdate} onChange={this.onChangeUpdateDataMatrix} />
        </InputGroup>
        {node.interactable && <InteractableGroup node={node}></InteractableGroup>}
      </NodeEditor>
    )
  }
}

export default withTranslation()(ModelNodeEditor)
