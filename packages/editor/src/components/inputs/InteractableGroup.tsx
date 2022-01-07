import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import InputGroup from './InputGroup'
import SelectInput from './SelectInput'
import StringInput from './StringInput'
// import dompurify from 'dompurify'
import NumericInputGroup from './NumericInputGroup'
import { CommandManager } from '../../managers/CommandManager'
import ArrayInputGroup from './ArrayInputGroup'
import { ItemTypes } from '../../constants/AssetTypes'
import { VideoFileTypes, ImageFileTypes, ModelFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import { EditorComponentType, updateProperty } from '../properties/Util'
import { InteractableComponent } from '@xrengine/engine/src/interaction/components/InteractableComponent'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
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

export const InteractableGroup: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const onChangeInteractionType = (interactionType) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component: InteractableComponent,
      properties: { interactionType }
    })

    if (interactionType === 'equippable') {
      CommandManager.instance.setPropertyOnSelectionEntities({
        component: ModelComponent,
        properties: { isDynamicObject: true }
      })
    }
  }

  // function to handle changes in payloadHtmlContent
  // const onChangePayloadHtmlContent = (payloadHtmlContent) => {
  //   const sanitizedHTML = dompurify.sanitize(payloadHtmlContent)
  //   if (sanitizedHTML !== payloadHtmlContent)
  //     console.warn("Code has been sanitized, don't try anything sneaky please...")
  //   CommandManager.instance.setPropertyOnSelectionEntities({
  //     component: InteractableComponent,
  //     properties: { payloadHtmlContent: sanitizedHTML }
  //   })
  // }

  const interactableComponent = getComponent(props.node.entity, InteractableComponent)

  const renderInteractableTypeOptions = () => {
    switch (interactableComponent.interactionType) {
      case 'infoBox':
        return (
          <>
            <InputGroup name="Interaction Theme" label={t('editor:properties.interaction.theme')}>
              <SelectInput
                options={InteractableTheme}
                value={interactableComponent.interactionThemeIndex}
                onChange={updateProperty(InteractableComponent, 'interactionThemeIndex')}
              />
            </InputGroup>
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
      default:
        break
    }
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
          options={InteractableOption}
          value={interactableComponent.interactionType}
          onChange={onChangeInteractionType}
        />
      </InputGroup>
      <NumericInputGroup
        name="Interaction Distance"
        label={t('editor:properties.interaction.distance')}
        onChange={updateProperty(InteractableComponent, 'intensity')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={interactableComponent.intensity || 0}
      />
      {renderInteractableTypeOptions()}
    </Fragment>
  )
}

export default InteractableGroup
