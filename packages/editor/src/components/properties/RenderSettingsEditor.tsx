import React from 'react'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { withTranslation } from 'react-i18next'
import { RenderSettingsComponent } from '@xrengine/engine/src/scene/components/RenderSettingsComponent'
import Vector3Input from '../inputs/Vector3Input'
import BooleanInput from '../inputs/BooleanInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import { NoToneMapping, LinearToneMapping, ReinhardToneMapping, CineonToneMapping, ACESFilmicToneMapping, BasicShadowMap, PCFShadowMap, PCFSoftShadowMap, VSMShadowMap } from 'three'


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
export class RenderSettingsEditor extends React.Component<{node: any, t: Function}> {
  onChangeUseSimpleMaterials = (useSimpleMaterial) => {
    const renderSettingsComponent = getComponent(this.props.node.eid, RenderSettingsComponent)
    renderSettingsComponent.useSimpleMaterial = useSimpleMaterial
    this.forceUpdate()
  }

  onChangeLODs = (LODs) => {
    const renderSettingsComponent = getComponent(this.props.node.eid, RenderSettingsComponent)
    renderSettingsComponent.LODs = LODs
    this.forceUpdate()
  }

  onChangeOverrideRendererettings = (overrideRendererSettings) => {
    const renderSettingsComponent = getComponent(this.props.node.eid, RenderSettingsComponent)
    renderSettingsComponent.overrideRendererSettings = overrideRendererSettings
    this.forceUpdate()
  }

  onChangeUseCSM = (csm) => {
    const renderSettingsComponent = getComponent(this.props.node.eid, RenderSettingsComponent)
    renderSettingsComponent.csm = csm
    this.forceUpdate()
  }

  onChangeUseToneMapping = (toneMapping) => {
    const renderSettingsComponent = getComponent(this.props.node.eid, RenderSettingsComponent)
    renderSettingsComponent.toneMapping = toneMapping
    this.forceUpdate()
  }

  onChangeUseToneMappingExposure = (toneMappingExposure) => {
    const renderSettingsComponent = getComponent(this.props.node.eid, RenderSettingsComponent)
    renderSettingsComponent.toneMappingExposure = toneMappingExposure
    this.forceUpdate()
  }

  onChangeUseShadowMapType = (shadowMapType) => {
    const renderSettingsComponent = getComponent(this.props.node.eid, RenderSettingsComponent)
    renderSettingsComponent.shadowMapType = shadowMapType
    this.forceUpdate()
  }

  render() {
    const renderSettingsComponent = getComponent(this.props.node.eid, RenderSettingsComponent)

    return (
      <NodeEditor {...this.props}>
        <InputGroup
          name="Use Simple Materials"
          label={this.props.t('editor:properties.scene.lbl-simpleMaterials')}
          info={this.props.t('editor:properties.scene.info-simpleMaterials')}
        >
          <BooleanInput value={renderSettingsComponent.useSimpleMaterial} onChange={this.onChangeUseSimpleMaterials} />
        </InputGroup>
        <InputGroup
          name="LODs"
          label={this.props.t('editor:properties.scene.lbl-lods')}
          info={this.props.t('editor:properties.scene.info-lods')}
        >
          <Vector3Input
            hideLabels
            value={renderSettingsComponent.LODs}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            onChange={this.onChangeLODs}
          />
        </InputGroup>
        <InputGroup name="Override Renderer Settings" label={this.props.t('editor:properties.scene.lbl-rendererSettings')}>
          <BooleanInput value={renderSettingsComponent.overrideRendererSettings} onChange={this.onChangeOverrideRendererettings} />
        </InputGroup>
        {renderSettingsComponent.overrideRendererSettings && (
          <>
            <InputGroup
              name="Use Cascading Shadow Maps"
              label={this.props.t('editor:properties.scene.lbl-csm')}
              info={this.props.t('editor:properties.scene.info-csm')}
            >
              <BooleanInput value={renderSettingsComponent.csm} onChange={this.onChangeUseCSM} />
            </InputGroup>
            <InputGroup
              name="Tone Mapping"
              label={this.props.t('editor:properties.scene.lbl-toneMapping')}
              info={this.props.t('editor:properties.scene.info-toneMapping')}
            >
              <SelectInput options={ToneMappingOptions} value={renderSettingsComponent.toneMapping} onChange={this.onChangeUseToneMapping} />
            </InputGroup>
            <InputGroup
              name="Tone Mapping Exposure"
              label={this.props.t('editor:properties.scene.lbl-toneMappingExposure')}
              info={this.props.t('editor:properties.scene.info-toneMappingExposure')}
            >
              <CompoundNumericInput
                min={0}
                max={10}
                step={0.1}
                value={renderSettingsComponent.toneMappingExposure}
                onChange={this.onChangeUseToneMappingExposure}
              />
            </InputGroup>
            <InputGroup
              name="Shadow Map Type"
              label={this.props.t('editor:properties.scene.lbl-shadowMapType')}
              info={this.props.t('editor:properties.scene.info-shadowMapType')}
            >
              <SelectInput options={ShadowTypeOptions} value={renderSettingsComponent.shadowMapType} onChange={this.onChangeUseShadowMapType} />
            </InputGroup>
          </>
        )}
      </NodeEditor>
    )
  }
}

export default withTranslation()(RenderSettingsEditor)
