import i18n from 'i18next'
import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import InteractableGroup from '../inputs/InteractableGroup'
import NodeEditor from './NodeEditor'
import { Object3D } from 'three'
import NumericInputGroup from '../inputs/NumericInputGroup'
import { CommandManager } from '../../managers/CommandManager'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'

import AudioSourceProperties from './AudioSourceProperties'
import { ControlledStringInput } from '../inputs/StringInput'
import { VideoProjection } from '@xrengine/engine/src/scene/classes/Video'
import { ImageProjection, ImageAlphaMode } from '@xrengine/engine/src/scene/classes/ImageUtils'

/**
 * Declaring properties for ModalNodeEditor component.
 *
 * @author Ron Oyama
 * @type {Object}
 */
type WooCommerceNodeEditorProps = {
  node?: object
  multiEdit?: boolean
  t: Function
}

export const WooCommerceNodeEditor = (props: WooCommerceNodeEditorProps) => {
  const { t } = useTranslation()

  const onChangeDomain = (domain) => {
    CommandManager.instance.setPropertyOnSelection('wooCommerceDomain', domain)
  }

  const onChangeConsumerKey = (token) => {
    CommandManager.instance.setPropertyOnSelection('wooCommerceConsumerKey', token)
  }

  const onChangeConsumerSecret = (token) => {
    CommandManager.instance.setPropertyOnSelection('wooCommerceConsumerSecret', token)
  }

  const onChangeProducts = (id) => {
    CommandManager.instance.setPropertyOnSelection('wooCommerceProductId', id)
  }

  const onChangeProductItems = (id) => {
    CommandManager.instance.setPropertyOnSelection('wooCommerceProductItemId', id)
  }

  //Interactive UI Controls
  // function to handle changes in interactable property
  const onChangeInteractable = (interactable) => {
    CommandManager.instance.setPropertyOnSelection('interactable', interactable)
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
                options={Engine.scene.children.map((obj: Object3D) => {
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

  const node = props.node as any
  return (
    <NodeEditor description={WooCommerceNodeEditor.description} {...props}>
      <InputGroup name="WooCommerce Domain" label={t('editor:properties.woocommerce.lbl-domain')}>
        <StringInput value={node.wooCommerceDomain} onChange={onChangeDomain} />
      </InputGroup>
      <InputGroup name="WooCommerce Consumer Key" label={t('editor:properties.woocommerce.lbl-consumerKey')}>
        <StringInput value={node.wooCommerceConsumerKey} onChange={onChangeConsumerKey} />
      </InputGroup>
      <InputGroup name="WooCommerce Consumer Secret" label={t('editor:properties.woocommerce.lbl-consumerSecret')}>
        <StringInput value={node.wooCommerceConsumerSecret} onChange={onChangeConsumerSecret} />
      </InputGroup>

      {node.wooCommerceProducts && node.wooCommerceProducts.length > 0 && (
        <InputGroup name="WooCommerce Products" label={t('editor:properties.woocommerce.lbl-products')}>
          <SelectInput
            options={node.wooCommerceProducts}
            value={node.wooCommerceProductId}
            onChange={onChangeProducts}
          />
        </InputGroup>
      )}

      {node.wooCommerceProductItems && node.wooCommerceProductItems.length > 0 && (
        <InputGroup name="WooCommerce Product Items" label={t('editor:properties.woocommerce.lbl-productItems')}>
          <SelectInput
            options={node.wooCommerceProductItems}
            value={node.wooCommerceProductItemId}
            onChange={onChangeProductItems}
          />
        </InputGroup>
      )}

      {renderPropertiesFields(node)}
      {node.wooCommerceProductItemId != '' && (
        <InputGroup name="Interactable" label={t('editor:properties.model.lbl-interactable')}>
          <BooleanInput value={node.interactable} onChange={onChangeInteractable} />
        </InputGroup>
      )}
      {node.interactable && <InteractableGroup node={node} t={t}></InteractableGroup>}
    </NodeEditor>
  )
}

WooCommerceNodeEditor.description = i18n.t('editor:properties.woocommerce.description')
WooCommerceNodeEditor.iconComponent = ShoppingCartIcon

export default WooCommerceNodeEditor
