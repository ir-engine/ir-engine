import React, { useCallback, useState } from 'react'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { withTranslation } from 'react-i18next'
import { RenderSettingsComponent } from '@xrengine/engine/src/scene/components/RenderSettingsComponent'
import Vector3Input from '../inputs/Vector3Input'
import BooleanInput from '../inputs/BooleanInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import {
  NoToneMapping,
  LinearToneMapping,
  ReinhardToneMapping,
  CineonToneMapping,
  ACESFilmicToneMapping,
  BasicShadowMap,
  PCFShadowMap,
  PCFSoftShadowMap,
  VSMShadowMap
} from 'three'

/**
 * ToneMappingOptions array containing tone mapping type options.
 *
 * @author Josh Field
 * @type {Array}
 */
const ToneMappingOptions = [
  {
    label: 'No Tone Mapping',
    value: NoToneMapping
  },
  {
    label: 'Linear Tone Mapping',
    value: LinearToneMapping
  },
  {
    label: 'Reinhard Tone Mapping',
    value: ReinhardToneMapping
  },
  {
    label: 'Cineon Tone Mapping',
    value: CineonToneMapping
  },
  {
    label: 'ACES Filmic Tone Mapping',
    value: ACESFilmicToneMapping
  }
]

/**
 * ShadowTypeOptions array containing shadow type options.
 *
 * @author Josh Field
 * @type {Array}
 */
const ShadowTypeOptions = [
  {
    label: 'No Shadow Map',
    value: undefined
  },
  {
    label: 'Basic Shadow Map',
    value: BasicShadowMap
  },
  {
    label: 'PCF Shadow Map',
    value: PCFShadowMap
  },
  {
    label: 'PCF Soft Shadow Map',
    value: PCFSoftShadowMap
  },
  {
    label: 'VSM Shadow Map',
    value: VSMShadowMap
  }
]

/**
 * SceneNodeEditor provides the editor view for property customization.
 *
 * @author Robert Long
 * @param       props
 * @constructor
 */
const RenderSettingsEditor = (props) => {
  const [, updateState] = useState()

  const forceUpdate = useCallback(() => updateState({}), [])

  const onChangeUseSimpleMaterials = (useSimpleMaterial) => {
    const renderSettingsComponent = getComponent(props.node.eid, RenderSettingsComponent)
    renderSettingsComponent.useSimpleMaterial = useSimpleMaterial
    forceUpdate()
  }

  const onChangeLODs = (LODs) => {
    const renderSettingsComponent = getComponent(props.node.eid, RenderSettingsComponent)
    renderSettingsComponent.LODs = LODs
    forceUpdate()
  }

  const onChangeOverrideRendererettings = (overrideRendererSettings) => {
    const renderSettingsComponent = getComponent(props.node.eid, RenderSettingsComponent)
    renderSettingsComponent.overrideRendererSettings = overrideRendererSettings
    forceUpdate()
  }

  const onChangeUseCSM = (csm) => {
    const renderSettingsComponent = getComponent(props.node.eid, RenderSettingsComponent)
    renderSettingsComponent.csm = csm
    forceUpdate()
  }

  const onChangeUseToneMapping = (toneMapping) => {
    const renderSettingsComponent = getComponent(props.node.eid, RenderSettingsComponent)
    renderSettingsComponent.toneMapping = toneMapping
    forceUpdate()
  }

  const onChangeUseToneMappingExposure = (toneMappingExposure) => {
    const renderSettingsComponent = getComponent(props.node.eid, RenderSettingsComponent)
    renderSettingsComponent.toneMappingExposure = toneMappingExposure
    forceUpdate()
  }

  const onChangeUseShadowMapType = (shadowMapType) => {
    const renderSettingsComponent = getComponent(props.node.eid, RenderSettingsComponent)
    renderSettingsComponent.shadowMapType = shadowMapType
    forceUpdate()
  }

  const renderSettingsComponent = getComponent(props.node.eid, RenderSettingsComponent)

  return (
    <NodeEditor {...props}>
      <InputGroup
        name="Use Simple Materials"
        label={props.t('editor:properties.scene.lbl-simpleMaterials')}
        info={props.t('editor:properties.scene.info-simpleMaterials')}
      >
        <BooleanInput value={renderSettingsComponent.useSimpleMaterial} onChange={onChangeUseSimpleMaterials} />
      </InputGroup>
      <InputGroup
        name="LODs"
        label={props.t('editor:properties.scene.lbl-lods')}
        info={props.t('editor:properties.scene.info-lods')}
      >
        <Vector3Input
          hideLabels
          value={renderSettingsComponent.LODs}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={onChangeLODs}
        />
      </InputGroup>
      <InputGroup name="Override Renderer Settings" label={props.t('editor:properties.scene.lbl-rendererSettings')}>
        <BooleanInput
          value={renderSettingsComponent.overrideRendererSettings}
          onChange={onChangeOverrideRendererettings}
        />
      </InputGroup>
      {renderSettingsComponent.overrideRendererSettings && (
        <>
          <InputGroup
            name="Use Cascading Shadow Maps"
            label={props.t('editor:properties.scene.lbl-csm')}
            info={props.t('editor:properties.scene.info-csm')}
          >
            <BooleanInput value={renderSettingsComponent.csm} onChange={onChangeUseCSM} />
          </InputGroup>
          <InputGroup
            name="Tone Mapping"
            label={props.t('editor:properties.scene.lbl-toneMapping')}
            info={props.t('editor:properties.scene.info-toneMapping')}
          >
            <SelectInput
              options={ToneMappingOptions}
              value={renderSettingsComponent.toneMapping}
              onChange={onChangeUseToneMapping}
            />
          </InputGroup>
          <InputGroup
            name="Tone Mapping Exposure"
            label={props.t('editor:properties.scene.lbl-toneMappingExposure')}
            info={props.t('editor:properties.scene.info-toneMappingExposure')}
          >
            <CompoundNumericInput
              min={0}
              max={10}
              step={0.1}
              value={renderSettingsComponent.toneMappingExposure}
              onChange={onChangeUseToneMappingExposure}
            />
          </InputGroup>
          <InputGroup
            name="Shadow Map Type"
            label={props.t('editor:properties.scene.lbl-shadowMapType')}
            info={props.t('editor:properties.scene.info-shadowMapType')}
          >
            <SelectInput
              options={ShadowTypeOptions}
              value={renderSettingsComponent.shadowMapType}
              onChange={onChangeUseShadowMapType}
            />
          </InputGroup>
        </>
      )}
    </NodeEditor>
  )
}

export default withTranslation()(RenderSettingsEditor)
