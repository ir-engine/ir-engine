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

import { OverlayComponentState } from '@ir-engine/client-core/src/systems/OverlaySystem'
import capitalizeFirstLetter from '@ir-engine/common/src/utils/capitalizeFirstLetter'
import { getComponent, hasComponent, useComponent, UUIDComponent } from '@ir-engine/ecs'
import { commitProperty, EditorComponentType, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { ImageFileTypes, VideoFileTypes } from '@ir-engine/engine/src/assets/constants/fileTypes'
import {
  InteractableComponent,
  XRUIActivationType
} from '@ir-engine/engine/src/interaction/components/InteractableComponent'
import { getEntityErrors } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { OverlayComponent } from '@ir-engine/engine/src/scene/components/OverlayComponent'
import { getState } from '@ir-engine/hyperflux'
import { BrowserSm } from '../../../../icons'
import FileBrowserInput from '../../input/FileBrowser'
import InputGroup from '../../input/Group'
import SelectInput from '../../input/Select'

const DEFAULT_OPTIONS = [{ label: 'Iframe', value: 'iframe' }]

/**
 * OverlayNodeEditor component used to provide the editor with iframe popup
 */
export const OverlayNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const overlayComponent = useComponent(props.entity, OverlayComponent)
  const errors = getEntityErrors(props.entity, OverlayComponent)

  useEffect(() => {
    if (!hasComponent(props.entity, InteractableComponent)) {
      EditorControlFunctions.addOrRemoveComponent([props.entity], InteractableComponent, true, {
        label: OverlayComponent.interactMessage,
        uiInteractable: false,
        clickInteract: true,
        uiActivationType: XRUIActivationType.hover,
        callbacks: [
          {
            callbackID: OverlayComponent.overlayCallbackName,
            target: getComponent(props.entity, UUIDComponent).entityID
          }
        ]
      })
    }
  }, [])

  const getAvailableOverlayType = () => {
    const state = getState(OverlayComponentState)
    const optionKeys = Object.keys(state)

    if (optionKeys.length === 0) return DEFAULT_OPTIONS

    let options: { label: string; value: string }[] = []
    if (optionKeys.length > 0) {
      options = optionKeys.map((key) => ({
        label: capitalizeFirstLetter(key),
        value: key
      }))
    }

    return [...options]
  }

  const contentSourceGroup = {
    iframe: (
      <FileBrowserInput
        acceptFileTypes={[...ImageFileTypes, ...VideoFileTypes]}
        acceptDropItems={[...ItemTypes.Images, ...ItemTypes.Videos]}
        value={overlayComponent.src.value}
        onChange={updateProperty(OverlayComponent, 'src')}
        onRelease={commitProperty(OverlayComponent, 'src')}
      />
    )
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.overlay.title')}
      description={t('editor:properties.overlay.description')}
      Icon={OverlayNodeEditor.iconComponent}
    >
      {errors
        ? Object.entries(errors).map(([err, message]) => (
            <div key={err} style={{ marginTop: 2, color: '#FF8C00' }}>
              {'Error: ' + err + '--' + message}
            </div>
          ))
        : null}
      <InputGroup
        name={t('editor:properties.overlay.contentSource')}
        label={t('editor:properties.overlay.contentSource')}
        className="flex flex-col gap-2"
      >
        <SelectInput
          key={props.entity}
          value={overlayComponent.type.value}
          options={getAvailableOverlayType()}
          onChange={commitProperty(OverlayComponent, `type`)}
        />
        {contentSourceGroup[overlayComponent.type.value]}
      </InputGroup>
      {/* <InputGroup
        name={t('editor:properties.overlay.overlayPosition')}
        label={t('editor:properties.overlay.overlayPosition')}
      >
        
      </InputGroup> */}
    </NodeEditor>
  )
}

OverlayNodeEditor.iconComponent = BrowserSm

export default OverlayNodeEditor
