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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { PopupMenuServices } from '@ir-engine/client-core/src/user/components/UserMenu/PopupMenuService'
import { UserMenus } from '@ir-engine/client-core/src/user/UserUISystem'
import { getComponent, hasComponent, useComponent, useEntityContext, UUIDComponent } from '@ir-engine/ecs'
import { commitProperty, EditorComponentType, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import {
  InteractableComponent,
  XRUIActivationType
} from '@ir-engine/engine/src/interaction/components/InteractableComponent'
import { getEntityErrors } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { LiquidCodeComponent } from '@ir-engine/engine/src/scene/components/LiquidCodeComponent'
import { CodeSnippet01Md } from '../../../../icons'
import InputGroup from '../../input/Group'
import { ControlledStringInput } from '../../input/String'

export const LiquidCodeReactor = () => {
  const entity = useEntityContext()
  const liquidCodeComponent = useComponent(entity, LiquidCodeComponent)

  useEffect(() => {
    if (liquidCodeComponent.isOpen.value) {
      PopupMenuServices.showPopupMenu(UserMenus.EmbedFrame, {
        liquidCode: liquidCodeComponent.liquidCode.value
      })
    }
  }, [liquidCodeComponent])

  return null
}

/**
 * LiquidCodeNodeEditor component used to provide the editor with liquid code popup
 */
export const LiquidCodeNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const liquidCodeComponent = useComponent(props.entity, LiquidCodeComponent)
  const errors = getEntityErrors(props.entity, LiquidCodeComponent)

  useEffect(() => {
    // add an interactable component if it doesnt exist (this is required to interact with entity)
    if (!hasComponent(props.entity, InteractableComponent)) {
      EditorControlFunctions.addOrRemoveComponent([props.entity], InteractableComponent, true, {
        label: LiquidCodeComponent.interactMessage,
        uiInteractable: false, // todo: this should be true
        clickInteract: true,
        uiActivationType: XRUIActivationType.hover,
        callbacks: [
          {
            callbackID: LiquidCodeComponent.liquidCodeCallbackName,
            target: getComponent(props.entity, UUIDComponent)
          }
        ]
      })
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.liquidCode.title')}
      description={t('editor:properties.liquidCode.description')}
      Icon={LiquidCodeNodeEditor.iconComponent}
    >
      {errors
        ? Object.entries(errors).map(([err, message]) => (
            <div key={err} style={{ marginTop: 2, color: '#FF8C00' }}>
              {'Error: ' + err + '--' + message}
            </div>
          ))
        : null}
      <InputGroup name="LiquidCode" label={'Liquid Code'}>
        <ControlledStringInput
          value={liquidCodeComponent.liquidCode.value}
          onChange={updateProperty(LiquidCodeComponent, 'liquidCode')}
          onRelease={commitProperty(LiquidCodeComponent, 'liquidCode')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

LiquidCodeNodeEditor.iconComponent = CodeSnippet01Md

export default LiquidCodeNodeEditor
