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

import { useComponent } from '@ir-engine/ecs'
import { EditorComponentType } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { SpawnPointComponent } from '@ir-engine/engine/src/scene/components/SpawnPointComponent'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { RiCameraLensFill } from 'react-icons/ri'

/**
 * SpawnPointNodeEditor component used to provide the editor view to customize Spawn Point properties.
 */
export const SpawnPointNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const spawnComponent = useComponent(props.entity, SpawnPointComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.spawnPoint.name')}
      description={t('editor:properties.spawnPoint.description')}
      Icon={SpawnPointNodeEditor.iconComponent}
    ></NodeEditor>
  )
}

SpawnPointNodeEditor.iconComponent = RiCameraLensFill

export default SpawnPointNodeEditor
