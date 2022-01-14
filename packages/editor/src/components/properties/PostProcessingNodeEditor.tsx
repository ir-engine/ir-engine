import Checkbox from '@mui/material/Checkbox'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Effects } from '@xrengine/engine/src/scene/constants/PostProcessing'
import { PostprocessingComponent } from '@xrengine/engine/src/scene/components/PostprocessingComponent'
import { updatePostProcessing } from '@xrengine/engine/src/scene/functions/loaders/PostprocessingFunctions'
import React, { ChangeEvent } from 'react'
import LooksIcon from '@mui/icons-material/Looks'
import { CommandManager } from '../../managers/CommandManager'
import BooleanInput from '../inputs/BooleanInput'
import ColorInput from '../inputs/ColorInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'
import { useTranslation } from 'react-i18next'

enum PropertyTypes {
  BlendFunction,
  Number,
  Boolean,
  Color,
  KernelSize
}

type EffectPropertyDetail = { propertyType: PropertyTypes; name: string; min?: number; max?: number; step?: number }
type EffectPropertiesType = { [key: string]: EffectPropertyDetail }
type EffectOptionsType = { [key in Effects]: EffectPropertiesType }

const EffectsOptions: EffectOptionsType = {
  FXAAEffect: {
    blendFunction: { propertyType: PropertyTypes.BlendFunction, name: 'Blend Function' }
  },
  OutlineEffect: {
    blendFunction: { propertyType: PropertyTypes.BlendFunction, name: 'Blend Function' },
    edgeStrength: { propertyType: PropertyTypes.Number, name: 'Edge Strength', min: -1, max: 1, step: 0.01 },
    pulseSpeed: { propertyType: PropertyTypes.Number, name: 'Pulse Speed', min: -1, max: 1, step: 0.01 },
    visibleEdgeColor: { propertyType: PropertyTypes.Color, name: 'Visible Edge Color' },
    hiddenEdgeColor: { propertyType: PropertyTypes.Color, name: 'Hidden Edge Color' },
    resolutionScale: { propertyType: PropertyTypes.Number, name: 'Resolution Scale', min: -1, max: 1, step: 0.01 },
    kernelSize: { propertyType: PropertyTypes.KernelSize, name: 'Kernel Size' },
    blur: { propertyType: PropertyTypes.Boolean, name: 'Blur' },
    xRay: { propertyType: PropertyTypes.Boolean, name: 'XRay' }
  },
  SSAOEffect: {
    blendFunction: { propertyType: PropertyTypes.BlendFunction, name: 'Blend Function' },
    distanceScaling: { propertyType: PropertyTypes.Boolean, name: 'Distance Scaling' },
    depthAwareUpsampling: { propertyType: PropertyTypes.Boolean, name: 'Depth Aware Upsampling' },
    samples: { propertyType: PropertyTypes.Number, name: 'Samples', min: 1, max: 32, step: 1 },
    rings: { propertyType: PropertyTypes.Number, name: 'Rings', min: -1, max: 1, step: 0.01 },

    // Render up to a distance of ~20 world units.
    distanceThreshold: { propertyType: PropertyTypes.Number, name: 'Distance Threshold', min: -1, max: 1, step: 0.01 },

    // with an additional ~2.5 units of falloff.
    distanceFalloff: { propertyType: PropertyTypes.Number, name: 'Distance Falloff', min: -1, max: 1, step: 0.01 },
    minRadiusScale: { propertyType: PropertyTypes.Number, name: 'Min Radius Scale', min: -1, max: 1, step: 0.01 },
    bias: { propertyType: PropertyTypes.Number, name: 'Bias', min: -1, max: 1, step: 0.01 },
    radius: { propertyType: PropertyTypes.Number, name: 'Radius', min: -1, max: 1, step: 0.01 },
    intensity: { propertyType: PropertyTypes.Number, name: 'Intensity', min: -1, max: 1, step: 0.01 },
    fade: { propertyType: PropertyTypes.Number, name: 'Fade', min: -1, max: 1, step: 0.01 }
  },
  DepthOfFieldEffect: {
    blendFunction: { propertyType: PropertyTypes.BlendFunction, name: 'Blend Function' },
    bokehScale: { propertyType: PropertyTypes.Number, name: 'Bokeh Scale', min: -1, max: 1, step: 0.01 },
    focalLength: { propertyType: PropertyTypes.Number, name: 'Focal Length', min: -1, max: 1, step: 0.01 },
    focusDistance: { propertyType: PropertyTypes.Number, name: 'Focus Distance', min: -1, max: 1, step: 0.01 }
  },
  BloomEffect: {
    blendFunction: { propertyType: PropertyTypes.BlendFunction, name: 'Blend Function' },
    kernelSize: { propertyType: PropertyTypes.KernelSize, name: 'Kernel Size' },
    intensity: { propertyType: PropertyTypes.Number, name: 'Intensity', min: -1, max: 1, step: 0.01 },
    luminanceSmoothing: {
      propertyType: PropertyTypes.Number,
      name: 'Luminance Smoothing',
      min: -1,
      max: 1,
      step: 0.01
    },
    luminanceThreshold: { propertyType: PropertyTypes.Number, name: 'Luminance Threshold', min: -1, max: 1, step: 0.01 }
  },
  ToneMappingEffect: {
    blendFunction: { propertyType: PropertyTypes.BlendFunction, name: 'Blend Function' },
    adaptive: { propertyType: PropertyTypes.Boolean, name: 'Adaptive' },
    adaptationRate: { propertyType: PropertyTypes.Number, name: 'Adaptation Rate', min: -1, max: 1, step: 0.01 },
    averageLuminance: { propertyType: PropertyTypes.Number, name: 'Average Luminance', min: -1, max: 1, step: 0.01 },
    maxLuminance: { propertyType: PropertyTypes.Number, name: 'Max Luminance', min: -1, max: 1, step: 0.01 },
    middleGrey: { propertyType: PropertyTypes.Number, name: 'Middle Grey', min: -1, max: 1, step: 0.01 }
    // resolution:{ propertyType:PostProcessingPropertyTypes.Number, name:"Resolution" }
  },
  BrightnessContrastEffect: {
    brightness: { propertyType: PropertyTypes.Number, name: 'Brightness', min: -1, max: 1, step: 0.01 },
    contrast: { propertyType: PropertyTypes.Number, name: 'Contrast', min: -1, max: 1, step: 0.01 }
  },
  HueSaturationEffect: {
    hue: { propertyType: PropertyTypes.Number, name: 'Hue', min: -1, max: 1, step: 0.01 },
    saturation: { propertyType: PropertyTypes.Number, name: 'Saturation', min: -1, max: 1, step: 0.01 }
  },
  ColorDepthEffect: {
    bits: { propertyType: PropertyTypes.Number, name: 'Bits', min: -1, max: 1, step: 0.01 }
  },
  LinearTosRGBEffect: {}
}

const BlendFunctionSelect = [
  { label: 'Skip', value: 0 },
  { label: 'Add', value: 1 },
  { label: 'ALPHA', value: 2 },
  { label: 'AVERAGE', value: 3 },
  { label: 'COLOR_BURN', value: 4 },
  { label: 'COLOR_DODGE', value: 5 },
  { label: 'DARKEN', value: 6 },
  { label: 'DIFFERENCE', value: 7 },
  { label: 'EXCLUSION', value: 8 },
  { label: 'LIGHTEN', value: 9 },
  { label: 'MULTIPLY', value: 10 },
  { label: 'DIVIDE', value: 11 },
  { label: 'NEGATION', value: 12 },
  { label: 'NORMAL', value: 13 },
  { label: 'OVERLAY', value: 14 },
  { label: 'REFLECT', value: 15 },
  { label: 'SCREEN', value: 16 },
  { label: 'SOFT_LIGHT', value: 17 },
  { label: 'SUBTRACT', value: 18 }
]

const KernelSizeSelect = [
  { label: 'VERY_SMALL', value: 0 },
  { label: 'SMALL', value: 1 },
  { label: 'MEDIUM', value: 2 },
  { label: 'LARGE', value: 3 },
  { label: 'VERY_LARGE', value: 4 },
  { label: 'HUGE', value: 5 }
]

/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */
export const PostProcessingNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const onChangeCheckBox = (e: ChangeEvent<HTMLInputElement>, effect: Effects) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component: PostprocessingComponent,
      properties: { ['options.' + effect + '.isActive']: e.target.checked }
    })
  }

  const onChangeNodeSetting = (propertyPath: string, value: any) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component: PostprocessingComponent,
      properties: { ['options.' + propertyPath]: value }
    })
  }

  const getPropertyValue = (keys: string[]): any => {
    if (keys.length < 1) return null

    let value = postprocessingComponent.options

    keys.forEach((element) => {
      if (value[element] != null && value[element] !== '') {
        value = value[element]
      }
    })

    return value
  }

  const renderProperty = (propertyDetail: EffectPropertyDetail, propertyPath: string[], index: number) => {
    let renderVal = <></>

    switch (propertyDetail.propertyType) {
      case PropertyTypes.Number:
        renderVal = (
          <CompoundNumericInput
            min={propertyDetail.min}
            max={propertyDetail.max}
            step={propertyDetail.step}
            value={getPropertyValue(propertyPath)}
            onChange={(value) => onChangeNodeSetting(propertyPath.join('.'), value)}
          />
        )
        break

      case PropertyTypes.Boolean:
        renderVal = (
          <BooleanInput
            onChange={(value) => onChangeNodeSetting(propertyPath.join('.'), value)}
            value={getPropertyValue(propertyPath)}
          />
        )
        break

      case PropertyTypes.BlendFunction:
        renderVal = (
          <SelectInput
            options={BlendFunctionSelect}
            onChange={(value) => onChangeNodeSetting(propertyPath.join('.'), value)}
            value={getPropertyValue(propertyPath)}
          />
        )
        break

      case PropertyTypes.Color:
        renderVal = (
          <ColorInput
            value={getPropertyValue(propertyPath)}
            onChange={(value) => onChangeNodeSetting(propertyPath.join('.'), value)}
            isValueAsInteger={true}
          />
        )
        break

      case PropertyTypes.KernelSize:
        renderVal = (
          <SelectInput
            options={KernelSizeSelect}
            onChange={(value) => onChangeNodeSetting(propertyPath.join('.'), value)}
            value={getPropertyValue(propertyPath)}
          />
        )
        break
      default:
        renderVal = <>Can't Determine type of property</>
    }

    return (
      <div
        key={index}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <InputGroup name={propertyDetail.name} label={propertyDetail.name}>
          {renderVal}
        </InputGroup>
      </div>
    )
  }

  const renderEffectsTypes = (effectName: Effects) => {
    const effect = EffectsOptions[effectName]
    return Object.keys(effect).map((prop, index) => renderProperty(effect[prop], [effectName, prop], index))
  }

  const renderEffects = () => {
    const items = Object.keys(EffectsOptions).map((effect: Effects) => {
      return (
        <div key={effect}>
          <Checkbox
            onChange={(e) => onChangeCheckBox(e, effect)}
            checked={postprocessingComponent.options[effect].isActive}
          />
          <span style={{ color: '#9FA4B5' }}>{effect}</span>
          {postprocessingComponent.options[effect].isActive && <div>{renderEffectsTypes(effect)}</div>}
        </div>
      )
    })
    return <div>{items}</div>
  }

  const postprocessingComponent = getComponent(props.node.entity, PostprocessingComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.postprocessing.name')}
      description={t('editor:properties.postprocessing.description')}
    >
      {renderEffects()}
    </NodeEditor>
  )
}

PostProcessingNodeEditor.iconComponent = LooksIcon

export default PostProcessingNodeEditor
