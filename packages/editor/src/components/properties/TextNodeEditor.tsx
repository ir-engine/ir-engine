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
import { TextComponent, TroikaTextLineHeight } from '@etherealengine/engine/src/scene/components/TextComponent'
import { useHookstate } from '@hookstate/core'
import BooleanInput from '../inputs/BooleanInput'
import ColorInput from '../inputs/ColorInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import { ControlledStringInput } from '../inputs/StringInput'
import Vector2Input from '../inputs/Vector2Input'

/**
 * @description SelectInput option groups for the TextNodeEditor UI tsx code.
 * @local Stored `@local` scope of the file, so it only exists once and its not GC'ed when the component is used.
 */
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

/**
 * @description Default fallback value for when when text.lineheight is not set to 'normal'
 * @default 1.2
 */
const LineHeightNumericDefault = 1.2 as TroikaTextLineHeight

/**
 * @description Object holding all of the UI's `info` descriptions.
 */
const HoverInfo = {
  AdvancedGroup: `
Toggle Advanced options. Only modify these if you know what you are doing.
`,
  TextOrientation: `
Defines the axis plane on which the text should be laid out when the mesh has no extra rotation transform.
It is specified as a string with two axes:
  1. the horizontal axis with positive pointing right,
  2. the vertical axis with positive pointing up.
By default this is '+x+y', meaning the text sits on the xy plane with the text's top toward positive y and facing positive z.
A value of '+x-z' would place it on the xz plane with the text's top toward negative z and facing positive y.
`
}

/**
 * @description TextNodeEditor component used to provide the editor a view to customize text properties.
 * @type {Class component}
 */
export const TextNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const text = useComponent(props.entity, TextComponent)
  const advancedActive = useHookstate(false) // State tracking whether the Advanced Options Section is active or not

  // LineHeight state management
  const lineHeightIsNormal = useHookstate(true) // true when `text.lineHeight` is set to its union 'normal'
  const lineHeight_setNormal = (checkboxValue: boolean) => {
    // Used as a BooleanInput callback for setting the value of lineheight.
    // Sets the value to either its 'normal' type-union option, or to a default lineHeight value when the checkbox is off.
    lineHeightIsNormal.set(checkboxValue)
    if (checkboxValue) text.lineHeight.set('normal' as TroikaTextLineHeight)
    else text.lineHeight.set(LineHeightNumericDefault)
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
            unit="em"
          />
          <NumericInputGroup
            name="TextIndent"
            label="indent" // {t('editor:properties.text.textIndent')}  /* @todo: Translation id */
            min={0}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={0.5}
            value={text.textIndent.value}
            onChange={updateProperty(TextComponent, 'textIndent')}
            onRelease={commitProperty(TextComponent, 'textIndent')}
            unit="em"
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
            name="LetterSpacing"
            label="letterSpacing" // {t('editor:properties.text.letterSpacing')}  /* @todo: Translation id */
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
            name="LineHeightGroup"
            label="lineHeight" // {t('editor:properties.text.textWrap')} /* @todo: Translation id */
          >
            <BooleanInput value={lineHeightIsNormal.value} onChange={lineHeight_setNormal} />
            <NumericInputGroup
              disabled={lineHeightIsNormal.value} // Disable numeric input when lineHeight is set to 'normal'
              name="LineHeight"
              label="height" // {t('editor:properties.text.lineHeight')}  /* @todo: Translation id */
              min={0}
              smallStep={0.01}
              mediumStep={0.1}
              largeStep={0.2}
              value={text.lineHeight.value}
              onChange={updateProperty(TextComponent, 'lineHeight')}
              onRelease={commitProperty(TextComponent, 'lineHeight')}
              unit="em"
            />
          </InputGroup>
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
          <InputGroup
            name="OutlineColor"
            label="color" // {t('editor:properties.text.outlineColor')}  /* @todo: Translation id */
          >
            <ColorInput
              value={text.outlineColor.value}
              onChange={updateProperty(TextComponent, 'outlineColor')}
              onRelease={commitProperty(TextComponent, 'outlineColor')}
            />
          </InputGroup>
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
        label="Stroke" // {t('editor:properties.text.strokeGroup')}  /* @todo: Translation id */
      >
        <div>
          <InputGroup
            name="StrokeColor"
            label="color" // {t('editor:properties.text.strokeColor')}  /* @todo: Translation id */
          >
            <ColorInput
              value={text.strokeColor.value}
              onChange={updateProperty(TextComponent, 'strokeColor')}
              onRelease={commitProperty(TextComponent, 'strokeColor')}
            />
          </InputGroup>
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
        name="AdvancedActive"
        label="Show Advanced" // {t('editor:properties.textbox.advancedActive')}  /* @todo: Translation id */
        info={HoverInfo.AdvancedGroup}
      >
        <BooleanInput value={advancedActive.value} onChange={advancedActive.set} />
      </InputGroup>
      {advancedActive.value ? (
        /*Show Advanced Options only when Active*/
        <InputGroup
          name="AdvancedGroup"
          label="Advanced" // {t('editor:properties.textbox.advancedGroup')}  /* @todo: Translation id */
        >
          <div>
            <InputGroup name="TextOrientation" label="Orientation" info={HoverInfo.TextOrientation}>
              <ControlledStringInput
                value={text.textOrientation.value}
                onChange={updateProperty(TextComponent, 'textOrientation')}
                onRelease={commitProperty(TextComponent, 'textOrientation')}
              />
            </InputGroup>
            <InputGroup
              name="ClippingActive"
              label="clip.active" // {t('editor:properties.textbox.clippingActive')}  /* @todo: Translation id */
            >
              <BooleanInput value={text.clipActive.value} onChange={text.clipActive.set} />
            </InputGroup>
            <InputGroup
              disabled={!text.clipActive.value}
              name="ClippingMin"
              label="clip.min" // {t('editor:properties.text.clippingMin')} /* @todo: Translation id */
            >
              <Vector2Input
                value={text.clipRectMin.value}
                onChange={updateProperty(TextComponent, 'clipRectMin')}
                onRelease={commitProperty(TextComponent, 'clipRectMin')}
              />
            </InputGroup>
            <InputGroup
              disabled={!text.clipActive.value}
              name="ClippingMax"
              label="clip.max" // {t('editor:properties.text.clippingMax')} /* @todo: Translation id */
            >
              <Vector2Input
                value={text.clipRectMax.value}
                onChange={updateProperty(TextComponent, 'clipRectMax')}
                onRelease={commitProperty(TextComponent, 'clipRectMax')}
              />
            </InputGroup>
            <NumericInputGroup
              name="GlyphResolution"
              label="glyph.resolution" // {t('editor:properties.text.glyphResolution')}  /* @todo: Translation id */
              min={1}
              smallStep={1}
              mediumStep={1}
              largeStep={2}
              value={text.glyphResolution.value}
              onChange={updateProperty(TextComponent, 'glyphResolution')}
              onRelease={commitProperty(TextComponent, 'glyphResolution')}
              unit="2^N"
            />
            <NumericInputGroup
              name="GlyphDetail"
              label="glyph.detail" // {t('editor:properties.text.glyphDetail')}  /* @todo: Translation id */
              min={1}
              smallStep={1}
              mediumStep={1}
              largeStep={1}
              value={text.glyphDetail.value}
              onChange={updateProperty(TextComponent, 'glyphDetail')}
              onRelease={commitProperty(TextComponent, 'glyphDetail')}
              unit="subdiv"
            />
            <InputGroup
              name="GPUAccelerated"
              label="GPU Accelerated" // {t('editor:properties.textbox.gpuAccelerated')}  /* @todo: Translation id */
            >
              <BooleanInput value={text.gpuAccelerated.value} onChange={text.gpuAccelerated.set} />
            </InputGroup>
          </div>
        </InputGroup>
      ) : (
        <>{/*advanced.inactive*/}</>
      )}
    </NodeEditor>
  )
}

TextNodeEditor.iconComponent = TextFieldsIcon

export default TextNodeEditor
