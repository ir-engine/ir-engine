import { Cube } from '@styled-icons/fa-solid/Cube'
import ModelNode from '../../nodes/ModelNode'
import i18n from 'i18next'
import React, { Component, Fragment } from 'react'
import { withTranslation } from 'react-i18next'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import ModelInput from '../inputs/ModelInput'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import dompurify from 'dompurify'
import { Object3D } from 'three'
import NumericInputGroup from '../inputs/NumericInputGroup'
import { CommandManager } from '../../managers/CommandManager'
import EditorCommands from '../../constants/EditorCommands'
import { SceneManager } from '../../managers/SceneManager'

import ArrayInputGroup from '../inputs/ArrayInputGroup'

/**
 * Array containing options for InteractableOption.
 *
 * @author Robert Long
 * @type {Array}
 */
const InteractableOption = [
  {
    label: 'InfoBox',
    value: 'infoBox'
  },
  {
    label: 'Open link',
    value: 'link'
  },
  {
    label: 'Equippable',
    value: 'equippable'
  }
]

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

  // function to handle changes in interactionType property
  onChangeInteractionType = (interactionType) => {
    CommandManager.instance.setPropertyOnSelection('interactionType', interactionType)
  }

  // function to handle changes in interactionText property
  onChangeInteractionText = (interactionText) => {
    CommandManager.instance.setPropertyOnSelection('interactionText', interactionText)
  }

  // function to handle changes in interactionText property
  onChangeInteractionDistance = (interactionDistance) => {
    CommandManager.instance.setPropertyOnSelection('interactionDistance', interactionDistance)
  }

  // function to handle changes in payloadName property
  onChangePayloadName = (payloadName) => {
    CommandManager.instance.setPropertyOnSelection('payloadName', payloadName)
  }

  // function to handle changes in payloadName property
  onChangeRole = (role, selected) => {
    CommandManager.instance.setPropertyOnSelection('role', selected.label)
  }

  //function to handle the changes in target
  onChangeTarget = (target) => {
    CommandManager.instance.setPropertyOnSelection('target', target)
  }

  // function to handle changes in payloadUrl
  onChangePayloadUrl = (payloadUrl) => {
    CommandManager.instance.setPropertyOnSelection('payloadUrl', payloadUrl)
  }

  // function to handle changes in payloadBuyUrl
  onChangePayloadBuyUrl = (payloadBuyUrl) => {
    CommandManager.instance.setPropertyOnSelection('payloadBuyUrl', payloadBuyUrl)
  }

  // function to handle changes in payloadLearnMoreUrl
  onChangePayloadLearnMoreUrl = (payloadLearnMoreUrl) => {
    CommandManager.instance.setPropertyOnSelection('payloadLearnMoreUrl', payloadLearnMoreUrl)
  }

  // function to handle changes in payloadHtmlContent
  onChangePayloadHtmlContent = (payloadHtmlContent) => {
    const sanitizedHTML = dompurify.sanitize(payloadHtmlContent)
    if (sanitizedHTML !== payloadHtmlContent)
      console.warn("Code has been sanitized, don't try anything sneaky please...")
    CommandManager.instance.setPropertyOnSelection('payloadHtmlContent', sanitizedHTML)
  }

  // function to handle changes in isAnimationPropertyDisabled
  isAnimationPropertyDisabled() {
    const { multiEdit, node } = this.props as any
    if (multiEdit) {
      return CommandManager.instance.selected.some((selectedNode) => selectedNode.src !== node.src)
    }
    return false
  }

  // creating view for interactable type
  renderInteractableTypeOptions = (node) => {
    const values = ['1', '2', '3']
    switch (node.interactionType) {
      case 'infoBox':
        return (
          <>
            <ArrayInputGroup
              name="Name"
              values={values}
              onChange={(array) => {}}
              label={this.props.t('editor:properties.model.lbl-name')}
            ></ArrayInputGroup>
            <InputGroup name="Name" label={this.props.t('editor:properties.model.lbl-name')}>
              <StringInput value={node.payloadName} onChange={this.onChangePayloadName} />
            </InputGroup>
            <InputGroup name="Url" label={this.props.t('editor:properties.model.lbl-url')}>
              <StringInput value={node.payloadUrl} onChange={this.onChangePayloadUrl} />
            </InputGroup>
            <InputGroup name="BuyUrl" label={this.props.t('editor:properties.model.lbl-buy')}>
              <StringInput value={node.payloadBuyUrl} onChange={this.onChangePayloadBuyUrl} />
            </InputGroup>
            <InputGroup name="LearnMoreUrl" label={this.props.t('editor:properties.model.lbl-learnMore')}>
              <StringInput value={node.payloadLearnMoreUrl} onChange={this.onChangePayloadLearnMoreUrl} />
            </InputGroup>
            <InputGroup name="HtmlContent" label={this.props.t('editor:properties.model.lbl-htmlContent')}>
              <StringInput value={node.payloadHtmlContent} onChange={this.onChangePayloadHtmlContent} />
            </InputGroup>
          </>
        )
      default:
        break
    }
  }

  // creating view for dependent fields
  renderInteractableDependantFields = (node) => {
    switch (node.interactable) {
      case true:
        return (
          <Fragment>
            <InputGroup name="Interaction Text" label={this.props.t('editor:properties.model.lbl-interactionText')}>
              <StringInput value={node.interactionText} onChange={this.onChangeInteractionText} />
            </InputGroup>
            <InputGroup name="Interaction Type" label={this.props.t('editor:properties.model.lbl-interactionType')}>
              <SelectInput
                options={InteractableOption}
                value={node.interactionType}
                onChange={this.onChangeInteractionType}
              />
            </InputGroup>
            <NumericInputGroup
              name="Interaction Distance"
              label={this.props.t('editor:properties.model.lbl-interactionDistance')}
              onChange={this.onChangeInteractionDistance}
              min={0}
              smallStep={0.001}
              mediumStep={0.01}
              largeStep={0.1}
              value={(node as any).intensity}
            />
            {this.renderInteractableTypeOptions(node)}
          </Fragment>
        )
      default:
        break
    }
  }

  // rendering view of ModelNodeEditor
  render() {
    ModelNodeEditor.description = this.props.t('editor:properties.model.description')
    const node = this.props.node as any
    return (
      <NodeEditor description={ModelNodeEditor.description} {...this.props}>
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
        {this.renderInteractableDependantFields(node)}
      </NodeEditor>
    )
  }
}

export default withTranslation()(ModelNodeEditor)
