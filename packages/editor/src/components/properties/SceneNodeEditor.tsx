import LanguageIcon from '@mui/icons-material/Language'
import { DistanceModelOptions, DistanceModelType } from '@xrengine/engine/src/scene/classes/AudioSource'
import { FogType } from '@xrengine/engine/src/scene/constants/FogType'
import { EnvMapSourceType, EnvMapTextureType } from '@xrengine/engine/src/scene/constants/EnvMapEnum'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ACESFilmicToneMapping,
  BasicShadowMap,
  CineonToneMapping,
  LinearToneMapping,
  NoToneMapping,
  PCFShadowMap,
  PCFSoftShadowMap,
  ReinhardToneMapping,
  VSMShadowMap
} from 'three'
import BooleanInput from '../inputs/BooleanInput'
import StringInput from '../inputs/StringInput'
import ColorInput from '../inputs/ColorInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, useSetPropertyOnSelectedEntities } from './Util'
import ImageInput from '../inputs/ImageInput'
import FolderInput from '../inputs/FolderInput'
import Vector3Input from '../inputs/Vector3Input'
import { CommandManager } from '../../managers/CommandManager'
import { getDirectoryFromUrl } from '@xrengine/common/src/utils/getDirectoryFromUrl'
import { SimpleMaterialTagComponent } from '@xrengine/engine/src/scene/components/SimpleMaterialTagComponent'
import EditorCommands from '../../constants/EditorCommands'
import { TagComponentOperation } from '../../commands/TagComponentCommand'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { MetaDataComponent } from '@xrengine/engine/src/scene/components/MetaDataComponent'
import { EnvmapComponent } from '@xrengine/engine/src/scene/components/EnvmapComponent'
import { FogComponent } from '@xrengine/engine/src/scene/components/FogComponent'
import { PositionalAudioSettingsComponent } from '@xrengine/engine/src/scene/components/AudioSettingsComponent'
import { RenderSettingComponent } from '@xrengine/engine/src/scene/components/RenderSettingComponent'
import { updateMetaData } from '@xrengine/engine/src/scene/functions/loaders/MetaDataFunctions'
import { updateFog } from '@xrengine/engine/src/scene/functions/loaders/FogFunctions'
import { updateEnvMap } from '@xrengine/engine/src/scene/functions/loaders/EnvMapFunctions'
import { updateRenderSetting } from '@xrengine/engine/src/scene/functions/loaders/RenderSettingsFunction'

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
export const SceneNodeEditor: EditorComponentType = (props) => {
  const { node } = props
  const { t } = useTranslation()

  //creating functions to handle the changes in property of node
  // const onChangeBackground = useSetPropertySelected("background");
  const onChangeMetaData = useSetPropertyOnSelectedEntities(MetaDataComponent, updateMetaData, 'meta_data')

  const onChangeFogType = useSetPropertyOnSelectedEntities(FogComponent, updateFog, 'type')
  const onChangeFogColor = useSetPropertyOnSelectedEntities(FogComponent, updateFog, 'color')
  const onChangeFogNearDistance = useSetPropertyOnSelectedEntities(FogComponent, updateFog, 'near')
  const onChangeFogFarDistance = useSetPropertyOnSelectedEntities(FogComponent, updateFog, 'far')
  const onChangeFogDensity = useSetPropertyOnSelectedEntities(FogComponent, updateFog, 'density')

  const onChangeEnvmapSourceType = useSetPropertyOnSelectedEntities(EnvmapComponent, updateEnvMap, 'type')
  const onChangeEnvmapTextureType = useSetPropertyOnSelectedEntities(EnvmapComponent, updateEnvMap, 'envMapTextureType')
  const onChangeEnvmapColorSource = useSetPropertyOnSelectedEntities(EnvmapComponent, updateEnvMap, 'envMapSourceColor')
  const envMapIntensityChanged = useSetPropertyOnSelectedEntities(EnvmapComponent, updateEnvMap, 'envMapIntensity')
  const onChangeEquirectangularURLSource = useSetPropertyOnSelectedEntities(
    EnvmapComponent,
    updateEnvMap,
    'envMapSourceURL'
  )
  const onChangeCubemapURLSource = (value) => {
    const directory = getDirectoryFromUrl(value)
    if (directory !== (node as any).envMapSourceURL) {
      CommandManager.instance.setPropertyOnSelectionEntities({
        component: EnvmapComponent,
        updateFunction: updateEnvMap,
        properties: { envMapSourceURL: directory }
      })
    }
  }

  const onChangeUserPositionalAudio = useSetPropertyOnSelectedEntities(
    PositionalAudioSettingsComponent,
    () => {},
    'usePositionalAudio'
  )
  const onChangeMediaVolume = useSetPropertyOnSelectedEntities(
    PositionalAudioSettingsComponent,
    () => {},
    'mediaVolume'
  )
  const onChangeMediaDistanceModel = useSetPropertyOnSelectedEntities(
    PositionalAudioSettingsComponent,
    () => {},
    'mediaDistanceModel'
  )
  const onChangeMediaRolloffFactor = useSetPropertyOnSelectedEntities(
    PositionalAudioSettingsComponent,
    () => {},
    'mediaRolloffFactor'
  )
  const onChangeMediaRefDistance = useSetPropertyOnSelectedEntities(
    PositionalAudioSettingsComponent,
    () => {},
    'mediaRefDistance'
  )
  const onChangeMediaMaxDistance = useSetPropertyOnSelectedEntities(
    PositionalAudioSettingsComponent,
    () => {},
    'mediaMaxDistance'
  )
  const onChangeMediaConeInnerAngle = useSetPropertyOnSelectedEntities(
    PositionalAudioSettingsComponent,
    () => {},
    'mediaConeInnerAngle'
  )
  const onChangeMediaConeOuterAngle = useSetPropertyOnSelectedEntities(
    PositionalAudioSettingsComponent,
    () => {},
    'mediaConeOuterAngle'
  )
  const onChangeMediaConeOuterGain = useSetPropertyOnSelectedEntities(
    PositionalAudioSettingsComponent,
    () => {},
    'mediaConeOuterGain'
  )
  const onChangeAvatarDistanceModel = useSetPropertyOnSelectedEntities(
    PositionalAudioSettingsComponent,
    () => {},
    'avatarDistanceModel'
  )
  const onChangeAvatarRolloffFactor = useSetPropertyOnSelectedEntities(
    PositionalAudioSettingsComponent,
    () => {},
    'avatarRolloffFactor'
  )
  const onChangeAvatarRefDistance = useSetPropertyOnSelectedEntities(
    PositionalAudioSettingsComponent,
    () => {},
    'avatarRefDistance'
  )
  const onChangeAvatarMaxDistance = useSetPropertyOnSelectedEntities(
    PositionalAudioSettingsComponent,
    () => {},
    'avatarMaxDistance'
  )

  const onChangeUseSimpleMaterials = useCallback((value) => {
    CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.TAG_COMPONENT, {
      operation: {
        component: SimpleMaterialTagComponent,
        type: value ? TagComponentOperation.ADD : TagComponentOperation.REMOVE
      }
    })
  }, [])

  const onChangeOverrideRendererettings = useSetPropertyOnSelectedEntities(
    RenderSettingComponent,
    updateRenderSetting,
    'overrideRendererSettings'
  )
  const onChangeLODs = useSetPropertyOnSelectedEntities(RenderSettingComponent, updateRenderSetting, 'LODs')
  const onChangeUseCSM = useSetPropertyOnSelectedEntities(RenderSettingComponent, updateRenderSetting, 'csm')
  const onChangeUseToneMapping = useSetPropertyOnSelectedEntities(
    RenderSettingComponent,
    updateRenderSetting,
    'toneMapping'
  )
  const onChangeUseToneMappingExposure = useSetPropertyOnSelectedEntities(
    RenderSettingComponent,
    updateRenderSetting,
    'toneMappingExposure'
  )
  const onChangeUseShadowMapType = useSetPropertyOnSelectedEntities(
    RenderSettingComponent,
    updateRenderSetting,
    'shadowMapType'
  )

  const metadata = getComponent(node.entity, MetaDataComponent)
  const envmapComponent = getComponent(node.entity, EnvmapComponent)
  const fogComponent = getComponent(node.entity, FogComponent)
  const audioComponent = getComponent(node.entity, PositionalAudioSettingsComponent)
  const renderSettingComponent = getComponent(node.entity, RenderSettingComponent)

  // returning editor view for property editor for sceneNode
  return (
    <NodeEditor {...props} description={t('editor:properties.scene.description')}>
      {/* <InputGroup
        name="Background Color"
        label={t('editor:properties.scene.lbl-bgcolor')}
      > */}
      {/* <ColorInput value={node.background} onChange={onChangeBackground} /> */}
      {/* </InputGroup> */}

      <InputGroup name="Metadata" label="Metadata">
        <StringInput value={metadata.meta_data} onChange={onChangeMetaData} />
      </InputGroup>
      <InputGroup name="Envmap Source" label="Envmap Source">
        <SelectInput options={EnvMapSourceOptions} value={envmapComponent.type} onChange={onChangeEnvmapSourceType} />
      </InputGroup>
      {envmapComponent.type === EnvMapSourceType.Color && (
        <InputGroup name="EnvMapColor" label="EnvMap Color">
          <ColorInput value={envmapComponent.envMapSourceColor} onChange={onChangeEnvmapColorSource} />
        </InputGroup>
      )}
      {envmapComponent.type === EnvMapSourceType.Texture && (
        <div>
          <InputGroup name="Texture Type" label="Texture Type">
            <SelectInput
              options={EnvMapTextureOptions}
              value={envmapComponent.envMapTextureType}
              onChange={onChangeEnvmapTextureType}
            />
          </InputGroup>
          <InputGroup name="Texture URL" label="Texture URL">
            {envmapComponent.envMapTextureType === EnvMapTextureType.Cubemap && (
              <FolderInput value={envmapComponent.envMapSourceURL} onChange={onChangeCubemapURLSource} />
            )}
            {envmapComponent.envMapTextureType === EnvMapTextureType.Equirectangular && (
              <ImageInput value={envmapComponent.envMapSourceURL} onChange={onChangeEquirectangularURLSource} />
            )}
            {envmapComponent.errorWhileLoading && <div>Error Loading From URL </div>}
          </InputGroup>
        </div>
      )}

      <InputGroup name="EnvMap Intensity" label="EnvMap Intensity">
        <CompoundNumericInput
          min={0}
          max={20}
          value={envmapComponent.envMapIntensity}
          onChange={envMapIntensityChanged}
        />
      </InputGroup>

      <InputGroup name="Fog Type" label={t('editor:properties.scene.lbl-fogType')}>
        <SelectInput options={FogTypeOptions} value={fogComponent.type} onChange={onChangeFogType} />
      </InputGroup>
      {fogComponent.type !== FogType.Disabled && (
        <InputGroup name="Fog Color" label={t('editor:properties.scene.lbl-fogColor')}>
          <ColorInput value={fogComponent.color} onChange={onChangeFogColor} />
        </InputGroup>
      )}
      {fogComponent.type === FogType.Linear && (
        <>
          <NumericInputGroup
            name="Fog Near Distance"
            label={t('editor:properties.scene.lbl-forNearDistance')}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            min={0}
            value={fogComponent.near}
            onChange={onChangeFogNearDistance}
          />
          <NumericInputGroup
            name="Fog Far Distance"
            label={t('editor:properties.scene.lbl-fogFarDistance')}
            smallStep={1}
            mediumStep={100}
            largeStep={1000}
            min={0}
            value={fogComponent.far}
            onChange={onChangeFogFarDistance}
          />
        </>
      )}
      {fogComponent.type === FogType.Exponential && (
        <NumericInputGroup
          name="Fog Density"
          label={t('editor:properties.scene.lbl-fogDensity')}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={0.25}
          min={0}
          value={fogComponent.density}
          onChange={onChangeFogDensity}
        />
      )}
      <InputGroup name="Override Audio Settings" label={t('editor:properties.scene.lbl-audioSettings')}>
        <BooleanInput value={audioComponent.usePositionalAudio} onChange={onChangeUserPositionalAudio} />
      </InputGroup>
      {audioComponent.usePositionalAudio && (
        <>
          <InputGroup
            name="Avatar Distance Model"
            label={t('editor:properties.scene.lbl-avatarDistanceModel')}
            info={t('editor:properties.scene.info-avatarDistanceModel')}
          >
            <SelectInput
              options={DistanceModelOptions}
              value={audioComponent.avatarDistanceModel}
              onChange={onChangeAvatarDistanceModel}
            />
          </InputGroup>

          {audioComponent.avatarDistanceModel === DistanceModelType.Linear ? (
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
                value={audioComponent.avatarRolloffFactor}
                onChange={onChangeAvatarRolloffFactor}
              />
            </InputGroup>
          ) : (
            <NumericInputGroup
              name="Avatar Rolloff Factor"
              label={t('editor:properties.scene.lbl-avatarRolloffFactor')}
              info={t('editor:properties.scene.info-avatarRolloffFactorInifinity')}
              min={0}
              smallStep={0.1}
              mediumStep={1}
              largeStep={10}
              value={audioComponent.avatarRolloffFactor}
              onChange={onChangeAvatarRolloffFactor}
            />
          )}
          <NumericInputGroup
            name="Avatar Ref Distance"
            label={t('editor:properties.scene.lbl-avatarRefDistance')}
            info={t('editor:properties.scene.info-avatarRefDistance')}
            min={0}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioComponent.avatarRefDistance}
            onChange={onChangeAvatarRefDistance}
            unit="m"
          />
          <NumericInputGroup
            name="Avatar Max Distance"
            label={t('editor:properties.scene.lbl-avatarMaxDistance')}
            info={t('editor:properties.scene.info-avatarMaxDistance')}
            min={0}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioComponent.avatarMaxDistance}
            onChange={onChangeAvatarMaxDistance}
            unit="m"
          />
          <InputGroup name="Media Volume" label={t('editor:properties.scene.lbl-mediaVolume')}>
            <CompoundNumericInput value={audioComponent.mediaVolume} onChange={onChangeMediaVolume} />
          </InputGroup>
          <InputGroup
            name="Media Distance Model"
            label={t('editor:properties.scene.lbl-mediaDistanceModel')}
            info={t('editor:properties.scene.info-mediaDistanceModel')}
          >
            <SelectInput
              options={DistanceModelOptions}
              value={audioComponent.mediaDistanceModel}
              onChange={onChangeMediaDistanceModel}
            />
          </InputGroup>

          {audioComponent.mediaDistanceModel === DistanceModelType.Linear ? (
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
                value={audioComponent.mediaRolloffFactor}
                onChange={onChangeMediaRolloffFactor}
              />
            </InputGroup>
          ) : (
            <NumericInputGroup
              name="Media Rolloff Factor"
              label={t('editor:properties.scene.lbl-mediaRolloffFactor')}
              info={t('editor:properties.scene.info-mediaRolloffFactorInfinity')}
              min={0}
              smallStep={0.1}
              mediumStep={1}
              largeStep={10}
              value={audioComponent.mediaRolloffFactor}
              onChange={onChangeMediaRolloffFactor}
            />
          )}
          <NumericInputGroup
            name="Media Ref Distance"
            label={t('editor:properties.scene.lbl-mediaRefDistance')}
            info={t('editor:properties.scene.info-mediaRefDistance')}
            min={0}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioComponent.mediaRefDistance}
            onChange={onChangeMediaRefDistance}
            unit="m"
          />
          <NumericInputGroup
            name="Media Max Distance"
            label={t('editor:properties.scene.lbl-mediaMaxDistance')}
            info={t('editor:properties.scene.info-mediaMaxDistance')}
            min={0}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioComponent.mediaMaxDistance}
            onChange={onChangeMediaMaxDistance}
            unit="m"
          />
          <NumericInputGroup
            name="Media Cone Inner Angle"
            label={t('editor:properties.scene.lbl-mediaConeInnerAngle')}
            info={t('editor:properties.scene.info-mediaConeInnerAngle')}
            min={0}
            max={360}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioComponent.mediaConeInnerAngle}
            onChange={onChangeMediaConeInnerAngle}
            unit="°"
          />
          <NumericInputGroup
            name="Media Cone Outer Angle"
            label={t('editor:properties.scene.lbl-mediaConeOuterAngle')}
            info={t('editor:properties.scene.info-mediaConeOuterAngle')}
            min={0}
            max={360}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioComponent.mediaConeOuterAngle}
            onChange={onChangeMediaConeOuterAngle}
            unit="°"
          />
          <InputGroup
            name="Media Cone Outer Gain"
            label={t('editor:properties.scene.lbl-mediaConeOuterGain')}
            info={t('editor:properties.scene.info-mediaConeOuterGain')}
          >
            <CompoundNumericInput
              min={0}
              max={1}
              step={0.01}
              value={audioComponent.mediaConeOuterGain}
              onChange={onChangeMediaConeOuterGain}
            />
          </InputGroup>
        </>
      )}
      <InputGroup
        name="Use Simple Materials"
        label={t('editor:properties.scene.lbl-simpleMaterials')}
        info={t('editor:properties.scene.info-simpleMaterials')}
      >
        <BooleanInput
          value={hasComponent(node.entity, SimpleMaterialTagComponent)}
          onChange={onChangeUseSimpleMaterials}
        />
      </InputGroup>
      <InputGroup
        name="LODs"
        label={t('editor:properties.scene.lbl-lods')}
        info={t('editor:properties.scene.info-lods')}
      >
        <Vector3Input
          hideLabels
          value={renderSettingComponent.LODs}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={onChangeLODs}
        />
      </InputGroup>
      <InputGroup name="Override Renderer Settings" label={t('editor:properties.scene.lbl-rendererSettings')}>
        <BooleanInput
          value={renderSettingComponent.overrideRendererSettings}
          onChange={onChangeOverrideRendererettings}
        />
      </InputGroup>
      {renderSettingComponent.overrideRendererSettings && (
        <>
          <InputGroup
            name="Use Cascading Shadow Maps"
            label={t('editor:properties.scene.lbl-csm')}
            info={t('editor:properties.scene.info-csm')}
          >
            <BooleanInput value={renderSettingComponent.csm} onChange={onChangeUseCSM} />
          </InputGroup>
          <InputGroup
            name="Tone Mapping"
            label={t('editor:properties.scene.lbl-toneMapping')}
            info={t('editor:properties.scene.info-toneMapping')}
          >
            <SelectInput
              options={ToneMappingOptions}
              value={renderSettingComponent.toneMapping}
              onChange={onChangeUseToneMapping}
            />
          </InputGroup>
          <InputGroup
            name="Tone Mapping Exposure"
            label={t('editor:properties.scene.lbl-toneMappingExposure')}
            info={t('editor:properties.scene.info-toneMappingExposure')}
          >
            <CompoundNumericInput
              min={0}
              max={10}
              step={0.1}
              value={renderSettingComponent.toneMappingExposure}
              onChange={onChangeUseToneMappingExposure}
            />
          </InputGroup>
          <InputGroup
            name="Tone Mapping Exposure"
            label={t('editor:properties.scene.lbl-shadowMapType')}
            info={t('editor:properties.scene.info-shadowMapType')}
          >
            <SelectInput
              options={ShadowTypeOptions}
              value={renderSettingComponent.shadowMapType}
              onChange={onChangeUseShadowMapType}
            />
          </InputGroup>
        </>
      )}
    </NodeEditor>
  )
}

// setting icon component with icon name
SceneNodeEditor.iconComponent = LanguageIcon

export default SceneNodeEditor
