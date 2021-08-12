import { Globe } from '@styled-icons/fa-solid/Globe'
import { DistanceModelOptions, DistanceModelType } from '@xrengine/engine/src/scene/classes/AudioSource'
import { FogType } from '@xrengine/engine/src/scene/constants/FogType'
import { EnvMapSourceType, EnvMapTextureType } from '@xrengine/engine/src/scene/constants/EnvMapEnum'
import i18n from 'i18next'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ACESFilmicToneMapping,
  BasicShadowMap,
  CineonToneMapping,
  Color,
  LinearToneMapping,
  NoToneMapping,
  PCFShadowMap,
  PCFSoftShadowMap,
  ReinhardToneMapping,
  VSMShadowMap
} from 'three'
import BooleanInput from '../inputs/BooleanInput'
import ColorInput from '../inputs/ColorInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import useSetPropertySelected from './useSetPropertySelected'
import ImageInput from '../inputs/ImageInput'
import serializeColor from '@xrengine/engine/src/editor/functions/serializeColor'
import SceneNode from '@xrengine/engine/src/editor/nodes/SceneNode'
import Vector3Input from '../inputs/Vector3Input'

/**
 * EnvMapSourceOptions array containing SourceOptions for Envmap
 */
const EnvMapSourceOptions = [
  {
    label: 'Default',
    value: EnvMapSourceType.Default
  },
  {
    label: 'Texture',
    value: EnvMapSourceType.Texture
  },
  {
    label: 'Color',
    value: EnvMapSourceType.Color
  }
]

/**
 * EnvMapSourceOptions array containing SourceOptions for Envmap
 */
const EnvMapTextureOptions = [
  {
    label: 'Cubemap',
    value: EnvMapTextureType.Cubemap
  },
  {
    label: 'Equirectangular',
    value: EnvMapTextureType.Equirectangular
  }
]

/**
 * FogTypeOptions array containing fogType options.
 *
 * @author Robert Long
 * @type {Array}
 */
const FogTypeOptions = [
  {
    label: 'Disabled',
    value: FogType.Disabled
  },
  {
    label: 'Linear',
    value: FogType.Linear
  },
  {
    label: 'Exponential',
    value: FogType.Exponential
  }
]

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
export function SceneNodeEditor(props) {
  const { editor, node } = props
  const { t } = useTranslation()

  SceneNodeEditor.description = t('editor:properties.scene.description')
  //creating functions to handle the changes in property of node
  // const onChangeBackground = useSetPropertySelected(editor, "background");
  const onChangeFogType = useSetPropertySelected(editor, 'fogType')
  const onChangeFogColor = useSetPropertySelected(editor, 'fogColor')
  const onChangeFogNearDistance = useSetPropertySelected(editor, 'fogNearDistance')
  const onChangeFogFarDistance = useSetPropertySelected(editor, 'fogFarDistance')
  const onChangeFogDensity = useSetPropertySelected(editor, 'fogDensity')

  const onChangeEnvmapSourceType = useSetPropertySelected(editor, 'envMapSourceType')
  const onChangeEnvmapTextureType = useSetPropertySelected(editor, 'envMapTextureType')
  const onChangeEnvmapColorSource = (value) => {
    const colorString = serializeColor(value)
    ;(props.editor as any).setPropertySelected('envMapSourceColor', colorString)
  }
  const onChangeEnvmapURLSource = useSetPropertySelected(editor, 'envMapSourceURL')

  const onChangeUserPositionalAudio = useSetPropertySelected(editor, 'usePositionalAudio')
  const onChangeMediaVolume = useSetPropertySelected(editor, 'mediaVolume')
  const onChangeMediaDistanceModel = useSetPropertySelected(editor, 'mediaDistanceModel')
  const onChangeMediaRolloffFactor = useSetPropertySelected(editor, 'mediaRolloffFactor')
  const onChangeMediaRefDistance = useSetPropertySelected(editor, 'mediaRefDistance')
  const onChangeMediaMaxDistance = useSetPropertySelected(editor, 'mediaMaxDistance')
  const onChangeMediaConeInnerAngle = useSetPropertySelected(editor, 'mediaConeInnerAngle')
  const onChangeMediaConeOuterAngle = useSetPropertySelected(editor, 'mediaConeOuterAngle')
  const onChangeMediaConeOuterGain = useSetPropertySelected(editor, 'mediaConeOuterGain')
  const onChangeAvatarDistanceModel = useSetPropertySelected(editor, 'avatarDistanceModel')
  const onChangeAvatarRolloffFactor = useSetPropertySelected(editor, 'avatarRolloffFactor')
  const onChangeAvatarRefDistance = useSetPropertySelected(editor, 'avatarRefDistance')
  const onChangeAvatarMaxDistance = useSetPropertySelected(editor, 'avatarMaxDistance')

  const onChangeUseSimpleMaterials = useSetPropertySelected(editor, 'simpleMaterials')
  const onChangeOverrideRendererettings = useSetPropertySelected(editor, 'overrideRendererSettings')
  const onChangeLODs = useSetPropertySelected(editor, 'LODs')
  const onChangeUseCSM = useSetPropertySelected(editor, 'csm')
  const onChangeUseToneMapping = useSetPropertySelected(editor, 'toneMapping')
  const onChangeUseToneMappingExposure = useSetPropertySelected(editor, 'toneMappingExposure')
  const onChangeUseShadowMapType = useSetPropertySelected(editor, 'shadowMapType')
  const envMapIntensityChanged = useSetPropertySelected(editor, 'envMapIntensity')

  // returning editor view for property editor for sceneNode
  return (
    <NodeEditor {...props} description={SceneNodeEditor.description}>
      {/* @ts-ignore */}
      {/* <InputGroup
        name="Background Color"
        label={t('editor:properties.scene.lbl-bgcolor')}
      > */}
      {/* @ts-ignore */}
      {/* <ColorInput value={node.background} onChange={onChangeBackground} /> */}
      {/* </InputGroup> */}

      {/* @ts-ignore */}
      <InputGroup name="Envmap Source" label="Envmap Source">
        {/* @ts-ignore */}
        <SelectInput options={EnvMapSourceOptions} value={node.envMapSourceType} onChange={onChangeEnvmapSourceType} />
      </InputGroup>
      {node.envMapSourceType === EnvMapSourceType.Color && (
        /* @ts-ignore */
        <InputGroup name="EnvMapColor" label="EnvMap Color">
          {/* @ts-ignore */}
          <ColorInput value={new Color(node.envMapSourceColor)} onChange={onChangeEnvmapColorSource} />
        </InputGroup>
      )}
      {node.envMapSourceType === EnvMapSourceType.Texture && (
        <div>
          {/* @ts-ignore */}
          <InputGroup name="Texture Type" label="Texture Type">
            {/* @ts-ignore */}
            <SelectInput
              options={EnvMapTextureOptions}
              value={node.envMapTextureType}
              onChange={onChangeEnvmapTextureType}
            />
          </InputGroup>
          {/* @ts-ignore */}
          <InputGroup name="Texture URL" label="Texture URL">
            <ImageInput value={node.envMapSourceURL} onChange={onChangeEnvmapURLSource} />
            {(props.node as SceneNode).errorInEnvmapURL && <div>Error Loading From URL </div>}
          </InputGroup>
        </div>
      )}

      {/* @ts-ignore */}
      <InputGroup name="EnvMap Intensity" label="EnvMap Intensity">
        {/* @ts-ignore */}
        <CompoundNumericInput min={0} max={20} value={node.envMapIntensity} onChange={envMapIntensityChanged} />
      </InputGroup>

      {/* @ts-ignore */}
      <InputGroup name="Fog Type" label={t('editor:properties.scene.lbl-fogType')}>
        {/* @ts-ignore */}
        <SelectInput options={FogTypeOptions} value={node.fogType} onChange={onChangeFogType} />
      </InputGroup>
      {node.fogType !== FogType.Disabled && (
        /* @ts-ignore */
        <InputGroup name="Fog Color" label={t('editor:properties.scene.lbl-fogColor')}>
          {/* @ts-ignore */}
          <ColorInput value={node.fogColor} onChange={onChangeFogColor} />
        </InputGroup>
      )}
      {node.fogType === FogType.Linear && (
        <>
          {/* @ts-ignore */}
          <NumericInputGroup
            name="Fog Near Distance"
            label={t('editor:properties.scene.lbl-forNearDistance')}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            min={0}
            value={node.fogNearDistance}
            onChange={onChangeFogNearDistance}
          />
          {/* @ts-ignore */}
          <NumericInputGroup
            name="Fog Far Distance"
            label={t('editor:properties.scene.lbl-fogFarDistance')}
            smallStep={1}
            mediumStep={100}
            largeStep={1000}
            min={0}
            value={node.fogFarDistance}
            onChange={onChangeFogFarDistance}
          />
        </>
      )}
      {node.fogType === FogType.Exponential && (
        /* @ts-ignore */
        <NumericInputGroup
          name="Fog Density"
          label={t('editor:properties.scene.lbl-fogDensity')}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={0.25}
          min={0}
          value={node.fogDensity}
          onChange={onChangeFogDensity}
        />
      )}
      {/* @ts-ignore */}
      <InputGroup name="Override Audio Settings" label={t('editor:properties.scene.lbl-audioSettings')}>
        <BooleanInput value={node.usePositionalAudio} onChange={onChangeUserPositionalAudio} />
      </InputGroup>
      {node.usePositionalAudio && (
        <>
          {/* @ts-ignore */}
          <InputGroup
            name="Avatar Distance Model"
            label={t('editor:properties.scene.lbl-avatarDistanceModel')}
            info={t('editor:properties.scene.info-avatarDistanceModel')}
          >
            {/* @ts-ignore */}
            <SelectInput
              options={DistanceModelOptions}
              value={node.avatarDistanceModel}
              onChange={onChangeAvatarDistanceModel}
            />
          </InputGroup>

          {node.avatarDistanceModel === DistanceModelType.Linear ? (
            /* @ts-ignore */
            <InputGroup
              name="Avatar Rolloff Factor"
              label={t('editor:properties.scene.lbl-avatarRolloffFactor')}
              info={t('editor:properties.scene.info-avatarRolloffFactor')}
            >
              <CompoundNumericInput
                min={0}
                max={1}
                smallStep={0.001}
                mediumStep={0.01}
                largeStep={0.1}
                value={node.avatarRolloffFactor}
                onChange={onChangeAvatarRolloffFactor}
              />
            </InputGroup>
          ) : (
            /* @ts-ignore */
            <NumericInputGroup
              name="Avatar Rolloff Factor"
              label={t('editor:properties.scene.lbl-avatarRolloffFactor')}
              info={t('editor:properties.scene.info-avatarRolloffFactorInifinity')}
              min={0}
              smallStep={0.1}
              mediumStep={1}
              largeStep={10}
              value={node.avatarRolloffFactor}
              onChange={onChangeAvatarRolloffFactor}
            />
          )}
          {/* @ts-ignore */}
          <NumericInputGroup
            name="Avatar Ref Distance"
            label={t('editor:properties.scene.lbl-avatarRefDistance')}
            info={t('editor:properties.scene.info-avatarRefDistance')}
            min={0}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={node.avatarRefDistance}
            onChange={onChangeAvatarRefDistance}
            unit="m"
          />
          {/* @ts-ignore */}
          <NumericInputGroup
            name="Avatar Max Distance"
            label={t('editor:properties.scene.lbl-avatarMaxDistance')}
            info={t('editor:properties.scene.info-avatarMaxDistance')}
            min={0}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={node.avatarMaxDistance}
            onChange={onChangeAvatarMaxDistance}
            unit="m"
          />
          {/* @ts-ignore */}
          <InputGroup name="Media Volume" label={t('editor:properties.scene.lbl-mediaVolume')}>
            <CompoundNumericInput value={node.mediaVolume} onChange={onChangeMediaVolume} />
          </InputGroup>
          {/* @ts-ignore */}
          <InputGroup
            name="Media Distance Model"
            label={t('editor:properties.scene.lbl-mediaDistanceModel')}
            info={t('editor:properties.scene.info-mediaDistanceModel')}
          >
            {/* @ts-ignore */}
            <SelectInput
              options={DistanceModelOptions}
              value={node.mediaDistanceModel}
              onChange={onChangeMediaDistanceModel}
            />
          </InputGroup>

          {node.mediaDistanceModel === DistanceModelType.Linear ? (
            /* @ts-ignore */
            <InputGroup
              name="Media Rolloff Factor"
              label={t('editor:properties.scene.lbl-mediaRolloffFactor')}
              info={t('editor:properties.scene.info-mediaRolloffFactor')}
            >
              <CompoundNumericInput
                min={0}
                max={1}
                smallStep={0.001}
                mediumStep={0.01}
                largeStep={0.1}
                value={node.mediaRolloffFactor}
                onChange={onChangeMediaRolloffFactor}
              />
            </InputGroup>
          ) : (
            /* @ts-ignore */
            <NumericInputGroup
              name="Media Rolloff Factor"
              label={t('editor:properties.scene.lbl-mediaRolloffFactor')}
              info={t('editor:properties.scene.info-mediaRolloffFactorInfinity')}
              min={0}
              smallStep={0.1}
              mediumStep={1}
              largeStep={10}
              value={node.mediaRolloffFactor}
              onChange={onChangeMediaRolloffFactor}
            />
          )}
          {/* @ts-ignore */}
          <NumericInputGroup
            name="Media Ref Distance"
            label={t('editor:properties.scene.lbl-mediaRefDistance')}
            info={t('editor:properties.scene.info-mediaRefDistance')}
            min={0}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={node.mediaRefDistance}
            onChange={onChangeMediaRefDistance}
            unit="m"
          />
          {/* @ts-ignore */}
          <NumericInputGroup
            name="Media Max Distance"
            label={t('editor:properties.scene.lbl-mediaMaxDistance')}
            info={t('editor:properties.scene.info-mediaMaxDistance')}
            min={0}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={node.mediaMaxDistance}
            onChange={onChangeMediaMaxDistance}
            unit="m"
          />
          {/* @ts-ignore */}
          <NumericInputGroup
            name="Media Cone Inner Angle"
            label={t('editor:properties.scene.lbl-mediaConeInnerAngle')}
            info={t('editor:properties.scene.info-mediaConeInnerAngle')}
            min={0}
            max={360}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={node.mediaConeInnerAngle}
            onChange={onChangeMediaConeInnerAngle}
            unit="°"
          />
          {/* @ts-ignore */}
          <NumericInputGroup
            name="Media Cone Outer Angle"
            label={t('editor:properties.scene.lbl-mediaConeOuterAngle')}
            info={t('editor:properties.scene.info-mediaConeOuterAngle')}
            min={0}
            max={360}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={node.mediaConeOuterAngle}
            onChange={onChangeMediaConeOuterAngle}
            unit="°"
          />
          {/* @ts-ignore */}
          <InputGroup
            name="Media Cone Outer Gain"
            label={t('editor:properties.scene.lbl-mediaConeOuterGain')}
            info={t('editor:properties.scene.info-mediaConeOuterGain')}
          >
            <CompoundNumericInput
              min={0}
              max={1}
              step={0.01}
              value={node.mediaConeOuterGain}
              onChange={onChangeMediaConeOuterGain}
            />
          </InputGroup>
        </>
      )}
      {/* @ts-ignore */}
      <InputGroup
        name="Use Simple Materials"
        label={t('editor:properties.scene.lbl-simpleMaterials')}
        info={t('editor:properties.scene.info-simpleMaterials')}
      >
        <BooleanInput value={node.simpleMaterials} onChange={onChangeUseSimpleMaterials} />
      </InputGroup>
      {/* @ts-ignore */}
      <InputGroup
        name="LODs"
        label={t('editor:properties.scene.lbl-lods')}
        info={t('editor:properties.scene.info-lods')}
      >
        {/* @ts-ignore */}
        <Vector3Input
          hideLabels={true}
          value={node.LODs}
          /* @ts-ignore */
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={onChangeLODs}
        />
      </InputGroup>
      {/* @ts-ignore */}
      <InputGroup name="Override Renderer Settings" label={t('editor:properties.scene.lbl-rendererSettings')}>
        <BooleanInput value={node.overrideRendererSettings} onChange={onChangeOverrideRendererettings} />
      </InputGroup>
      {node.overrideRendererSettings && (
        <>
          {/* @ts-ignore */}
          <InputGroup
            name="Use Cascading Shadow Maps"
            label={t('editor:properties.scene.lbl-csm')}
            info={t('editor:properties.scene.info-csm')}
          >
            <BooleanInput value={node.csm} onChange={onChangeUseCSM} />
          </InputGroup>
          {/* @ts-ignore */}
          <InputGroup
            name="Tone Mapping"
            label={t('editor:properties.scene.lbl-toneMapping')}
            info={t('editor:properties.scene.info-toneMapping')}
          >
            {/* @ts-ignore */}
            <SelectInput options={ToneMappingOptions} value={node.toneMapping} onChange={onChangeUseToneMapping} />
          </InputGroup>
          {/* @ts-ignore */}
          <InputGroup
            name="Tone Mapping Exposure"
            label={t('editor:properties.scene.lbl-toneMappingExposure')}
            info={t('editor:properties.scene.info-toneMappingExposure')}
          >
            <CompoundNumericInput
              min={0}
              max={10}
              step={0.1}
              value={node.toneMappingExposure}
              onChange={onChangeUseToneMappingExposure}
            />
          </InputGroup>
          {/* @ts-ignore */}
          <InputGroup
            name="Tone Mapping Exposure"
            label={t('editor:properties.scene.lbl-shadowMapType')}
            info={t('editor:properties.scene.info-shadowMapType')}
          >
            {/* @ts-ignore */}
            <SelectInput options={ShadowTypeOptions} value={node.shadowMapType} onChange={onChangeUseShadowMapType} />
          </InputGroup>
        </>
      )}
    </NodeEditor>
  )
}

// declairing property types for sceneNode
SceneNodeEditor.propTypes = {
  editor: PropTypes.object,
  node: PropTypes.object
}

// setting icon component with icon name
SceneNodeEditor.iconComponent = Globe

// setting description and will appear on editor view
SceneNodeEditor.description = i18n.t('editor:properties.scene.description')
export default SceneNodeEditor
