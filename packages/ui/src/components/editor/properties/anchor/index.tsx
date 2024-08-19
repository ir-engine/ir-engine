/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import { PersistentAnchorComponent } from '@ir-engine/spatial/src/xr/XRAnchorComponents'
import { MdAnchor } from 'react-icons/md'
import InputGroup from '../../input/Group'
import StringInput from '../../input/String'
import NodeEditor from '../nodeEditor'

export const PersistentAnchorNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const anchor = useComponent(props.entity, PersistentAnchorComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.persistent-anchor.name')}
      description={t('editor:properties.persistent-anchor.description')}
      icon={<PersistentAnchorNodeEditor.iconComponent />}
    >
      <InputGroup name="Volume" label={t('editor:properties.persistent-anchor.lbl-name')}>
        <StringInput
          value={anchor.name.value}
          onChange={updateProperty(PersistentAnchorComponent, 'name')}
          onRelease={commitProperty(PersistentAnchorComponent, 'name')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

PersistentAnchorNodeEditor.iconComponent = MdAnchor

export default PersistentAnchorNodeEditor
