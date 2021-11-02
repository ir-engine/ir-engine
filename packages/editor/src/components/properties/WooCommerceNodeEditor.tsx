import { ShoppingCart } from '@styled-icons/fa-solid/ShoppingCart'
import i18n from 'i18next'
import React, { Component, Fragment } from 'react'
import { withTranslation } from 'react-i18next'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import VideoInput from '../inputs/VideoInput'
import ImageInput from '../inputs/ImageInput'
import NodeEditor from './NodeEditor'
import dompurify from 'dompurify'
import { Object3D } from 'three'
import NumericInputGroup from '../inputs/NumericInputGroup'
import { CommandManager } from '../../managers/CommandManager'
import EditorCommands from '../../constants/EditorCommands'
import { SceneManager } from '../../managers/SceneManager'

import AudioSourceProperties from './AudioSourceProperties'
import useSetPropertySelected from './useSetPropertySelected'
import { ControlledStringInput } from '../inputs/StringInput'
import { VideoProjection } from '@xrengine/engine/src/scene/classes/Video'
import { ImageProjection, ImageAlphaMode } from '@xrengine/engine/src/scene/classes/Image'

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
type WooCommerceNodeEditorProps = {
  node?: object
  multiEdit?: boolean
  t: Function
}

//Declaring TriggerVolumeNodeEditor state
type WooCommerceNodeEditorState = {
  options: any[]
}

/**
 * WooCommerceNodeEditor used to create editor view for the properties of WoocommerceNode.
 *
 * @author Robert Long
 * @type {class component}
 */
export class WooCommerceNodeEditor extends Component<WooCommerceNodeEditorProps, WooCommerceNodeEditorState> {
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
  static description = i18n.t('editor:properties.woocommerce.description')
  //initializing iconComponent with image name
  static iconComponent = ShoppingCart

  //WooCommerceDomain UI Controls
  onChangeDomain = (domain) => {
    CommandManager.instance.setPropertyOnSelection('wooCommerceDomain', domain)
  }

  onChangeConsumerKey = (token) => {
    CommandManager.instance.setPropertyOnSelection('wooCommerceConsumerKey', token)
  }

  onChangeConsumerSecret = (token) => {
    CommandManager.instance.setPropertyOnSelection('wooCommerceConsumerSecret', token)
  }

  onChangeProducts = (id) => {
    CommandManager.instance.setPropertyOnSelection('wooCommerceProductId', id)
  }

  onChangeProductItems = (id) => {
    CommandManager.instance.setPropertyOnSelection('wooCommerceProductItemId', id)
  }

  //Interactive UI Controls
  // function to handle changes in interactable property
  onChangeInteractable = (interactable) => {
    CommandManager.instance.setPropertyOnSelection('interactable', interactable)
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

  // creating view for interactable type
  renderInteractableTypeOptions = (node) => {
    switch (node.interactionType) {
      case 'infoBox':
        return (
          <>
            <InputGroup name="Name" label={this.props.t('editor:properties.woocommerce.lbl-name')}>
              <StringInput value={node.payloadName} onChange={this.onChangePayloadName} />
            </InputGroup>
            <InputGroup name="Url" label={this.props.t('editor:properties.woocommerce.lbl-url')}>
              <StringInput value={node.payloadUrl} onChange={this.onChangePayloadUrl} />
            </InputGroup>
            <InputGroup name="BuyUrl" label={this.props.t('editor:properties.woocommerce.lbl-buy')}>
              <StringInput value={node.payloadBuyUrl} onChange={this.onChangePayloadBuyUrl} />
            </InputGroup>
            <InputGroup name="LearnMoreUrl" label={this.props.t('editor:properties.woocommerce.lbl-learnMore')}>
              <StringInput value={node.payloadLearnMoreUrl} onChange={this.onChangePayloadLearnMoreUrl} />
            </InputGroup>
            <InputGroup name="HtmlContent" label={this.props.t('editor:properties.woocommerce.lbl-htmlContent')}>
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
            <InputGroup
              name="Interaction Text"
              label={this.props.t('editor:properties.woocommerce.lbl-interactionText')}
            >
              <StringInput value={node.interactionText} onChange={this.onChangeInteractionText} />
            </InputGroup>
            <InputGroup
              name="Interaction Type"
              label={this.props.t('editor:properties.woocommerce.lbl-interactionType')}
            >
              <SelectInput
                options={InteractableOption}
                value={node.interactionType}
                onChange={this.onChangeInteractionType}
              />
            </InputGroup>
            <NumericInputGroup
              name="Interaction Distance"
              label={this.props.t('editor:properties.woocommerce.lbl-interactionDistance')}
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

  //Model UI Controls
  isAnimationPropertyDisabled() {
    const { multiEdit, node } = this.props as any
    if (multiEdit) {
      return CommandManager.instance.selected.some((selectedNode) => selectedNode.src !== node.src)
    }
    return false
  }

  onChangeAnimation = (activeClipIndex) => {
    CommandManager.instance.setPropertyOnSelection('activeClipIndex', activeClipIndex)
  }

  onChangeAnimationSource = (hasAvatarAnimations) => {
    CommandManager.instance.setPropertyOnSelection('hasAvatarAnimations', hasAvatarAnimations)
    ;(this.props.node as any).reload()
  }
  onChangeTextureOverride = (textureOverride) => {
    CommandManager.instance.setPropertyOnSelection('textureOverride', textureOverride)
  }

  // function to handle changes in castShadow property
  onChangeCastShadow = (castShadow) => {
    CommandManager.instance.setPropertyOnSelection('castShadow', castShadow)
  }

  // function to handle changes in Receive shadow property
  onChangeReceiveShadow = (receiveShadow) => {
    CommandManager.instance.setPropertyOnSelection('receiveShadow', receiveShadow)
  }

  // function to handle change in isUpdateDataMatrix property
  onChangeUpdateDataMatrix = (matrixAutoUpdate) => {
    CommandManager.instance.setPropertyOnSelection('isUpdateDataMatrix', matrixAutoUpdate)
  }

  onChangeIsLivestream = (isLivestream) => {
    CommandManager.instance.setPropertyOnSelection('isLivestream', isLivestream)
  }

  onChangeProjection = (projection) => {
    CommandManager.instance.setPropertyOnSelection('projection', projection)
  }

  onChangeId = (elementId) => {
    CommandManager.instance.setPropertyOnSelection('elementId', elementId)
  }

  onChangeControls = (controls) => {
    CommandManager.instance.setPropertyOnSelection('controls', controls)
  }

  onChangeTransparencyMode = (alphaMode) => {
    CommandManager.instance.setPropertyOnSelection('alphaMode', alphaMode)
  }

  onChangeAlphaCutoff = (alphaCutoff) => {
    CommandManager.instance.setPropertyOnSelection('alphaCutoff', alphaCutoff)
  }

  //creating model ui controls
  renderPropertiesFields = (node) => {
    const videoProjectionOptions = Object.values(VideoProjection).map((v) => ({ label: v, value: v }))
    const mapValue = (v) => ({ label: v, value: v })
    const imageProjectionOptions = Object.values(ImageProjection).map(mapValue)
    const imageTransparencyOptions = Object.values(ImageAlphaMode).map(mapValue)
    switch (node.extendType) {
      case 'model':
        return (
          <Fragment>
            <InputGroup name="Loop Animation" label={this.props.t('editor:properties.model.lbl-loopAnimation')}>
              <SelectInput
                disabled={this.isAnimationPropertyDisabled()}
                options={node.extendNode.getClipOptions()}
                value={node.extendNode.activeClipIndex}
                onChange={this.onChangeAnimation}
              />
            </InputGroup>
            <InputGroup name="Is Avatar" label={this.props.t('editor:properties.model.lbl-isAvatar')}>
              <BooleanInput value={node.extendNode.hasAvatarAnimations} onChange={this.onChangeAnimationSource} />
            </InputGroup>
            <InputGroup name="Texture Override" label={this.props.t('editor:properties.model.lbl-textureOverride')}>
              <SelectInput
                options={SceneManager.instance.scene.children.map((obj: Object3D) => {
                  return {
                    label: obj.name,
                    value: obj.uuid
                  }
                })}
                value={node.extendNode.textureOverride}
                onChange={this.onChangeTextureOverride}
              />
            </InputGroup>
            <InputGroup name="Cast Shadow" label={this.props.t('editor:properties.model.lbl-castShadow')}>
              <BooleanInput value={node.extendNode.castShadow} onChange={this.onChangeCastShadow} />
            </InputGroup>
            <InputGroup name="Receive Shadow" label={this.props.t('editor:properties.model.lbl-receiveShadow')}>
              <BooleanInput value={node.extendNode.receiveShadow} onChange={this.onChangeReceiveShadow} />
            </InputGroup>
            <InputGroup name="MatrixAutoUpdate" label={this.props.t('editor:properties.model.lbl-matrixAutoUpdate')}>
              <BooleanInput value={node.extendNode.isUpdateDataMatrix} onChange={this.onChangeUpdateDataMatrix} />
            </InputGroup>
          </Fragment>
        )
        break
      case 'video':
        return (
          <Fragment>
            <InputGroup name="Livestream" label={this.props.t('editor:properties.video.lbl-islivestream')}>
              <BooleanInput value={node.extendNode.isLivestream} onChange={this.onChangeIsLivestream} />
            </InputGroup>
            <InputGroup name="Projection" label={this.props.t('editor:properties.video.lbl-projection')}>
              <SelectInput
                options={videoProjectionOptions}
                value={node.extendNode.projection}
                onChange={this.onChangeProjection}
              />
            </InputGroup>
            <InputGroup name="Location" label={this.props.t('editor:properties.video.lbl-id')}>
              <ControlledStringInput value={node.extendNode.elementId} onChange={this.onChangeId} />
            </InputGroup>
            <AudioSourceProperties node={node.extendNode} multiEdit={this.props.multiEdit} />
          </Fragment>
        )
        break
      case 'image':
        return (
          <Fragment>
            <InputGroup
              name="Controls"
              label={this.props.t('editor:properties.image.lbl-controls')}
              info={this.props.t('editor:properties.image.info-controls')}
            >
              <BooleanInput value={node.extendNode.controls} onChange={this.onChangeControls} />
            </InputGroup>
            <InputGroup
              name="Transparency Mode"
              label={this.props.t('editor:properties.image.lbl-transparency')}
              info={this.props.t('editor:properties.image.info-transparency')}
            >
              <SelectInput
                options={imageTransparencyOptions}
                value={node.extendNode.alphaMode}
                onChange={this.onChangeTransparencyMode}
              />
            </InputGroup>
            {node.extendNode.alphaMode === ImageAlphaMode.Mask && (
              <NumericInputGroup
                name="Alpha Cutoff"
                label={this.props.t('editor:properties.image.lbl-alphaCutoff')}
                info={this.props.t('editor:properties.image.info-alphaCutoff')}
                min={0}
                max={1}
                smallStep={0.01}
                mediumStep={0.1}
                largeStep={0.25}
                value={node.extendNode.alphaCutoff}
                onChange={this.onChangeAlphaCutoff}
              />
            )}
            <InputGroup name="Projection" label={this.props.t('editor:properties.image.lbl-projection')}>
              <SelectInput
                options={imageProjectionOptions}
                value={node.extendNode.projection}
                onChange={this.onChangeProjection}
              />
            </InputGroup>
          </Fragment>
        )
        break
      default:
        return <Fragment></Fragment>
        break
    }
  }

  // rendering view of WooCommerceNodeEditor
  render() {
    WooCommerceNodeEditor.description = this.props.t('editor:properties.woocommerce.description')
    const node = this.props.node as any
    return (
      <NodeEditor description={WooCommerceNodeEditor.description} {...this.props}>
        <InputGroup name="WooCommerce Domain" label={this.props.t('editor:properties.woocommerce.lbl-domain')}>
          <StringInput value={node.wooCommerceDomain} onChange={this.onChangeDomain} />
        </InputGroup>
        <InputGroup
          name="WooCommerce Consumer Key"
          label={this.props.t('editor:properties.woocommerce.lbl-consumerKey')}
        >
          <StringInput value={node.wooCommerceConsumerKey} onChange={this.onChangeConsumerKey} />
        </InputGroup>
        <InputGroup
          name="WooCommerce Consumer Secret"
          label={this.props.t('editor:properties.woocommerce.lbl-consumerSecret')}
        >
          <StringInput value={node.wooCommerceConsumerSecret} onChange={this.onChangeConsumerSecret} />
        </InputGroup>

        <InputGroup name="WooCommerce Products" label={this.props.t('editor:properties.woocommerce.lbl-products')}>
          <SelectInput
            options={node.wooCommerceProducts}
            value={node.wooCommerceProductId}
            onChange={this.onChangeProducts}
          />
        </InputGroup>

        <InputGroup
          name="WooCommerce Product Items"
          label={this.props.t('editor:properties.woocommerce.lbl-productItems')}
        >
          <SelectInput
            options={node.wooCommerceProductItems}
            value={node.wooCommerceProductItemId}
            onChange={this.onChangeProductItems}
          />
        </InputGroup>
        {this.renderPropertiesFields(node)}
        <InputGroup name="Interactable" label={this.props.t('editor:properties.model.lbl-interactable')}>
          <BooleanInput value={node.interactable} onChange={this.onChangeInteractable} />
        </InputGroup>
        {this.renderInteractableDependantFields(node)}
      </NodeEditor>
    )
  }
}

export default withTranslation()(WooCommerceNodeEditor)
