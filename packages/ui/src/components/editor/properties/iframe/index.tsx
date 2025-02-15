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

import { getComponent, hasComponent, useComponent } from '@ir-engine/ecs'
import { commitProperty, EditorComponentType, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { NodeIDComponent } from '@ir-engine/engine/src/gltf/NodeIDComponent'
import {
  InteractableComponent,
  XRUIActivationType
} from '@ir-engine/engine/src/interaction/components/InteractableComponent'
import { getEntityErrors } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { IFrameComponent } from '@ir-engine/engine/src/scene/components/IFrameComponent'
import { CodeSnippet01Md } from '../../../../icons'
import InputGroup from '../../input/Group'
import { ControlledStringInput } from '../../input/String'

/**
 * IFrameNodeEditor component used to provide the editor with iframe popup
 */
export const IFrameNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const iframeComponent = useComponent(props.entity, IFrameComponent)
  const errors = getEntityErrors(props.entity, IFrameComponent)

  useEffect(() => {
    // add an interactable component if it doesnt exist (this is required to interact with entity)
    if (!hasComponent(props.entity, InteractableComponent)) {
      EditorControlFunctions.addOrRemoveComponent([props.entity], InteractableComponent, true, {
        label: IFrameComponent.interactMessage,
        uiInteractable: false, // todo: this should be true
        clickInteract: true,
        uiActivationType: XRUIActivationType.hover,
        callbacks: [
          {
            callbackID: IFrameComponent.iframeCallbackName,
            target: getComponent(props.entity, NodeIDComponent)
          }
        ]
      })
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.iframe.title')}
      description={t('editor:properties.iframe.description')}
      Icon={IFrameNodeEditor.iconComponent}
    >
      {errors
        ? Object.entries(errors).map(([err, message]) => (
            <div key={err} style={{ marginTop: 2, color: '#FF8C00' }}>
              {'Error: ' + err + '--' + message}
            </div>
          ))
        : null}
      <InputGroup name="IFrame" label={'IFrame'}>
        <ControlledStringInput
          value={iframeComponent.src.value}
          onChange={updateProperty(IFrameComponent, 'src')}
          onRelease={commitProperty(IFrameComponent, 'src')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

IFrameNodeEditor.iconComponent = CodeSnippet01Md

export default IFrameNodeEditor
