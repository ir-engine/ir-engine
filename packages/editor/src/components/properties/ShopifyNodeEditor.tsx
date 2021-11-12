import { ShoppingCart } from '@styled-icons/fa-solid/ShoppingCart'
import React, { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
type ShopifyNodeEditorProps = {
  node?: object
  multiEdit?: boolean
}

//Declaring TriggerVolumeNodeEditor state
type ShopifyNodeEditorState = {
  options: any[]
}

/**
 * ShopifyNodeEditor used to create editor view for the properties of ShopifyNode.
 *
 * @author Robert Long
 * @type {class component}
 */
export const ShopifyNodeEditor = (props: ShopifyNodeEditorProps) => {
  const [options, setOptions] = useState([])
  const { t } = useTranslation()

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

  //Shopify UI Controls
  const onChangeShopifyDomain = (domain) => {
    CommandManager.instance.setPropertyOnSelection('shopifyDomain', domain)
  }

  const onChangeShopifyToken = (token) => {
    CommandManager.instance.setPropertyOnSelection('shopifyToken', token)
  }

  const onChangeProducts = (id) => {
    CommandManager.instance.setPropertyOnSelection('shopifyProductId', id)
  }

  const onChangeProductItems = (id) => {
    CommandManager.instance.setPropertyOnSelection('shopifyProductItemId', id)
  }

  //Interactive UI Controls
  // function to handle changes in interactable property
  const onChangeInteractable = (interactable) => {
    CommandManager.instance.setPropertyOnSelection('interactable', interactable)
  }

  // function to handle changes in interactionType property
  const onChangeInteractionType = (interactionType) => {
    CommandManager.instance.setPropertyOnSelection('interactionType', interactionType)
  }

  // function to handle changes in interactionText property
  const onChangeInteractionText = (interactionText) => {
    CommandManager.instance.setPropertyOnSelection('interactionText', interactionText)
  }

  // function to handle changes in interactionText property
  const onChangeInteractionDistance = (interactionDistance) => {
    CommandManager.instance.setPropertyOnSelection('interactionDistance', interactionDistance)
  }

  // function to handle changes in payloadName property
  const onChangePayloadName = (payloadName) => {
    CommandManager.instance.setPropertyOnSelection('payloadName', payloadName)
  }

  // function to handle changes in payloadUrl
  const onChangePayloadUrl = (payloadUrl) => {
    CommandManager.instance.setPropertyOnSelection('payloadUrl', payloadUrl)
  }

  // function to handle changes in payloadBuyUrl
  const onChangePayloadBuyUrl = (payloadBuyUrl) => {
    CommandManager.instance.setPropertyOnSelection('payloadBuyUrl', payloadBuyUrl)
  }

  // function to handle changes in payloadLearnMoreUrl
  const onChangePayloadLearnMoreUrl = (payloadLearnMoreUrl) => {
    CommandManager.instance.setPropertyOnSelection('payloadLearnMoreUrl', payloadLearnMoreUrl)
  }

  // function to handle changes in payloadHtmlContent
  const onChangePayloadHtmlContent = (payloadHtmlContent) => {
    const sanitizedHTML = dompurify.sanitize(payloadHtmlContent)
    if (sanitizedHTML !== payloadHtmlContent)
      console.warn("Code has been sanitized, don't try anything sneaky please...")
    CommandManager.instance.setPropertyOnSelection('payloadHtmlContent', sanitizedHTML)
  }

  // creating view for interactable type
  const renderInteractableTypeOptions = (node) => {
    switch (node.interactionType) {
      case 'infoBox':
        return (
          <>
            <InputGroup name="Name" label={t('editor:properties.shopify.lbl-name')}>
              <StringInput value={node.payloadName} onChange={onChangePayloadName} />
            </InputGroup>
            <InputGroup name="Url" label={t('editor:properties.shopify.lbl-url')}>
              <StringInput value={node.payloadUrl} onChange={onChangePayloadUrl} />
            </InputGroup>
            <InputGroup name="BuyUrl" label={t('editor:properties.shopify.lbl-buy')}>
              <StringInput value={node.payloadBuyUrl} onChange={onChangePayloadBuyUrl} />
            </InputGroup>
            <InputGroup name="LearnMoreUrl" label={t('editor:properties.shopify.lbl-learnMore')}>
              <StringInput value={node.payloadLearnMoreUrl} onChange={onChangePayloadLearnMoreUrl} />
            </InputGroup>
            <InputGroup name="HtmlContent" label={t('editor:properties.shopify.lbl-htmlContent')}>
              <StringInput value={node.payloadHtmlContent} onChange={onChangePayloadHtmlContent} />
            </InputGroup>
          </>
        )
      default:
        break
    }
  }

  // creating view for dependent fields
  const renderInteractableDependantFields = (node) => {
    switch (node.interactable) {
      case true:
        return (
          <Fragment>
            <InputGroup name="Interaction Text" label={t('editor:properties.shopify.lbl-interactionText')}>
              <StringInput value={node.interactionText} onChange={onChangeInteractionText} />
            </InputGroup>
            <InputGroup name="Interaction Type" label={t('editor:properties.shopify.lbl-interactionType')}>
              <SelectInput
                options={InteractableOption}
                value={node.interactionType}
                onChange={onChangeInteractionType}
              />
            </InputGroup>
            <NumericInputGroup
              name="Interaction Distance"
              label={t('editor:properties.shopify.lbl-interactionDistance')}
              onChange={onChangeInteractionDistance}
              min={0}
              smallStep={0.001}
              mediumStep={0.01}
              largeStep={0.1}
              value={(node as any).intensity}
            />
            {renderInteractableTypeOptions(node)}
          </Fragment>
        )
      default:
        break
    }
  }

  //Model UI Controls
  const isAnimationPropertyDisabled = () => {
    const { multiEdit, node } = props as any
    if (multiEdit) {
      return CommandManager.instance.selected.some((selectedNode) => selectedNode.src !== node.src)
    }
    return false
  }

  const onChangeAnimation = (activeClipIndex) => {
    CommandManager.instance.setPropertyOnSelection('activeClipIndex', activeClipIndex)
  }

  const onChangeAnimationSource = (hasAvatarAnimations) => {
    CommandManager.instance.setPropertyOnSelection('hasAvatarAnimations', hasAvatarAnimations)
    ;(props.node as any).reload()
  }
  const onChangeTextureOverride = (textureOverride) => {
    CommandManager.instance.setPropertyOnSelection('textureOverride', textureOverride)
  }

  // function to handle changes in castShadow property
  const onChangeCastShadow = (castShadow) => {
    CommandManager.instance.setPropertyOnSelection('castShadow', castShadow)
  }

  // function to handle changes in Receive shadow property
  const onChangeReceiveShadow = (receiveShadow) => {
    CommandManager.instance.setPropertyOnSelection('receiveShadow', receiveShadow)
  }

  // function to handle change in isUpdateDataMatrix property
  const onChangeUpdateDataMatrix = (matrixAutoUpdate) => {
    CommandManager.instance.setPropertyOnSelection('isUpdateDataMatrix', matrixAutoUpdate)
  }

  const onChangeIsLivestream = (isLivestream) => {
    CommandManager.instance.setPropertyOnSelection('isLivestream', isLivestream)
  }

  const onChangeProjection = (projection) => {
    CommandManager.instance.setPropertyOnSelection('projection', projection)
  }

  const onChangeId = (elementId) => {
    CommandManager.instance.setPropertyOnSelection('elementId', elementId)
  }

  const onChangeControls = (controls) => {
    CommandManager.instance.setPropertyOnSelection('controls', controls)
  }

  const onChangeTransparencyMode = (alphaMode) => {
    CommandManager.instance.setPropertyOnSelection('alphaMode', alphaMode)
  }

  const onChangeAlphaCutoff = (alphaCutoff) => {
    CommandManager.instance.setPropertyOnSelection('alphaCutoff', alphaCutoff)
  }

  //creating model ui controls
  const renderPropertiesFields = (node) => {
    const videoProjectionOptions = Object.values(VideoProjection).map((v) => ({ label: v, value: v }))
    const mapValue = (v) => ({ label: v, value: v })
    const imageProjectionOptions = Object.values(ImageProjection).map(mapValue)
    const imageTransparencyOptions = Object.values(ImageAlphaMode).map(mapValue)
    switch (node.extendType) {
      case 'model':
        return (
          <Fragment>
            <InputGroup name="Loop Animation" label={t('editor:properties.model.lbl-loopAnimation')}>
              <SelectInput
                disabled={isAnimationPropertyDisabled()}
                options={node.extendNode.getClipOptions()}
                value={node.extendNode.activeClipIndex}
                onChange={onChangeAnimation}
              />
            </InputGroup>
            <InputGroup name="Is Avatar" label={t('editor:properties.model.lbl-isAvatar')}>
              <BooleanInput value={node.extendNode.hasAvatarAnimations} onChange={onChangeAnimationSource} />
            </InputGroup>
            <InputGroup name="Texture Override" label={t('editor:properties.model.lbl-textureOverride')}>
              <SelectInput
                options={SceneManager.instance.scene.children.map((obj: Object3D) => {
                  return {
                    label: obj.name,
                    value: obj.uuid
                  }
                })}
                value={node.extendNode.textureOverride}
                onChange={onChangeTextureOverride}
              />
            </InputGroup>
            <InputGroup name="Cast Shadow" label={t('editor:properties.model.lbl-castShadow')}>
              <BooleanInput value={node.extendNode.castShadow} onChange={onChangeCastShadow} />
            </InputGroup>
            <InputGroup name="Receive Shadow" label={t('editor:properties.model.lbl-receiveShadow')}>
              <BooleanInput value={node.extendNode.receiveShadow} onChange={onChangeReceiveShadow} />
            </InputGroup>
            <InputGroup name="MatrixAutoUpdate" label={t('editor:properties.model.lbl-matrixAutoUpdate')}>
              <BooleanInput value={node.extendNode.isUpdateDataMatrix} onChange={onChangeUpdateDataMatrix} />
            </InputGroup>
          </Fragment>
        )
        break
      case 'video':
        return (
          <Fragment>
            <InputGroup name="Livestream" label={t('editor:properties.video.lbl-islivestream')}>
              <BooleanInput value={node.extendNode.isLivestream} onChange={onChangeIsLivestream} />
            </InputGroup>
            <InputGroup name="Projection" label={t('editor:properties.video.lbl-projection')}>
              <SelectInput
                options={videoProjectionOptions}
                value={node.extendNode.projection}
                onChange={onChangeProjection}
              />
            </InputGroup>
            <InputGroup name="Location" label={t('editor:properties.video.lbl-id')}>
              <ControlledStringInput value={node.extendNode.elementId} onChange={onChangeId} />
            </InputGroup>
            <AudioSourceProperties node={node.extendNode} multiEdit={props.multiEdit} />
          </Fragment>
        )
        break
      case 'image':
        return (
          <Fragment>
            <InputGroup
              name="Controls"
              label={t('editor:properties.image.lbl-controls')}
              info={t('editor:properties.image.info-controls')}
            >
              <BooleanInput value={node.extendNode.controls} onChange={onChangeControls} />
            </InputGroup>
            <InputGroup
              name="Transparency Mode"
              label={t('editor:properties.image.lbl-transparency')}
              info={t('editor:properties.image.info-transparency')}
            >
              <SelectInput
                options={imageTransparencyOptions}
                value={node.extendNode.alphaMode}
                onChange={onChangeTransparencyMode}
              />
            </InputGroup>
            {node.extendNode.alphaMode === ImageAlphaMode.Mask && (
              <NumericInputGroup
                name="Alpha Cutoff"
                label={t('editor:properties.image.lbl-alphaCutoff')}
                info={t('editor:properties.image.info-alphaCutoff')}
                min={0}
                max={1}
                smallStep={0.01}
                mediumStep={0.1}
                largeStep={0.25}
                value={node.extendNode.alphaCutoff}
                onChange={onChangeAlphaCutoff}
              />
            )}
            <InputGroup name="Projection" label={t('editor:properties.image.lbl-projection')}>
              <SelectInput
                options={imageProjectionOptions}
                value={node.extendNode.projection}
                onChange={onChangeProjection}
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

  // rendering view of ShopifyNodeEditor
  const node = props.node as any
  return (
    <NodeEditor description={t('editor:properties.shopify.description')} {...props}>
      <InputGroup name="Shopify Domain" label={t('editor:properties.shopify.lbl-shopifyDomain')}>
        <StringInput value={node.shopifyDomain} onChange={onChangeShopifyDomain} />
      </InputGroup>
      <InputGroup name="Shopify Acess Token" label={t('editor:properties.shopify.lbl-shopifyAccessToken')}>
        <StringInput value={node.shopifyToken} onChange={onChangeShopifyToken} />
      </InputGroup>

      <InputGroup name="Shopify Products" label={t('editor:properties.shopify.lbl-shopifyProducts')}>
        <SelectInput options={node.shopifyProducts} value={node.shopifyProductId} onChange={onChangeProducts} />
      </InputGroup>

      <InputGroup name="Shopify Products" label={t('editor:properties.shopify.lbl-shopifyProductItems')}>
        <SelectInput
          options={node.shopifyProductItems}
          value={node.shopifyProductItemId}
          onChange={onChangeProductItems}
        />
      </InputGroup>
      {renderPropertiesFields(node)}
      <InputGroup name="Interactable" label={t('editor:properties.model.lbl-interactable')}>
        <BooleanInput value={node.interactable} onChange={onChangeInteractable} />
      </InputGroup>
      {renderInteractableDependantFields(node)}
    </NodeEditor>
  )
}

ShopifyNodeEditor.iconComponent = ShoppingCart

export default ShopifyNodeEditor
