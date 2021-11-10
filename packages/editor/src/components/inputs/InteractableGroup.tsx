import React, { Component, Fragment } from 'react'
import { withTranslation } from 'react-i18next'
import InputGroup from './InputGroup'
import SelectInput from './SelectInput'
import StringInput from './StringInput'
import dompurify from 'dompurify'
import NumericInputGroup from './NumericInputGroup'
import { CommandManager } from '../../managers/CommandManager'
import ArrayInputGroup from './ArrayInputGroup'

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

/**
 * Declaring properties for InteractableGroup component.
 *
 * @author Ron Oyama
 * @type {Object}
 */
type InteractableGroupProps = {
  node?: object
  t: Function
}

//Declaring TriggerVolumeNodeEditor state
type InteractableGroupState = {
  options: any[]
}

export class InteractableGroup extends Component<InteractableGroupProps, InteractableGroupState> {
  //initializing props and state

  constructor(props) {
    super(props)
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

  // function to handle changes in interactionName property
  onChangeInteractionName = (interactionName) => {
    CommandManager.instance.setPropertyOnSelection('interactionName', interactionName)
  }

  // function to handle changes in interactionThemeIndex property
  onChangeInteractionThemeIndex = (interactionThemeIndex) => {
    CommandManager.instance.setPropertyOnSelection('interactionThemeIndex', interactionThemeIndex)
  }

  // function to handle changes in interactionDescription property
  onChangeInteractionDescription = (interactionDescription) => {
    CommandManager.instance.setPropertyOnSelection('interactionDescription', interactionDescription)
  }

  // function to handle changes in interactionImages property
  onChangeInteractionImages = (interactionImages) => {
    CommandManager.instance.setPropertyOnSelection('interactionImages', interactionImages)
  }

  // function to handle changes in interactionVideos property
  onChangeInteractionVideos = (interactionVideos) => {
    CommandManager.instance.setPropertyOnSelection('interactionVideos', interactionVideos)
  }

  // function to handle changes in interactionModels property
  onChangeInteractionModels = (interactionModels) => {
    CommandManager.instance.setPropertyOnSelection('interactionModels', interactionModels)
  }

  // function to handle changes in interactionUrls property
  onChangeInteractionUrls = (interactionUrls) => {
    CommandManager.instance.setPropertyOnSelection('interactionUrls', interactionUrls)
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
            <InputGroup name="Interaction Theme" label={this.props.t('editor:properties.interaction.theme')}>
              <SelectInput
                options={InteractableTheme}
                value={node.interactionThemeIndex}
                onChange={this.onChangeInteractionThemeIndex}
              />
            </InputGroup>
            <InputGroup name="Interaction Name" label={this.props.t('editor:properties.interaction.name')}>
              <StringInput value={node.interactionName} onChange={this.onChangeInteractionName} />
            </InputGroup>
            <InputGroup
              name="Interaction Description"
              label={this.props.t('editor:properties.interaction.description')}
            >
              <StringInput value={node.interactionDescription} onChange={this.onChangeInteractionDescription} />
            </InputGroup>
            <ArrayInputGroup
              name="Interaction Images"
              prefix="Image"
              values={node.interactionImages}
              onChange={this.onChangeInteractionImages}
              label={this.props.t('editor:properties.interaction.images')}
            ></ArrayInputGroup>
            <ArrayInputGroup
              name="Interaction Videos"
              prefix="Video"
              values={node.interactionVideos}
              onChange={this.onChangeInteractionVideos}
              label={this.props.t('editor:properties.interaction.videos')}
            ></ArrayInputGroup>
            <ArrayInputGroup
              name="Interaction Urls"
              prefix="Url"
              values={node.interactionUrls}
              onChange={this.onChangeInteractionUrls}
              label={this.props.t('editor:properties.interaction.urls')}
            ></ArrayInputGroup>
            <ArrayInputGroup
              name="Interaction Models"
              prefix="Model"
              values={node.interactionModels}
              onChange={this.onChangeInteractionModels}
              label={this.props.t('editor:properties.interaction.models')}
            ></ArrayInputGroup>
          </>
        )
      default:
        break
    }
  }

  // rendering view of InteractableGroup
  render() {
    const node = this.props.node as any
    return (
      <Fragment>
        <InputGroup name="Interaction Text" label={this.props.t('editor:properties.interaction.text')}>
          <StringInput value={node.interactionText} onChange={this.onChangeInteractionText} />
        </InputGroup>
        <InputGroup name="Interaction Type" label={this.props.t('editor:properties.interaction.type')}>
          <SelectInput
            options={InteractableOption}
            value={node.interactionType}
            onChange={this.onChangeInteractionType}
          />
        </InputGroup>
        <NumericInputGroup
          name="Interaction Distance"
          label={this.props.t('editor:properties.interaction.distance')}
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
  }
}

export default withTranslation()(InteractableGroup)
