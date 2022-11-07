import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Vector2 } from 'three'

import { Component, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import { DirectionalLightComponent } from '@xrengine/engine/src/scene/components/DirectionalLightComponent'

import { setPropertyOnSelectionEntities } from '../../classes/History'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import { InfoTooltip } from '../layout/Tooltip'
import { updateProperty } from './Util'

/**
 *  Array containing options for shadow resolution
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
  comp: Component<any, any>
}

/**
 * OnChangeShadowMapResolution used to customize properties of LightShadowProperties
 * Used with LightNodeEditors.
 *
 * @type {[class component]}
 */
export const LightShadowProperties = (props: LightShadowPropertiesProps) => {
  const { t } = useTranslation()

  const changeShadowMapResolution = (resolution) => {
    setPropertyOnSelectionEntities({
      component: props.comp,
      properties: [{ shadowMapResolution: new Vector2(resolution, resolution) }]
    })
  }

  const lightComponent = getComponent(props.node.entity, props.comp)
  const csmEnabled = EngineRenderer.instance.csm && props.comp === DirectionalLightComponent

  return (
    <Fragment>
      <InputGroup
        name="Cast Shadow"
        label={t('editor:properties.directionalLight.lbl-castShadow')}
        info={csmEnabled ? t('editor:properties.directionalLight.lbl-disableForCSM') : ''}
      >
        <BooleanInput
          value={lightComponent.castShadow}
          onChange={updateProperty(props.comp, 'castShadow')}
          disabled={csmEnabled}
        />
      </InputGroup>
      <InputGroup name="Shadow Map Resolution" label={t('editor:properties.directionalLight.lbl-shadowmapResolution')}>
        <SelectInput
          key={props.node.entity}
          options={ShadowMapResolutionOptions}
          value={lightComponent.shadowMapResolution?.x}
          onChange={changeShadowMapResolution}
        />
      </InputGroup>
      <NumericInputGroup
        name="Shadow Bias"
        label={t('editor:properties.directionalLight.lbl-shadowBias')}
        max={0.001}
        min={-0.001}
        mediumStep={0.0000001}
        smallStep={0.000001}
        largeStep={0.0001}
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
