import React, { Fragment } from 'react'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import BooleanInput from '../inputs/BooleanInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import { Vector2 } from 'three'
import { useTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import { ComponentConstructor, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'

/**
 *  Array containing options for shadow resolution
 *
 * @author Robert Long
 */
const ShadowMapResolutionOptions = [
  {
    label: '256px',
    value: new Vector2(256, 256)
  },
  {
    label: '512px',
    value: new Vector2(512, 512)
  },
  {
    label: '1024px',
    value: new Vector2(1024, 1024)
  },
  {
    label: '2048px',
    value: new Vector2(2048, 2048)
  },
  {
    label: '4096px (not recommended)',
    value: new Vector2(4096, 4096)
  }
]

//creating properties for LightShadowProperties component
type LightShadowPropertiesProps = {
  node: EntityTreeNode
  comp: ComponentConstructor<any, any>
}

/**
 * OnChangeShadowMapResolution used to customize properties of LightShadowProperties
 * Used with LightNodeEditors.
 *
 * @author Robert Long
 * @type {[class component]}
 */
export const LightShadowProperties = (props: LightShadowPropertiesProps) => {
  const { t } = useTranslation()

  // function to handle the change in shadowMapResolution propery
  const onChangeShadowMapResolution = (shadowMapResolution) => {
    CommandManager.instance.setPropertyOnSelectionEntities(props.comp, 'shadowMapResolution', shadowMapResolution)
  }

  // function to handle changes in castShadow propery
  const onChangeCastShadow = (castShadow) => {
    CommandManager.instance.setPropertyOnSelectionEntities(props.comp, 'castShadow', castShadow)
  }

  // fucntion to handle changes in shadowBias property
  const onChangeShadowBias = (shadowBias) => {
    CommandManager.instance.setPropertyOnSelectionEntities(props.comp, 'shadowBias', shadowBias)
  }

  // function to handle changes shadowRadius property
  const onChangeShadowRadius = (shadowRadius) => {
    CommandManager.instance.setPropertyOnSelectionEntities(props.comp, 'shadowRadius', shadowRadius)
  }

  const lightComponent = getComponent(props.node.entity, props.comp)

  return (
    <Fragment>
      <InputGroup name="Cast Shadow" label={t('editor:properties.directionalLight.lbl-castShadow')}>
        <BooleanInput value={lightComponent.castShadow} onChange={onChangeCastShadow} />
      </InputGroup>
      <InputGroup name="Shadow Map Resolution" label={t('editor:properties.directionalLight.lbl-shadowmapResolution')}>
        <SelectInput
          options={ShadowMapResolutionOptions}
          value={lightComponent.shadowMapResolution}
          onChange={onChangeShadowMapResolution}
        />
      </InputGroup>
      <NumericInputGroup
        name="Shadow Bias"
        label={t('editor:properties.directionalLight.lbl-shadowBias')}
        mediumStep={0.00001}
        smallStep={0.0001}
        largeStep={0.001}
        displayPrecision={0.000001}
        value={lightComponent.shadowBias}
        onChange={onChangeShadowBias}
      />
      <NumericInputGroup
        name="Shadow Radius"
        label={t('editor:properties.directionalLight.lbl-shadowRadius')}
        mediumStep={0.01}
        smallStep={0.1}
        largeStep={1}
        displayPrecision={0.0001}
        value={lightComponent.shadowRadius}
        onChange={onChangeShadowRadius}
      />
    </Fragment>
  )
}

export default LightShadowProperties
