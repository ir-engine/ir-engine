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

import { createEntity, getComponent, Layers, setComponent, SourceID, UUIDComponent } from '@ir-engine/ecs'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import React from 'react'
import { MeshBasicMaterial } from 'three'
import { MaterialStateComponent } from '../../../../spatial/src/renderer/materials/MaterialComponent'
import MaterialEditor from './materialeditor'

export default {
  title: 'editor/panels/properties/MaterialEditor',
  component: MaterialEditor,
  parameters: {
    componentSubtitle: 'MaterialEditor',
    design: {
      type: 'figma',
      url: ''
    }
  }
}

const MaterialEditorRenderer = (args) => {
  const simulationEntity = createEntity(Layers.Authoring)
  setComponent(simulationEntity, UUIDComponent, {
    entitySourceID: 'storybook' as SourceID,
    entityID: UUIDComponent.generate()
  })
  setComponent(simulationEntity, NameComponent, 'test object ')
  setComponent(simulationEntity, MaterialStateComponent, { material: new MeshBasicMaterial() })
  const uuid = getComponent(simulationEntity, UUIDComponent)

  return <MaterialEditor entity={simulationEntity} />
}
export const Default = {
  args: {},
  render: MaterialEditorRenderer
}
