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
import ColorInput from '../inputs/ColorInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import { ControlledStringInput } from '../inputs/StringInput'

/**
 * TextNodeEditor component used to provide the editor view to customize link properties.
 *
 * @type {Class component}
 */
export const TextNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const text = useComponent(props.entity, TextComponent)

  return (
    <NodeEditor {...props} name="Text Component" description="A Text component">
      <InputGroup name="Text" label="Text">
        <ControlledStringInput
          value={text.text.value}
          onChange={updateProperty(TextComponent, 'text')}
          onRelease={commitProperty(TextComponent, 'text')}
        />
      </InputGroup>
      <NumericInputGroup
        name="FontSize"
        label="Font.size" // {t('editor:properties.text.fontSize')}  /* @todo: Translation id */
        min={0}
        smallStep={1}
        mediumStep={2}
        largeStep={4}
        value={text.fontSize.value}
        onChange={updateProperty(TextComponent, 'fontSize')}
        onRelease={commitProperty(TextComponent, 'fontSize')}
        unit="px"
      />
      <InputGroup
        name="FontColor"
        label="Font.color" // {t('editor:properties.text.fontColor')}  /* @todo: Translation id */
      >
        <ColorInput
          value={text.fontColor.value}
          onChange={updateProperty(TextComponent, 'fontColor')}
          onRelease={commitProperty(TextComponent, 'fontColor')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

TextNodeEditor.iconComponent = TextFieldsIcon

export default TextNodeEditor
