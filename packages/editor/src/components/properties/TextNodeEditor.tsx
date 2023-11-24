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

import React from 'react'
import { useTranslation } from 'react-i18next'

import TextFieldsIcon from '@mui/icons-material/TextFields'

import {
  EditorComponentType,
  commitProperty,
  updateProperty
} from '@etherealengine/editor/src/components/properties//Util'
import NodeEditor from '@etherealengine/editor/src/components/properties/NodeEditor'
import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { TextComponent } from '@etherealengine/engine/src/scene/components/TextComponent'
import BooleanInput from '../inputs/BooleanInput'
import ColorInput from '../inputs/ColorInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import { ControlledStringInput } from '../inputs/StringInput'
import Vector2Input from '../inputs/Vector2Input'

/**
 * TextNodeEditor component used to provide the editor a view to customize text properties.
 *
 * @type {Class component}
 */
export const TextNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const text = useComponent(props.entity, TextComponent)
  const SelectOptions = {
    TextDirection: [
      { label: 'Auto', value: 'auto' },
      { label: 'Left to Right', value: 'ltr' },
      { label: 'Right to Left', value: 'rtl' }
    ],
    TextAlignment: [
      { label: 'Justify', value: 'justify' },
      { label: 'Center', value: 'center' },
      { label: 'Left', value: 'left' },
      { label: 'Right', value: 'right' }
    ],
    TextWrapping: [
      { label: 'Whitespace', value: 'normal' },
      { label: 'Break Word', value: 'break-word' }
    ]
  }

  return (
    <NodeEditor {...props} name="Text Component" description="A Text component">
      <InputGroup name="TextContents" label="Contents">
        <ControlledStringInput
          value={text.text.value}
          onChange={updateProperty(TextComponent, 'text')}
          onRelease={commitProperty(TextComponent, 'text')}
        />
      </InputGroup>
      <InputGroup
        name="TextGroup"
        label="Text" // {t('editor:properties.text.textGroup')}  /* @todo: Translation id */
      >
        <div>
          <NumericInputGroup
            name="TextOpacity"
            label="opacity" // {t('editor:properties.text.textOpacity')}  /* @todo: Translation id */
            min={0}
            max={100}
            smallStep={1}
            mediumStep={5}
            largeStep={10}
            value={text.textOpacity.value}
            onChange={updateProperty(TextComponent, 'textOpacity')}
            onRelease={commitProperty(TextComponent, 'textOpacity')}
            unit="%"
          />
          <NumericInputGroup
            name="TextWidth"
            label="width" // {t('editor:properties.text.textWidth')}  /* @todo: Translation id */
            min={0}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={0.5}
            value={text.textWidth.value}
            onChange={updateProperty(TextComponent, 'textWidth')}
            onRelease={commitProperty(TextComponent, 'textWidth')}
            unit="px"
          />
          <NumericInputGroup
            name="TextIndent"
            label="indent" // {t('editor:properties.text.textIndent')}  /* @todo: Translation id */
            min={0}
            smallStep={0.1}
            mediumStep={0.5}
            largeStep={1}
            value={text.textIndent.value}
            onChange={updateProperty(TextComponent, 'textIndent')}
            onRelease={commitProperty(TextComponent, 'textIndent')}
            unit="px"
          />
          <InputGroup
            name="TextAlign"
            label="align" // {t('editor:properties.text.textAlign')} /* @todo: Translation id */
          >
            <SelectInput
              options={SelectOptions.TextAlignment}
              value={text.textAlign.value}
              onChange={updateProperty(TextComponent, 'textAlign')}
              //onChange={(val :TroikaTextDirection) => text.textDirection.set(val)}
            />
          </InputGroup>
          <InputGroup
            name="TextWrap"
            label="wrap" // {t('editor:properties.text.textWrap')} /* @todo: Translation id */
          >
            <BooleanInput value={text.textWrap.value} onChange={text.textWrap.set} />
            <SelectInput
              disabled={!text.textWrap.value} // Enabled when text.textWrap is true
              options={SelectOptions.TextWrapping}
              value={text.textWrapKind.value}
              onChange={updateProperty(TextComponent, 'textWrapKind')}
            />
          </InputGroup>

          <InputGroup
            name="TextAnchor"
            label="anchor" // {t('editor:properties.text.textAnchor')} /* @todo: Translation id */
          >
            <Vector2Input
              value={text.textAnchor.value}
              onChange={updateProperty(TextComponent, 'textAnchor')}
              onRelease={commitProperty(TextComponent, 'textAnchor')}
            />
          </InputGroup>
          <NumericInputGroup
            name="TextDepthOffset"
            label="depthOffset" // {t('editor:properties.text.textDepthOffset')}  /* @todo: Translation id */
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={0.25}
            value={text.textDepthOffset.value}
            onChange={updateProperty(TextComponent, 'textDepthOffset')}
            onRelease={commitProperty(TextComponent, 'textDepthOffset')}
            unit="px"
          />
          <NumericInputGroup
            name="TextCurveRadius"
            label="curveRadius" // {t('editor:properties.text.textCurveRadius')}  /* @todo: Translation id */
            smallStep={1}
            mediumStep={5}
            largeStep={15}
            value={text.textCurveRadius.value}
            onChange={updateProperty(TextComponent, 'textCurveRadius')}
            onRelease={commitProperty(TextComponent, 'textCurveRadius')}
            unit="deg"
          />
          <NumericInputGroup
            name="LettersSpacing"
            label="spacing" // {t('editor:properties.text.letterSpacing')}  /* @todo: Translation id */
            min={-0.5}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={0.2}
            value={text.letterSpacing.value}
            onChange={updateProperty(TextComponent, 'letterSpacing')}
            onRelease={commitProperty(TextComponent, 'letterSpacing')}
            unit="px"
          />
          <InputGroup
            name="TextDirection"
            label="direction" // {t('editor:properties.text.textDirection')} /* @todo: Translation id */
          >
            <SelectInput
              options={SelectOptions.TextDirection}
              value={text.textDirection.value}
              onChange={updateProperty(TextComponent, 'textDirection')}
              //onChange={(val :TroikaTextDirection) => text.textDirection.set(val)}
            />
          </InputGroup>
        </div>
      </InputGroup>

      <InputGroup
        name="FontGroup"
        label="Font" // {t('editor:properties.text.fontGroup')}  /* @todo: Translation id */
      >
        <div>
          <InputGroup
            name="FontFamily"
            label="family" // {t('editor:properties.text.fontGroup')}  /* @todo: Translation id */
          >
            <ControlledStringInput
              value={text.font.value!}
              onChange={updateProperty(TextComponent, 'font')}
              onRelease={commitProperty(TextComponent, 'font')}
            />
          </InputGroup>
          <NumericInputGroup
            name="FontSize"
            label="size" // {t('editor:properties.text.fontSize')}  /* @todo: Translation id */
            min={0}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={0.5}
            value={text.fontSize.value}
            onChange={updateProperty(TextComponent, 'fontSize')}
            onRelease={commitProperty(TextComponent, 'fontSize')}
            unit="em"
          />
          <InputGroup
            name="FontColor"
            label="color" // {t('editor:properties.text.fontColor')}  /* @todo: Translation id */
          >
            <ColorInput
              value={text.fontColor.value}
              onChange={updateProperty(TextComponent, 'fontColor')}
              onRelease={commitProperty(TextComponent, 'fontColor')}
            />
          </InputGroup>
        </div>
      </InputGroup>
      <InputGroup
        name="OutlineGroup"
        label="Outline" // {t('editor:properties.text.outlineGroup')}  /* @todo: Translation id */
      >
        <div>
          <NumericInputGroup
            name="OutlineOpacity"
            label="opacity" // {t('editor:properties.text.outlineOpacity')}  /* @todo: Translation id */
            min={0}
            max={100}
            smallStep={1}
            mediumStep={2}
            largeStep={5}
            value={text.outlineOpacity.value}
            onChange={updateProperty(TextComponent, 'outlineOpacity')}
            onRelease={commitProperty(TextComponent, 'outlineOpacity')}
            unit="%"
          />
          <NumericInputGroup
            name="OutlineWidth"
            label="width" // {t('editor:properties.text.outlineWidth')}  /* @todo: Translation id */
            min={0}
            smallStep={0.5}
            mediumStep={1}
            largeStep={2}
            value={text.outlineWidth.value}
            onChange={updateProperty(TextComponent, 'outlineWidth')}
            onRelease={commitProperty(TextComponent, 'outlineWidth')}
            unit="%"
          />
          <NumericInputGroup
            name="OutlineBlur"
            label="blur" // {t('editor:properties.text.outlineBlur')}  /* @todo: Translation id */
            min={0}
            smallStep={1}
            mediumStep={2}
            largeStep={5}
            value={text.outlineBlur.value}
            onChange={updateProperty(TextComponent, 'outlineBlur')}
            onRelease={commitProperty(TextComponent, 'outlineBlur')}
            unit="%"
          />
          <InputGroup
            name="OutlineOffset"
            label="offset" // {t('editor:properties.text.outlineOffset')} /* @todo: Translation id */
          >
            <Vector2Input
              value={text.outlineOffset.value}
              onChange={updateProperty(TextComponent, 'outlineOffset')}
              onRelease={commitProperty(TextComponent, 'outlineOffset')}
            />
          </InputGroup>
        </div>
      </InputGroup>
      <InputGroup
        name="StrokeGroup"
        label="Stroke" // {t('editor:properties.text.StrokeGroup')}  /* @todo: Translation id */
      >
        <div>
          <NumericInputGroup
            name="StrokeOpacity"
            label="opacity" // {t('editor:properties.text.strokeOpacity)}  /* @todo: Translation id */
            min={0}
            max={100}
            smallStep={1}
            mediumStep={2}
            largeStep={10}
            value={text.strokeOpacity.value}
            onChange={updateProperty(TextComponent, 'strokeOpacity')}
            onRelease={commitProperty(TextComponent, 'strokeOpacity')}
            unit="%"
          />
          <NumericInputGroup
            name="StrokeWidth"
            label="width" // {t('editor:properties.text.strokeWidth')}  /* @todo: Translation id */
            min={0}
            smallStep={0.5}
            mediumStep={1}
            largeStep={2}
            value={text.strokeWidth.value}
            onChange={updateProperty(TextComponent, 'strokeWidth')}
            onRelease={commitProperty(TextComponent, 'strokeWidth')}
            unit="%"
          />
        </div>
      </InputGroup>
      <InputGroup
        name="GPUAccelerated"
        label="GPU Accelerated" // {t('editor:properties.textbox.gpuAccelerated')}  /* @todo: Translation id */
      >
        <BooleanInput value={text.gpuAccelerated.value} onChange={text.gpuAccelerated.set} />
      </InputGroup>
    </NodeEditor>
  )
}

TextNodeEditor.iconComponent = TextFieldsIcon

export default TextNodeEditor
