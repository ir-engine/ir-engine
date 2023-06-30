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

import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { getEntityErrors } from '@etherealengine/engine/src/scene/components/ErrorComponent'
import { InteriorComponent } from '@etherealengine/engine/src/scene/components/InteriorComponent'

import LocationCityIcon from '@mui/icons-material/LocationCity'

import ImageInput from '../inputs/ImageInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import Vector2Input from '../inputs/Vector2Input'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

/**
 * Interior Editor provides the editor to customize properties.
 *
 * @type {class component}
 */
export const InteriorNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.entity
  const interiorComponent = useComponent(entity, InteriorComponent)
  const errors = getEntityErrors(props.entity, InteriorComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.interior.name')}
      description={t('editor:properties.interior.description')}
    >
      <InputGroup name="Cube Map" label={t('editor:properties.interior.lbl-cubeMap')}>
        <ImageInput value={interiorComponent.cubeMap.value} onChange={updateProperty(InteriorComponent, 'cubeMap')} />
        {errors && <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.interior.error-url')}</div>}
      </InputGroup>
      <InputGroup name="Size" label={t('editor:properties.interior.lbl-size')}>
        <Vector2Input value={interiorComponent.size.value} onChange={updateProperty(InteriorComponent, 'size')} />
      </InputGroup>
      <NumericInputGroup
        name="Tiling"
        label={t('editor:properties.interior.lbl-tiling')}
        min={1}
        smallStep={1.0}
        mediumStep={1.0}
        largeStep={2.0}
        value={interiorComponent.tiling.value}
        onChange={updateProperty(InteriorComponent, 'tiling')}
      />
    </NodeEditor>
  )
}

InteriorNodeEditor.iconComponent = LocationCityIcon

export default InteriorNodeEditor
