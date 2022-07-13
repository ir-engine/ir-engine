import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

import { ImageFileTypes, ModelFileTypes, VideoFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import {
  DEFAULT_INTERACTABLE,
  InteractableComponent
} from '@xrengine/engine/src/interaction/components/InteractableComponent'
import { InteractiveViews } from '@xrengine/engine/src/interaction/systems/InteractiveSystem'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'

import { setPropertyOnSelectionEntities } from '../../classes/History'
import { ItemTypes } from '../../constants/AssetTypes'
import { EditorComponentType, updateProperty } from '../properties/Util'
import ArrayInputGroup from './ArrayInputGroup'
import InputGroup from './InputGroup'
// import dompurify from 'dompurify'
import NumericInputGroup from './NumericInputGroup'
import SelectInput from './SelectInput'
import StringInput from './StringInput'

export const InteractableGroup: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const onChangeInteractionType = (interactionType) => {
    setPropertyOnSelectionEntities({
      component: InteractableComponent,
      properties: [{ interactionType }]
    })

    if (interactionType === 'equippable') {
      setPropertyOnSelectionEntities({
        component: ModelComponent,
        properties: [{ isDynamicObject: true }]
      })
    }
  }

  // function to handle changes in payloadHtmlContent
  // const onChangePayloadHtmlContent = (payloadHtmlContent) => {
  //   const sanitizedHTML = dompurify.sanitize(payloadHtmlContent)
  //   if (sanitizedHTML !== payloadHtmlContent)
  //     console.warn("Code has been sanitized, don't try anything sneaky please...")
  //   setPropertyOnSelectionEntities({
  //     component: InteractableComponent,
  //     properties: [{ payloadHtmlContent: sanitizedHTML }]
  //   })
  // }

  const interactableComponent = getComponent(props.node.entity, InteractableComponent)?.value
  if (!interactableComponent) return null!

  const interactableTypeOptions = Array.from(InteractiveViews.keys()).map((val) => {
    return {
      label: val,
      value: val
    }
  })

  const renderInteractableModalOptions = () => {
    return (
      <>
        <InputGroup name="Interaction Name" label={t('editor:properties.interaction.name')}>
          <StringInput
            value={interactableComponent.interactionName}
            onChange={updateProperty(InteractableComponent, 'interactionName')}
          />
        </InputGroup>
        <InputGroup name="Interaction Description" label={t('editor:properties.interaction.description')}>
          <StringInput
            value={interactableComponent.interactionDescription}
            onChange={updateProperty(InteractableComponent, 'interactionDescription')}
          />
        </InputGroup>
        <ArrayInputGroup
          name="Interaction Images"
          prefix="Image"
          values={interactableComponent.interactionImages}
          onChange={updateProperty(InteractableComponent, 'interactionImages')}
          label={t('editor:properties.interaction.images')}
          acceptFileTypes={ImageFileTypes}
          itemType={ItemTypes.Images}
        ></ArrayInputGroup>
        <ArrayInputGroup
          name="Interaction Videos"
          prefix="Video"
          values={interactableComponent.interactionVideos}
          onChange={updateProperty(InteractableComponent, 'interactionVideos')}
          label={t('editor:properties.interaction.videos')}
          acceptFileTypes={VideoFileTypes}
          itemType={ItemTypes.Videos}
        ></ArrayInputGroup>
        <ArrayInputGroup
          name="Interaction Urls"
          prefix="Url"
          values={interactableComponent.interactionUrls}
          onChange={updateProperty(InteractableComponent, 'interactionUrls')}
          label={t('editor:properties.interaction.urls')}
        ></ArrayInputGroup>
        <ArrayInputGroup
          name="Interaction Models"
          prefix="Model"
          values={interactableComponent.interactionModels}
          onChange={updateProperty(InteractableComponent, 'interactionModels')}
          label={t('editor:properties.interaction.models')}
          acceptFileTypes={ModelFileTypes}
          itemType={ItemTypes.Models}
        ></ArrayInputGroup>
      </>
    )
  }

  return (
    <Fragment>
      <InputGroup name="Interaction Text" label={t('editor:properties.interaction.text')}>
        <StringInput
          value={interactableComponent.interactionText}
          onChange={updateProperty(InteractableComponent, 'interactionText')}
        />
      </InputGroup>
      <InputGroup name="Interaction Type" label={t('editor:properties.interaction.type')}>
        <SelectInput
          key={props.node.entity}
          options={interactableTypeOptions}
          value={interactableComponent.interactionType || ''}
          onChange={onChangeInteractionType}
        />
      </InputGroup>
      <NumericInputGroup
        name="Interaction Distance"
        label={t('editor:properties.interaction.distance')}
        onChange={updateProperty(InteractableComponent, 'interactionDistance')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={interactableComponent.interactionDistance || 0}
      />
      {interactableComponent.interactionType === DEFAULT_INTERACTABLE ? renderInteractableModalOptions() : null}
    </Fragment>
  )
}

export default InteractableGroup
