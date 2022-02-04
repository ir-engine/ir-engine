import React, { Fragment } from 'react'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import BooleanInput from '../inputs/BooleanInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import { Vector2 } from 'three'
import { useTranslation } from 'react-i18next'
import { ComponentConstructor, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { updateProperty } from './Util'
import { CommandManager } from '../../managers/CommandManager'

/**
 *  Array containing options for shadow resolution
 *
 * @author Robert Long
 */
const ShadowMapResolutionOptions = [
  {
    label: '256px',
    value: 256
  },
  {
    label: '512px',
    value: 512
  },
  {
    label: '1024px',
    value: 1024
  },
  {
    label: '2048px',
    value: 2048
  },
  {
    label: '4096px (not recommended)',
    value: 4096
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

  const changeShadowMapResolution = (resolution) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component: props.comp,
      properties: { shadowMapResolution: new Vector2(resolution, resolution) }
    })
  }

  const lightComponent = getComponent(props.node.entity, props.comp)

  return (
    <Fragment>
      <InputGroup name="Cast Shadow" label={t('editor:properties.directionalLight.lbl-castShadow')}>
        <BooleanInput value={lightComponent.castShadow} onChange={updateProperty(props.comp, 'castShadow')} />
      </InputGroup>
      <InputGroup name="Shadow Map Resolution" label={t('editor:properties.directionalLight.lbl-shadowmapResolution')}>
        <SelectInput
          options={ShadowMapResolutionOptions}
          value={lightComponent.shadowMapResolution?.x}
          onChange={changeShadowMapResolution}
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
        onChange={updateProperty(props.comp, 'shadowBias')}
      />
      <NumericInputGroup
        name="Shadow Radius"
        label={t('editor:properties.directionalLight.lbl-shadowRadius')}
        mediumStep={0.01}
        smallStep={0.1}
        largeStep={1}
        displayPrecision={0.0001}
        value={lightComponent.shadowRadius}
        onChange={updateProperty(props.comp, 'shadowRadius')}
      />
    </Fragment>
  )
}

export default LightShadowProperties
