/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { debounce } from 'lodash'
import { BlendFunction } from 'postprocessing'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Color } from 'three'

import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { configureEffectComposer } from '@etherealengine/engine/src/renderer/functions/configureEffectComposer'
import { PostProcessingComponent } from '@etherealengine/engine/src/scene/components/PostProcessingComponent'
import { Effects } from '@etherealengine/engine/src/scene/constants/PostProcessing'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Checkbox from '@mui/material/Checkbox'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'

import BooleanInput from '../inputs/BooleanInput'
import ColorInput from '../inputs/ColorInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import styles from '../styles.module.scss'
import PropertyGroup from './PropertyGroup'
import { EditorComponentType } from './Util'

enum PropertyTypes {
  BlendFunction,
  Number,
  Boolean,
  Color,
  KernelSize,
  SMAAPreset,
  EdgeDetectionMode,
  PredicationMode
}

type EffectPropertyDetail = { propertyType: PropertyTypes; name: string; min?: number; max?: number; step?: number }
type EffectPropertiesType = { [key: string]: EffectPropertyDetail }
type EffectOptionsType = { [key in keyof typeof Effects]: EffectPropertiesType }

const EffectsOptions: EffectOptionsType = {
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
  SSREffect: {
    distance: { propertyType: PropertyTypes.Number, name: 'Distance', min: 0.001, max: 10, step: 0.01 },
    thickness: { propertyType: PropertyTypes.Number, name: 'Thickness', min: 0, max: 5, step: 0.01 },
    autoThickness: { propertyType: PropertyTypes.Boolean, name: 'Auto Thickness' },
    maxRoughness: { propertyType: PropertyTypes.Number, name: 'Max Roughness', min: 0, max: 1, step: 0.01 },
    blend: { propertyType: PropertyTypes.Number, name: 'Blend', min: 0, max: 1, step: 0.001 },
    denoiseIterations: { propertyType: PropertyTypes.Number, name: 'Denoise Iterations', min: 0, max: 5, step: 1 },
    denoiseKernel: { propertyType: PropertyTypes.Number, name: 'Denoise Kernel', min: 1, max: 5, step: 1 },
    denoiseDiffuse: { propertyType: PropertyTypes.Number, name: 'Denoise Diffuse', min: 0, max: 50, step: 0.01 },
    denoiseSpecular: { propertyType: PropertyTypes.Number, name: 'Denoise Specular', min: 0, max: 50, step: 0.01 },
    depthPhi: { propertyType: PropertyTypes.Number, name: 'Depth Phi', min: 0, max: 15, step: 0.001 },
    normalPhi: { propertyType: PropertyTypes.Number, name: 'Normal Phi', min: 0, max: 50, step: 0.001 },
    roughnessPhi: { propertyType: PropertyTypes.Number, name: 'Roughness Phi', min: 0, max: 100, step: 0.001 },
    envBlur: { propertyType: PropertyTypes.Number, name: 'Environment Blur', min: 0, max: 1, step: 0.01 },
    importanceSampling: { propertyType: PropertyTypes.Boolean, name: 'Importance Sampling' },
    directLightMultiplier: {
      propertyType: PropertyTypes.Number,
      name: 'Direct Light Multiplier',
      min: 0.001,
      max: 10,
      step: 0.01
    },
    steps: { propertyType: PropertyTypes.Number, name: 'Steps', min: 0, max: 256, step: 1 },
    refineSteps: { propertyType: PropertyTypes.Number, name: 'Refine Steps', min: 0, max: 16, step: 1 },
    spp: { propertyType: PropertyTypes.Number, name: 'SPP', min: 1, max: 32, step: 1 },
    resolutionScale: { propertyType: PropertyTypes.Number, name: 'Resolution Scale', min: 0.25, max: 1, step: 0.25 },
    missedRays: { propertyType: PropertyTypes.Boolean, name: 'Missed Rays' }
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
    intensity: { propertyType: PropertyTypes.Number, name: 'Intensity', min: -1, max: 1000, step: 0.01 },
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
  LinearTosRGBEffect: {},
  SSGIEffect: {
    distance: { propertyType: PropertyTypes.Number, name: 'Distance', min: 0.001, max: 10, step: 0.01 },
    thickness: { propertyType: PropertyTypes.Number, name: 'Thickness', min: 0, max: 5, step: 0.01 },
    autoThickness: { propertyType: PropertyTypes.Boolean, name: 'Auto Thickness' },
    maxRoughness: { propertyType: PropertyTypes.Number, name: 'Max Roughness', min: 0, max: 1, step: 0.01 },
    blend: { propertyType: PropertyTypes.Number, name: 'Blend', min: 0, max: 1, step: 0.001 },
    denoiseIterations: { propertyType: PropertyTypes.Number, name: 'Denoise Iterations', min: 0, max: 5, step: 1 },
    denoiseKernel: { propertyType: PropertyTypes.Number, name: 'Denoise Kernel', min: 1, max: 5, step: 1 },
    denoiseDiffuse: { propertyType: PropertyTypes.Number, name: 'Denoise Diffuse', min: 0, max: 50, step: 0.01 },
    denoiseSpecular: { propertyType: PropertyTypes.Number, name: 'Denoise Specular', min: 0, max: 50, step: 0.01 },
    depthPhi: { propertyType: PropertyTypes.Number, name: 'Depth Phi', min: 0, max: 15, step: 0.001 },
    normalPhi: { propertyType: PropertyTypes.Number, name: 'Normal Phi', min: 0, max: 50, step: 0.001 },
    roughnessPhi: { propertyType: PropertyTypes.Number, name: 'Roughness Phi', min: 0, max: 100, step: 0.001 },
    envBlur: { propertyType: PropertyTypes.Number, name: 'Environment Blur', min: 0, max: 1, step: 0.01 },
    importanceSampling: { propertyType: PropertyTypes.Boolean, name: 'Importance Sampling' },
    directLightMultiplier: {
      propertyType: PropertyTypes.Number,
      name: 'Direct Light Multiplier',
      min: 0.001,
      max: 10,
      step: 0.01
    },
    steps: { propertyType: PropertyTypes.Number, name: 'Steps', min: 0, max: 256, step: 1 },
    refineSteps: { propertyType: PropertyTypes.Number, name: 'Refine Steps', min: 0, max: 16, step: 1 },
    spp: { propertyType: PropertyTypes.Number, name: 'SPP', min: 1, max: 32, step: 1 },
    resolutionScale: { propertyType: PropertyTypes.Number, name: 'Resolution Scale', min: 0.25, max: 1, step: 0.25 },
    missedRays: { propertyType: PropertyTypes.Boolean, name: 'Missed Rays' }
  },
  TRAAEffect: {
    blend: { propertyType: PropertyTypes.Number, name: 'Blend', min: 0, max: 1, step: 0.001 },
    constantBlend: { propertyType: PropertyTypes.Boolean, name: 'Constant Blend' },
    dilation: { propertyType: PropertyTypes.Boolean, name: 'Dilation' },
    blockySampling: { propertyType: PropertyTypes.Boolean, name: 'Blocky Sampling' },
    logTransform: { propertyType: PropertyTypes.Boolean, name: 'Log Transform' },
    depthDistance: { propertyType: PropertyTypes.Number, name: 'Depth Distance', min: 0.01, max: 100, step: 0.01 },
    worldDistance: { propertyType: PropertyTypes.Number, name: 'World Distance', min: 0.01, max: 100, step: 0.01 },
    neighborhoodClamping: { propertyType: PropertyTypes.Boolean, name: 'Neighborhood Clamping' }
  },
  MotionBlurEffect: {
    intensity: { propertyType: PropertyTypes.Number, name: 'Intensity', min: 0, max: 10, step: 0.01 },
    jitter: { propertyType: PropertyTypes.Number, name: 'Jitter', min: 0, max: 10, step: 0.01 },
    samples: { propertyType: PropertyTypes.Number, name: 'Samples', min: 1, max: 64, step: 1 }
  }
}

const BlendFunctionSelect = Object.entries(BlendFunction).map(([label, value]) => {
  return { label, value }
})

const KernelSizeSelect = [
  { label: 'VERY_SMALL', value: 0 },
  { label: 'SMALL', value: 1 },
  { label: 'MEDIUM', value: 2 },
  { label: 'LARGE', value: 3 },
  { label: 'VERY_LARGE', value: 4 },
  { label: 'HUGE', value: 5 }
]

const SMAAPreset = [
  { label: 'LOW', value: 0 },
  { label: 'MEDIUM', value: 1 },
  { label: 'HIGH', value: 2 },
  { label: 'ULTRA', value: 3 }
]

const EdgeDetectionMode = [
  { label: 'DEPTH', value: 0 },
  { label: 'LUMA', value: 1 },
  { label: 'COLOR', value: 2 }
]

const PredicationMode = [
  { label: 'DISABLED', value: 0 },
  { label: 'DEPTH', value: 1 },
  { label: 'CUSTOM', value: 2 }
]

const debouncedConfigureEffectComposer = debounce(() => {
  configureEffectComposer()
}, 200)

export const PostProcessingSettingsEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const [openSettings, setOpenSettings] = useState(false)
  const postprocessing = useComponent(props.entity, PostProcessingComponent)

  const getPropertyValue = (keys: string[]): any => {
    if (keys.length < 1) return null

    let value = postprocessing.effects

    keys.forEach((element) => {
      if (value[element] != null && value[element] !== '') {
        value = value[element]
      }
    })

    return value
  }

  // trigger re-render - @todo find out why just setting the value doesn't trigger the reactor
  // action: debounced the set property value

  const setPropertyValue = (prop, val) => {
    prop.set(val)
    debouncedConfigureEffectComposer()
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
            value={getPropertyValue(propertyPath).value}
            onChange={(value) => setPropertyValue(getPropertyValue(propertyPath), value)}
          />
        )
        break

      case PropertyTypes.Boolean:
        renderVal = (
          <BooleanInput
            onChange={(value) => setPropertyValue(getPropertyValue(propertyPath), value)}
            value={getPropertyValue(propertyPath).value}
          />
        )
        break

      case PropertyTypes.BlendFunction:
        renderVal = (
          <SelectInput
            options={BlendFunctionSelect}
            onChange={(value) => setPropertyValue(getPropertyValue(propertyPath), value)}
            value={getPropertyValue(propertyPath).value}
          />
        )
        break

      case PropertyTypes.Color:
        renderVal = (
          <ColorInput
            value={new Color(getPropertyValue(propertyPath).value)}
            onSelect={(value) => setPropertyValue(getPropertyValue(propertyPath), '#' + value)}
          />
        )
        break

      case PropertyTypes.KernelSize:
        renderVal = (
          <SelectInput
            options={KernelSizeSelect}
            onChange={(value) => setPropertyValue(getPropertyValue(propertyPath), value)}
            value={getPropertyValue(propertyPath).value}
          />
        )
        break

      case PropertyTypes.SMAAPreset:
        renderVal = (
          <SelectInput
            options={SMAAPreset}
            onChange={(value) => setPropertyValue(getPropertyValue(propertyPath), value)}
            value={getPropertyValue(propertyPath).value}
          />
        )
        break

      case PropertyTypes.EdgeDetectionMode:
        renderVal = (
          <SelectInput
            options={EdgeDetectionMode}
            onChange={(value) => setPropertyValue(getPropertyValue(propertyPath), value)}
            value={getPropertyValue(propertyPath).value}
          />
        )
        break

      case PropertyTypes.PredicationMode:
        renderVal = (
          <SelectInput
            options={PredicationMode}
            onChange={(value) => setPropertyValue(getPropertyValue(propertyPath), value)}
            value={getPropertyValue(propertyPath).value}
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

  const renderEffectsTypes = (effectName: keyof typeof Effects) => {
    const effect = EffectsOptions[effectName]
    return Object.keys(effect).map((prop, index) => renderProperty(effect[prop], [effectName, prop], index))
  }

  const renderEffects = () => {
    const items = Object.keys(EffectsOptions).map((effect: keyof typeof Effects) => {
      return (
        <div key={effect}>
          <Checkbox
            classes={{ checked: styles.checkbox }}
            onChange={(e) => postprocessing.effects[effect].isActive.set(e.target.checked)}
            checked={postprocessing.effects[effect]?.isActive?.value}
          />
          <span style={{ color: 'var(--textColor)' }}>{effect}</span>
          {postprocessing.effects[effect]?.isActive?.value && <div>{renderEffectsTypes(effect)}</div>}
        </div>
      )
    })
    return <div>{items}</div>
  }

  return (
    <PropertyGroup
      name={t('editor:properties.postprocessing.name')}
      description={t('editor:properties.postprocessing.description')}
    >
      <InputGroup name="Post Processing Enabled" label={t('editor:properties.postprocessing.enabled')}>
        <BooleanInput value={postprocessing.enabled.value} onChange={(val) => postprocessing.enabled.set(val)} />
      </InputGroup>
      <IconButton
        style={{ color: 'var(--textColor)' }}
        onClick={() => setOpenSettings(!openSettings)}
        className={styles.collapseBtn}
        aria-label="expand"
        size="small"
      >
        {openSettings ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </IconButton>
      <Collapse in={openSettings} timeout="auto" unmountOnExit>
        {renderEffects()}
      </Collapse>
    </PropertyGroup>
  )
}
