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

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { hasComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { ScreenshareTargetComponent } from '@etherealengine/engine/src/scene/components/ScreenshareTargetComponent'

import ScreenShareIcon from '@mui/icons-material/ScreenShare'

import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import BooleanInput from '../inputs/BooleanInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

export const ScreenshareTargetNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.entity
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(hasComponent(entity, ScreenshareTargetComponent))
  }, [])

  const onChange = (enable) => {
    setEnabled(enable)
    EditorControlFunctions.addOrRemoveComponent([entity], ScreenshareTargetComponent, enable)
  }

  return (
    <NodeEditor
      {...props}
      component={ScreenshareTargetComponent}
      name={t('editor:properties.screenshare.name')}
      description={t('editor:properties.screenshare.description')}
    >
      <BooleanInput value={enabled} onChange={onChange} />
    </NodeEditor>
  )
}

ScreenshareTargetNodeEditor.iconComponent = ScreenShareIcon

export default ScreenshareTargetNodeEditor
