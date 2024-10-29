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

import { getComponent, getMutableComponent, hasComponent, useComponent, UUIDComponent } from '@ir-engine/ecs'
import { commitProperty, EditorComponentType, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { InteractableComponent } from '@ir-engine/engine/src/interaction/components/InteractableComponent'
import { MountPoint, MountPointComponent } from '@ir-engine/engine/src/scene/components/MountPointComponent'
import { NO_PROXY } from '@ir-engine/hyperflux'
import { LuUsers2 } from 'react-icons/lu'
import { Vector3 } from 'three'
import BooleanInput from '../../input/Boolean'
import InputGroup from '../../input/Group'
import SelectInput from '../../input/Select'
import Vector3Input from '../../input/Vector3'

/**
 * MountPointNodeEditor component used to provide the editor view to customize Mount Point properties.
 *
 * @type {Class component}
 */
export const MountPointNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const mountComponent = useComponent(props.entity, MountPointComponent)
  const onChangeOffset = (value: Vector3) => {
    getMutableComponent(props.entity, MountPointComponent).dismountOffset.set(value)
  }
  useEffect(() => {
    if (!hasComponent(props.entity, InteractableComponent)) {
      const mountPoint = getComponent(props.entity, MountPointComponent)
      EditorControlFunctions.addOrRemoveComponent([props.entity], InteractableComponent, true, {
        label: t(MountPointComponent.mountPointInteractMessages[mountPoint.type]),
        callbacks: [
          {
            callbackID: MountPointComponent.mountCallbackName,
            target: getComponent(props.entity, UUIDComponent)
          }
        ]
      })
    }
  }, [])
  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.mountPoint.name')}
      description={t('editor:properties.mountPoint.description')}
      Icon={MountPointNodeEditor.iconComponent}
    >
      <InputGroup name="Mount Type" label={t('editor:properties.mountPoint.lbl-type')}>
        <SelectInput // we dont know the options and the component for this
          key={props.entity}
          value={mountComponent.type.value}
          options={Object.entries(MountPoint).map(([key, value]) => ({ label: key, value }))}
          onChange={commitProperty(MountPointComponent, 'type')}
        />
      </InputGroup>
      <InputGroup name="Dismount Offset" label={t('editor:properties.mountPoint.lbl-dismount')}>
        <Vector3Input
          value={mountComponent.dismountOffset.get(NO_PROXY)}
          onChange={updateProperty(MountPointComponent, 'dismountOffset')}
          onRelease={commitProperty(MountPointComponent, 'dismountOffset')}
        />
      </InputGroup>
      <InputGroup
        name="Force Dismount Offset"
        label={t('editor:properties.mountPoint.lbl-force-dismount')}
        info={t('editor:properties.mountPoint.lbl-force-dismount-info')}
      >
        <BooleanInput
          value={mountComponent.forceDismountPosition.value}
          onChange={updateProperty(MountPointComponent, 'forceDismountPosition')}
          onRelease={commitProperty(MountPointComponent, 'forceDismountPosition')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

MountPointNodeEditor.iconComponent = LuUsers2

export default MountPointNodeEditor
