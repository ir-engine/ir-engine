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
import { PiLinkBreak } from 'react-icons/pi'

import { getComponent, hasComponent, useComponent, UUIDComponent } from '@ir-engine/ecs'
import { commitProperty, EditorComponentType, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import {
  InteractableComponent,
  XRUIActivationType
} from '@ir-engine/engine/src/interaction/components/InteractableComponent'
import { getEntityErrors } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { LinkComponent } from '@ir-engine/engine/src/scene/components/LinkComponent'
import BooleanInput from '../../input/Boolean'
import InputGroup from '../../input/Group'
import { ControlledStringInput } from '../../input/String'

/**
 * LinkNodeEditor component used to provide the editor view to customize link properties.
 */
export const LinkNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const linkComponent = useComponent(props.entity, LinkComponent)
  const errors = getEntityErrors(props.entity, LinkComponent)

  useEffect(() => {
    if (!hasComponent(props.entity, InteractableComponent)) {
      EditorControlFunctions.addOrRemoveComponent([props.entity], InteractableComponent, true, {
        label: LinkComponent.interactMessage,
        uiInteractable: false,
        clickInteract: true,
        uiActivationType: XRUIActivationType.hover,
        callbacks: [
          {
            callbackID: LinkComponent.linkCallbackName,
            target: getComponent(props.entity, UUIDComponent)
          }
        ]
      })
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.linkComp.title')}
      description={t('editor:properties.linkComp.description')}
      Icon={LinkNodeEditor.iconComponent}
    >
      {errors
        ? Object.entries(errors).map(([err, message]) => (
            <div key={err} style={{ marginTop: 2, color: '#FF8C00' }}>
              {'Error: ' + err + '--' + message}
            </div>
          ))
        : null}
      {/* <InputGroup name="Navigate Path" label={t('editor:properties.linkComp.lbl-navigateScene')}>
        <BooleanInput value={linkComponent.sceneNav.value} onChange={commitProperty(LinkComponent, 'sceneNav')} />
      </InputGroup>

      {linkComponent.sceneNav.value ? (
        <InputGroup name="Location" label={t('editor:properties.linkComp.lbl-locaiton')}>
          <ControlledStringInput
            value={linkComponent.location.value}
            onChange={updateProperty(LinkComponent, 'location')}
            onRelease={commitProperty(LinkComponent, 'location')}
          />
        </InputGroup>
      ) : (
        <InputGroup name="LinkUrl" label={t('editor:properties.linkComp.lbl-url')}>
          <ControlledStringInput
            value={linkComponent.url.value}
            onChange={updateProperty(LinkComponent, 'url')}
            onRelease={commitProperty(LinkComponent, 'url')}
          />
        </InputGroup>
      )} */}
      <InputGroup name="Redirect" label={t('editor:properties.linkComp.lbl-newTab')}>
        <BooleanInput value={linkComponent.newTab.value} onChange={commitProperty(LinkComponent, 'newTab')} />
      </InputGroup>
      <InputGroup name="LinkUrl" label={t('editor:properties.linkComp.lbl-url')}>
        <ControlledStringInput
          value={linkComponent.url.value}
          onChange={updateProperty(LinkComponent, 'url')}
          onRelease={commitProperty(LinkComponent, 'url')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

LinkNodeEditor.iconComponent = PiLinkBreak

export default LinkNodeEditor
