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

import { BlendFunction, SMAAPreset, VignetteTechnique } from 'postprocessing'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { MdAutoFixHigh } from 'react-icons/md'
import { Color, DisplayP3ColorSpace, LinearDisplayP3ColorSpace, LinearSRGBColorSpace, SRGBColorSpace } from 'three'

import { useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import {
  EditorComponentType,
  commitProperties,
  commitProperty,
  updateProperty
} from '@etherealengine/editor/src/components/properties/Util'
import { getState } from '@etherealengine/hyperflux'
import { PostProcessingComponent } from '@etherealengine/spatial/src/renderer/components/PostProcessingComponent'
import { PostProcessingEffectState } from '@etherealengine/spatial/src/renderer/effects/EffectRegistry'
import { GiMagickTrick } from 'react-icons/gi'
import Accordion from '../../../../primitives/tailwind/Accordion'
import Checkbox from '../../../../primitives/tailwind/Checkbox'
import ColorInput from '../../../../primitives/tailwind/Color'
import Slider from '../../../../primitives/tailwind/Slider'
import BooleanInput from '../../input/Boolean'
import InputGroup from '../../input/Group'
import SelectInput from '../../input/Select'
import TexturePreviewInput from '../../input/Texture'
import Vector2Input from '../../input/Vector2'
import Vector3Input from '../../input/Vector3'
import PropertyGroup from '../group'

enum PropertyTypes {
  BlendFunction,
  Number,
  Boolean,
  Color,
  ColorSpace,
  KernelSize,
  SMAAPreset,
  EdgeDetectionMode,
  PredicationMode,
  Texture,
  Vector2,
  Vector3,
  VignetteTechnique
}

const SMAAPresetSelect = Object.entries(SMAAPreset).map(([label, value]) => {
  return { label, value }
})

const BlendFunctionSelect = Object.entries(BlendFunction).map(([label, value]) => {
  return { label, value }
})

const VignetteTechniqueSelect = Object.entries(VignetteTechnique).map(([label, value]) => {
  return { label, value }
})

const ColorSpaceSelect = [
  { label: 'NONE', value: '' },
  { label: 'SRGB', value: SRGBColorSpace },
  { label: 'SRGB LINEAR', value: LinearSRGBColorSpace },
  { label: 'DISPLAY P3', value: DisplayP3ColorSpace },
  { label: 'DISPLAY P3 LINEAR', value: LinearDisplayP3ColorSpace }
]

const KernelSizeSelect = [
  { label: 'VERY_SMALL', value: 0 },
  { label: 'SMALL', value: 1 },
  { label: 'MEDIUM', value: 2 },
  { label: 'LARGE', value: 3 },
  { label: 'VERY_LARGE', value: 4 },
  { label: 'HUGE', value: 5 }
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
export const PostProcessingSettingsEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const [openSettings, setOpenSettings] = useState(false)
  const effects = getState(PostProcessingEffectState)
  const postprocessing = useComponent(props.entity, PostProcessingComponent)

  const renderProperty = (effectName: string, property: string, index: number) => {
    const effectSettingState = effects[effectName].schema[property]
    const effectSettingValue = postprocessing.effects[effectName][property].value

    let renderVal = <></>

    switch (effectSettingState.propertyType) {
      case PropertyTypes.Number:
        renderVal = (
          <Slider
            min={effectSettingState.min}
            max={effectSettingState.max}
            step={effectSettingState.step}
            value={effectSettingValue}
            onChange={updateProperty(PostProcessingComponent, `effects.${effectName}.${property}` as any)}
            onRelease={commitProperty(PostProcessingComponent, `effects.${effectName}.${property}` as any)}
          />
        )
        break

      case PropertyTypes.Boolean:
        renderVal = (
          <BooleanInput
            onChange={commitProperty(PostProcessingComponent, `effects.${effectName}.${property}` as any)}
            value={effectSettingValue}
          />
        )
        break
      case PropertyTypes.SMAAPreset:
        renderVal = (
          <SelectInput
            options={SMAAPresetSelect}
            onChange={commitProperty(PostProcessingComponent, `effects.${effectName}.${property}` as any)}
            value={effectSettingValue}
          />
        )
        break
      case PropertyTypes.BlendFunction:
        renderVal = (
          <SelectInput
            options={BlendFunctionSelect}
            onChange={commitProperty(PostProcessingComponent, `effects.${effectName}.${property}` as any)}
            value={effectSettingValue}
          />
        )
        break

      case PropertyTypes.VignetteTechnique:
        renderVal = (
          <SelectInput
            options={VignetteTechniqueSelect}
            onChange={commitProperty(PostProcessingComponent, `effects.${effectName}.${property}` as any)}
            value={effectSettingValue}
          />
        )
        break

      case PropertyTypes.Vector2:
        renderVal = (
          <Vector2Input
            value={effectSettingValue}
            onChange={updateProperty(PostProcessingComponent, `effects.${effectName}.${property}` as any)}
          />
        )
        break

      case PropertyTypes.Vector3:
        renderVal = (
          <Vector3Input
            value={effectSettingValue}
            onChange={updateProperty(PostProcessingComponent, `effects.${effectName}.${property}` as any)}
          />
        )
        break

      case PropertyTypes.Texture:
        renderVal = (
          <TexturePreviewInput
            value={effectSettingValue}
            onRelease={updateProperty(PostProcessingComponent, `effects.${effectName}.${property}` as any)}
          />
        )
        break
      case PropertyTypes.Color:
        renderVal = (
          <ColorInput
            value={new Color(effectSettingValue)}
            onChange={(value) =>
              commitProperty(PostProcessingComponent, `effects.${effectName}.${property}` as any)('#' + value)
            }
          />
        )
        break

      case PropertyTypes.KernelSize:
        renderVal = (
          <SelectInput
            options={KernelSizeSelect}
            onChange={commitProperty(PostProcessingComponent, `effects.${effectName}.${property}` as any)}
            value={effectSettingValue}
          />
        )
        break
      case PropertyTypes.EdgeDetectionMode:
        renderVal = (
          <SelectInput
            options={EdgeDetectionMode}
            onChange={commitProperty(PostProcessingComponent, `effects.${effectName}.${property}` as any)}
            value={effectSettingValue}
          />
        )
        break

      case PropertyTypes.PredicationMode:
        renderVal = (
          <SelectInput
            options={PredicationMode}
            onChange={commitProperty(PostProcessingComponent, `effects.${effectName}.${property}` as any)}
            value={effectSettingValue}
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
        <InputGroup name={effectSettingState.name} label={effectSettingState.name}>
          {renderVal}
        </InputGroup>
      </div>
    )
  }

  const renderEffectsTypes = (effectName) => {
    const effect = getState(PostProcessingEffectState)[effectName].schema
    return Object.keys(effect).map((prop, index) => renderProperty(effectName, prop, index))
  }

  const renderEffects = () => {
    const items = Object.keys(getState(PostProcessingEffectState)).map((effect) => {
      return (
        <div className="py-1" key={effect}>
          <Checkbox
            onChange={(val) =>
              commitProperties(PostProcessingComponent, { [`effects.${effect}.isActive`]: val }, [props.entity])
            }
            value={postprocessing.effects[effect]?.isActive?.value}
            label={effect}
          />
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
      icon={<PostProcessingSettingsEditor.iconComponent />}
    >
      <InputGroup name="Post Processing Enabled" label={t('editor:properties.postprocessing.enabled')}>
        <BooleanInput
          value={postprocessing.enabled.value}
          onChange={(val) => {
            console.log('changed ', val, !!val)
            commitProperty(PostProcessingComponent, 'enabled')(val)
          }}
        />
      </InputGroup>
      {postprocessing.enabled.value && (
        <>
          <Accordion
            className="bg-[#242424] p-0 text-white"
            onClick={() => setOpenSettings(!openSettings)}
            title={'Post Processing Effects'}
            prefixIcon={<GiMagickTrick />}
            expandIcon={<FaChevronDown />}
            shrinkIcon={<FaChevronUp />}
          >
            {renderEffects()}
          </Accordion>
        </>
      )}
    </PropertyGroup>
  )
}

PostProcessingSettingsEditor.iconComponent = MdAutoFixHigh

export default PostProcessingSettingsEditor
