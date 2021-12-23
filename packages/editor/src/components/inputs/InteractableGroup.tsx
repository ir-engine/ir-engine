import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import InputGroup from './InputGroup'
import SelectInput from './SelectInput'
import StringInput from './StringInput'
import dompurify from 'dompurify'
import NumericInputGroup from './NumericInputGroup'
import { CommandManager } from '../../managers/CommandManager'
import ArrayInputGroup from './ArrayInputGroup'
import { ItemTypes } from '../../constants/AssetTypes'
import { VideoFileTypes, ImageFileTypes, ModelFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import { EditorComponentType, EditorPropType } from '../properties/Util'
import { InteractableComponentType } from '@xrengine/engine/src/interaction/components/InteractableComponent'
/**
 * Array containing options for InteractableOption.
 *
 * @author Ron Oyama
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

const InteractableTheme = [
  {
    label: 'Theme 01',
    value: 0
  },
  {
    label: 'Theme 02',
    value: 1
  },
  {
    label: 'Theme 03',
    value: 2
  }
]

type InteractableGroupType = {
  component: InteractableComponentType
} & EditorPropType

export const InteractableGroup: EditorComponentType = (props: InteractableGroupType) => {
  const { t } = useTranslation()

  // function to handle changes in interactionType property
  const onChangeInteractionType = (interactionType) => {
    CommandManager.instance.setPropertyOnSelection('interactionType', interactionType)
    if (interactionType === 'equippable') {
      CommandManager.instance.setPropertyOnSelection('isDynamicObject', true)
    }
  }

  // function to handle changes in interactionText property
  const onChangeInteractionText = (interactionText) => {
    CommandManager.instance.setPropertyOnSelection('interactionText', interactionText)
  }

  // function to handle changes in interactionText property
  const onChangeInteractionDistance = (interactionDistance) => {
    CommandManager.instance.setPropertyOnSelection('interactionDistance', interactionDistance)
  }

  // function to handle changes in interactionName property
  const onChangeInteractionName = (interactionName) => {
    CommandManager.instance.setPropertyOnSelection('interactionName', interactionName)
  }

  // function to handle changes in interactionThemeIndex property
  const onChangeInteractionThemeIndex = (interactionThemeIndex) => {
    CommandManager.instance.setPropertyOnSelection('interactionThemeIndex', interactionThemeIndex)
  }

  // function to handle changes in interactionDescription property
  const onChangeInteractionDescription = (interactionDescription) => {
    CommandManager.instance.setPropertyOnSelection('interactionDescription', interactionDescription)
  }

  // function to handle changes in interactionImages property
  const onChangeInteractionImages = (interactionImages) => {
    CommandManager.instance.setPropertyOnSelection('interactionImages', interactionImages)
  }

  // function to handle changes in interactionVideos property
  const onChangeInteractionVideos = (interactionVideos) => {
    CommandManager.instance.setPropertyOnSelection('interactionVideos', interactionVideos)
  }

  // function to handle changes in interactionModels property
  const onChangeInteractionModels = (interactionModels) => {
    CommandManager.instance.setPropertyOnSelection('interactionModels', interactionModels)
  }

  // function to handle changes in interactionUrls property
  const onChangeInteractionUrls = (interactionUrls) => {
    CommandManager.instance.setPropertyOnSelection('interactionUrls', interactionUrls)
  }

  // function to handle changes in payloadHtmlContent
  const onChangePayloadHtmlContent = (payloadHtmlContent) => {
    const sanitizedHTML = dompurify.sanitize(payloadHtmlContent)
    if (sanitizedHTML !== payloadHtmlContent)
      console.warn("Code has been sanitized, don't try anything sneaky please...")
    CommandManager.instance.setPropertyOnSelection('payloadHtmlContent', sanitizedHTML)
  }

  // creating view for interactable type
  const renderInteractableTypeOptions = () => {
    switch (props.component.interactionType) {
      case 'infoBox':
        return (
          <>
            <InputGroup name="Interaction Theme" label={t('editor:properties.interaction.theme')}>
              <SelectInput
                options={InteractableTheme}
                value={props.component.interactionThemeIndex}
                onChange={onChangeInteractionThemeIndex}
              />
            </InputGroup>
            <InputGroup name="Interaction Name" label={t('editor:properties.interaction.name')}>
              <StringInput value={props.component.interactionName} onChange={onChangeInteractionName} />
            </InputGroup>
            <InputGroup name="Interaction Description" label={t('editor:properties.interaction.description')}>
              <StringInput value={props.component.interactionDescription} onChange={onChangeInteractionDescription} />
            </InputGroup>
            <ArrayInputGroup
              name="Interaction Images"
              prefix="Image"
              values={props.component.interactionImages}
              onChange={onChangeInteractionImages}
              label={t('editor:properties.interaction.images')}
              acceptFileTypes={ImageFileTypes}
              itemType={ItemTypes.Images}
            ></ArrayInputGroup>
            <ArrayInputGroup
              name="Interaction Videos"
              prefix="Video"
              values={props.component.interactionVideos}
              onChange={onChangeInteractionVideos}
              label={t('editor:properties.interaction.videos')}
              acceptFileTypes={VideoFileTypes}
              itemType={ItemTypes.Videos}
            ></ArrayInputGroup>
            <ArrayInputGroup
              name="Interaction Urls"
              prefix="Url"
              values={props.component.interactionUrls}
              onChange={onChangeInteractionUrls}
              label={t('editor:properties.interaction.urls')}
            ></ArrayInputGroup>
            <ArrayInputGroup
              name="Interaction Models"
              prefix="Model"
              values={props.component.interactionModels}
              onChange={onChangeInteractionModels}
              label={t('editor:properties.interaction.models')}
              acceptFileTypes={ModelFileTypes}
              itemType={ItemTypes.Models}
            ></ArrayInputGroup>
          </>
        )
      default:
        break
    }
  }

  return (
    <Fragment>
      <InputGroup name="Interaction Text" label={t('editor:properties.interaction.text')}>
        <StringInput value={props.component.interactionText} onChange={onChangeInteractionText} />
      </InputGroup>
      <InputGroup name="Interaction Type" label={t('editor:properties.interaction.type')}>
        <SelectInput
          options={InteractableOption}
          value={props.component.interactionType}
          onChange={onChangeInteractionType}
        />
      </InputGroup>
      <NumericInputGroup
        name="Interaction Distance"
        label={t('editor:properties.interaction.distance')}
        onChange={onChangeInteractionDistance}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={props.component.intensity || 0}
      />
      {renderInteractableTypeOptions()}
    </Fragment>
  )
}

export default InteractableGroup
