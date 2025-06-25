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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { t } from 'i18next'
import React from 'react'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { PoiHotspotComponent } from '@ir-engine/engine/src/scene/components/PoiHotspotComponent'
import { HiOutlineLocationMarker } from 'react-icons/hi'
import InputGroup from '../../input/Group'
import StringInput from '../../input/String'

export const PoiHotspotNodeEditor: EditorComponentType = (props) => {
  const hotspotComponent = useComponent(props.entity, PoiHotspotComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.poiHotspot.name', 'Guided Hotspot')}
      description={t('editor:properties.poiHotspot.description', 'Settings for a hotspot within a point of interest')}
      Icon={PoiHotspotNodeEditor.iconComponent}
      entity={props.entity}
    >
      <InputGroup name="title" label={t('editor:properties.poiHotspot.lbl-title', 'Title')}>
        <StringInput
          value={hotspotComponent.title.value}
          onChange={updateProperty(PoiHotspotComponent, 'title')}
          onRelease={commitProperty(PoiHotspotComponent, 'title')}
        />
      </InputGroup>

      <InputGroup name="description" label={t('editor:properties.poiHotspot.lbl-description', 'Description')}>
        <StringInput
          value={hotspotComponent.description.value}
          onChange={updateProperty(PoiHotspotComponent, 'description')}
          onRelease={commitProperty(PoiHotspotComponent, 'description')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

PoiHotspotNodeEditor.iconComponent = HiOutlineLocationMarker

export default PoiHotspotNodeEditor
