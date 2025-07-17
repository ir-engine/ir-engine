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

import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdScatterPlot } from 'react-icons/md'

import { getChildrenWithComponents, UUIDComponent } from '@ir-engine/ecs'
import { getComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { commitProperty, EditorComponentType } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { InstancingComponent } from '@ir-engine/engine/src/scene/components/InstancingComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import Checkbox from '../../../../primitives/tailwind/Checkbox'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'

export const InstancingNodeEditor: EditorComponentType = ({ entity }: { entity: Entity }) => {
  const { t } = useTranslation()

  const instancingComponent = useComponent(entity, InstancingComponent)
  const meshEntities = getChildrenWithComponents(entity, [MeshComponent])

  const meshInfos = meshEntities.map((e) => ({
    entity: e,
    mesh: getComponent(e, MeshComponent),
    name: getComponent(e, NameComponent),
    uiud: getComponent(e, UUIDComponent).entityID
  }))

  const { activeMeshEntities } = instancingComponent
  const toggleMesh = (uuid: string) => {
    commitProperty(
      InstancingComponent,
      'activeMeshEntities'
    )({ ...activeMeshEntities.value, [uuid]: !activeMeshEntities.value[uuid] })
  }

  const randomize = () => {
    commitProperty(InstancingComponent, 'seed')(Math.round(Math.random() * 10 ** 5))
  }

  return (
    <NodeEditor
      name={t('editor:properties.instancing.name')}
      description={t('editor:properties.instancing.description')}
      Icon={InstancingNodeEditor.iconComponent}
      entity={entity}
    >
      <InputGroup label={'Settings'}>
        <Checkbox
          checked={instancingComponent.useMesh.value}
          onChange={commitProperty(InstancingComponent, 'useMesh')}
        />
        <NumericInput value={instancingComponent.count.value} onChange={commitProperty(InstancingComponent, 'count')} />
        <NumericInput
          displayPrecision={0}
          value={instancingComponent.seed.value}
          onChange={commitProperty(InstancingComponent, 'seed')}
        />
        <button onClick={randomize}>Randomize</button>
      </InputGroup>
      <InputGroup label={'Meshes'}>
        {meshInfos.map((info, index) => (
          <div key={index}>
            <label>{info.name}</label>
            <Checkbox checked={!!activeMeshEntities.value[info.uiud]} onChange={() => toggleMesh(info.uiud)} />
          </div>
        ))}
      </InputGroup>
    </NodeEditor>
  )
}

InstancingNodeEditor.iconComponent = MdScatterPlot

export default InstancingNodeEditor
