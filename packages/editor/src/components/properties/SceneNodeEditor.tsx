import LanguageIcon from '@mui/icons-material/Language'
import { DistanceModelOptions, DistanceModelType } from '@xrengine/engine/src/scene/classes/AudioSource'
import { FogType } from '@xrengine/engine/src/scene/constants/FogType'
import { EnvMapSourceType, EnvMapTextureType } from '@xrengine/engine/src/scene/constants/EnvMapEnum'
import i18n from 'i18next'
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
import StringInput from '../inputs/StringInput'
import ColorInput from '../inputs/ColorInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import useSetPropertySelected from './useSetPropertySelected'
import ImageInput from '../inputs/ImageInput'
import FolderInput from '../inputs/FolderInput'
import serializeColor from '../../functions/serializeColor'
import SceneNode from '../../nodes/SceneNode'
import Vector3Input from '../inputs/Vector3Input'
import { CommandManager } from '../../managers/CommandManager'
import { getDirectoryFromUrl } from '@xrengine/common/src/utils/getDirectoryFromUrl'

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
  const { node } = props
  const { t } = useTranslation()

  SceneNodeEditor.description = t('editor:properties.scene.description')
  //creating functions to handle the changes in property of node
  // const onChangeBackground = useSetPropertySelected("background");
  const onChangeMetaData = useSetPropertySelected('meta_data')
  const onChangeFogType = useSetPropertySelected('fogType')
  const onChangeFogColor = useSetPropertySelected('fogColor')
  const onChangeFogNearDistance = useSetPropertySelected('fogNearDistance')
  const onChangeFogFarDistance = useSetPropertySelected('fogFarDistance')
  const onChangeFogDensity = useSetPropertySelected('fogDensity')

  const onChangeEnvmapSourceType = useSetPropertySelected('envMapSourceType')
  const onChangeEnvmapTextureType = useSetPropertySelected('envMapTextureType')
  const onChangeEnvmapColorSource = (value) => {
    const colorString = serializeColor(value)
    CommandManager.instance.setPropertyOnSelection('envMapSourceColor', colorString)
  }
  const onChangeEquirectangularURLSource = useSetPropertySelected('envMapSourceURL')
  const onChangeCubemapURLSource = (value) => {
    const directory = getDirectoryFromUrl(value)
    if (directory !== (node as any).envMapSourceURL) {
      CommandManager.instance.setPropertyOnSelection('envMapSourceURL', directory)
    }
  }

  const onChangeUserPositionalAudio = useSetPropertySelected('usePositionalAudio')
  const onChangeMediaVolume = useSetPropertySelected('mediaVolume')
  const onChangeMediaDistanceModel = useSetPropertySelected('mediaDistanceModel')
  const onChangeMediaRolloffFactor = useSetPropertySelected('mediaRolloffFactor')
  const onChangeMediaRefDistance = useSetPropertySelected('mediaRefDistance')
  const onChangeMediaMaxDistance = useSetPropertySelected('mediaMaxDistance')
  const onChangeMediaConeInnerAngle = useSetPropertySelected('mediaConeInnerAngle')
  const onChangeMediaConeOuterAngle = useSetPropertySelected('mediaConeOuterAngle')
  const onChangeMediaConeOuterGain = useSetPropertySelected('mediaConeOuterGain')
  const onChangeAvatarDistanceModel = useSetPropertySelected('avatarDistanceModel')
  const onChangeAvatarRolloffFactor = useSetPropertySelected('avatarRolloffFactor')
  const onChangeAvatarRefDistance = useSetPropertySelected('avatarRefDistance')
  const onChangeAvatarMaxDistance = useSetPropertySelected('avatarMaxDistance')

  const onChangeUseSimpleMaterials = useSetPropertySelected('simpleMaterials')
  const onChangeOverrideRendererettings = useSetPropertySelected('overrideRendererSettings')
  const onChangeLODs = useSetPropertySelected('LODs')
  const onChangeUseCSM = useSetPropertySelected('csm')
  const onChangeUseToneMapping = useSetPropertySelected('toneMapping')
  const onChangeUseToneMappingExposure = useSetPropertySelected('toneMappingExposure')
  const onChangeUseShadowMapType = useSetPropertySelected('shadowMapType')
  const envMapIntensityChanged = useSetPropertySelected('envMapIntensity')

  // returning editor view for property editor for sceneNode
  return (
    <NodeEditor {...props} description={SceneNodeEditor.description}>
      {/* <InputGroup
        name="Background Color"
        label={t('editor:properties.scene.lbl-bgcolor')}
      > */}
      {/* <ColorInput value={node.background} onChange={onChangeBackground} /> */}
      {/* </InputGroup> */}

      <InputGroup name="Metadata" label="Metadata">
        <StringInput value={node.meta_data} onChange={onChangeMetaData} />
      </InputGroup>
      <InputGroup name="Envmap Source" label="Envmap Source">
        <SelectInput options={EnvMapSourceOptions} value={node.envMapSourceType} onChange={onChangeEnvmapSourceType} />
      </InputGroup>
      {node.envMapSourceType === EnvMapSourceType.Color && (
        <InputGroup name="EnvMapColor" label="EnvMap Color">
          <ColorInput value={new Color(node.envMapSourceColor)} onChange={onChangeEnvmapColorSource} />
        </InputGroup>
      )}
      {node.envMapSourceType === EnvMapSourceType.Texture && (
        <div>
          <InputGroup name="Texture Type" label="Texture Type">
            <SelectInput
              options={EnvMapTextureOptions}
              value={node.envMapTextureType}
              onChange={onChangeEnvmapTextureType}
            />
          </InputGroup>
          <InputGroup name="Texture URL" label="Texture URL">
            {node.envMapTextureType === EnvMapTextureType.Cubemap && (
              <FolderInput value={node.envMapSourceURL} onChange={onChangeCubemapURLSource} />
            )}
            {node.envMapTextureType === EnvMapTextureType.Equirectangular && (
              <ImageInput value={node.envMapSourceURL} onChange={onChangeEquirectangularURLSource} />
            )}
            {(props.node as SceneNode).errorInEnvmapURL && <div>Error Loading From URL </div>}
          </InputGroup>
        </div>
      )}

      <InputGroup name="EnvMap Intensity" label="EnvMap Intensity">
        <CompoundNumericInput min={0} max={20} value={node.envMapIntensity} onChange={envMapIntensityChanged} />
      </InputGroup>

      <InputGroup name="Fog Type" label={t('editor:properties.scene.lbl-fogType')}>
        <SelectInput options={FogTypeOptions} value={node.fogType} onChange={onChangeFogType} />
      </InputGroup>
      {node.fogType !== FogType.Disabled && (
        <InputGroup name="Fog Color" label={t('editor:properties.scene.lbl-fogColor')}>
          <ColorInput value={node.fogColor} onChange={onChangeFogColor} />
        </InputGroup>
      )}
      {node.fogType === FogType.Linear && (
        <>
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
      <InputGroup name="Override Audio Settings" label={t('editor:properties.scene.lbl-audioSettings')}>
        <BooleanInput value={node.usePositionalAudio} onChange={onChangeUserPositionalAudio} />
      </InputGroup>
      {node.usePositionalAudio && (
        <>
          <InputGroup
            name="Avatar Distance Model"
            label={t('editor:properties.scene.lbl-avatarDistanceModel')}
            info={t('editor:properties.scene.info-avatarDistanceModel')}
          >
            <SelectInput
              options={DistanceModelOptions}
              value={node.avatarDistanceModel}
              onChange={onChangeAvatarDistanceModel}
            />
          </InputGroup>

          {node.avatarDistanceModel === DistanceModelType.Linear ? (
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
          <InputGroup name="Media Volume" label={t('editor:properties.scene.lbl-mediaVolume')}>
            <CompoundNumericInput value={node.mediaVolume} onChange={onChangeMediaVolume} />
          </InputGroup>
          <InputGroup
            name="Media Distance Model"
            label={t('editor:properties.scene.lbl-mediaDistanceModel')}
            info={t('editor:properties.scene.info-mediaDistanceModel')}
          >
            <SelectInput
              options={DistanceModelOptions}
              value={node.mediaDistanceModel}
              onChange={onChangeMediaDistanceModel}
            />
          </InputGroup>

          {node.mediaDistanceModel === DistanceModelType.Linear ? (
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
      <InputGroup
        name="Use Simple Materials"
        label={t('editor:properties.scene.lbl-simpleMaterials')}
        info={t('editor:properties.scene.info-simpleMaterials')}
      >
        <BooleanInput value={node.simpleMaterials} onChange={onChangeUseSimpleMaterials} />
      </InputGroup>
      <InputGroup
        name="LODs"
        label={t('editor:properties.scene.lbl-lods')}
        info={t('editor:properties.scene.info-lods')}
      >
        <Vector3Input
          hideLabels
          value={node.LODs}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={onChangeLODs}
        />
      </InputGroup>
      <InputGroup name="Override Renderer Settings" label={t('editor:properties.scene.lbl-rendererSettings')}>
        <BooleanInput value={node.overrideRendererSettings} onChange={onChangeOverrideRendererettings} />
      </InputGroup>
      {node.overrideRendererSettings && (
        <>
          <InputGroup
            name="Use Cascading Shadow Maps"
            label={t('editor:properties.scene.lbl-csm')}
            info={t('editor:properties.scene.info-csm')}
          >
            <BooleanInput value={node.csm} onChange={onChangeUseCSM} />
          </InputGroup>
          <InputGroup
            name="Tone Mapping"
            label={t('editor:properties.scene.lbl-toneMapping')}
            info={t('editor:properties.scene.info-toneMapping')}
          >
            <SelectInput options={ToneMappingOptions} value={node.toneMapping} onChange={onChangeUseToneMapping} />
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
              value={node.toneMappingExposure}
              onChange={onChangeUseToneMappingExposure}
            />
          </InputGroup>
          <InputGroup
            name="Tone Mapping Exposure"
            label={t('editor:properties.scene.lbl-shadowMapType')}
            info={t('editor:properties.scene.info-shadowMapType')}
          >
            <SelectInput options={ShadowTypeOptions} value={node.shadowMapType} onChange={onChangeUseShadowMapType} />
          </InputGroup>
        </>
      )}
    </NodeEditor>
  )
}

// setting icon component with icon name
SceneNodeEditor.iconComponent = LanguageIcon

// setting description and will appear on editor view
SceneNodeEditor.description = i18n.t('editor:properties.scene.description')
export default SceneNodeEditor
