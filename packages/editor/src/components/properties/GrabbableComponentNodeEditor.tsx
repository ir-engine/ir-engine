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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { isClient } from '@etherealengine/common/src/utils/getEnvironment'
import { getComponent, hasComponent, UUIDComponent } from '@etherealengine/ecs'
import NodeEditor from '@etherealengine/editor/src/components/properties/NodeEditor'
import { EditorComponentType } from '@etherealengine/editor/src/components/properties/Util'
import { GrabbableComponent } from '@etherealengine/engine/src/interaction/components/GrabbableComponent'
import { InteractableComponent } from '@etherealengine/engine/src/interaction/components/InteractableComponent'
import { grabbableInteractMessage } from '@etherealengine/engine/src/interaction/functions/grabbableFunctions'

import { EditorControlFunctions } from '../../functions/EditorControlFunctions'

export const GrabbableComponentNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  useEffect(() => {
    if (isClient) {
      if (!hasComponent(props.entity, InteractableComponent)) {
        EditorControlFunctions.addOrRemoveComponent([props.entity], InteractableComponent, true, {
          label: grabbableInteractMessage,
          callbacks: [
            {
              callbackID: GrabbableComponent.grabbableCallbackName,
              target: getComponent(props.entity, UUIDComponent)
            }
          ]
        })
      }
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.grabbable.name')}
      description={t('editor:properties.grabbable.description')}
    >
      <div id={'grabbable-component'}></div>
    </NodeEditor>
  )
}
