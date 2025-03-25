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

import React from 'react'
import { useTranslation } from 'react-i18next'

import { UUIDComponent } from '@ir-engine/ecs'
import { getComponent, Layers, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, EntityUUID } from '@ir-engine/ecs/src/Entity'
import { EditorComponentType } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import MaterialEditor from '@ir-engine/editor/src/panels/properties/materialeditor'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { MaterialInstanceComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { GiMeshBall } from 'react-icons/gi'
import Accordion from '../../../../primitives/tailwind/Accordion'
import GeometryEditor from './geometryEditor'

const materialIsInAuthoringLayer = (materialUUID: EntityUUID): boolean => {
  return !!UUIDComponent.getEntityByUUID(materialUUID, Layers.Authoring)
}

const MeshNodeEditor: EditorComponentType = (props: { entity: Entity }) => {
  const entity = props.entity
  const { t } = useTranslation()
  const meshComponent = getComponent(entity, MeshComponent)
  const materialInstanceComponent = useComponent(entity, MaterialInstanceComponent)

  return (
    <NodeEditor
      name={t('editor:properties.mesh.name')}
      description={t('editor:properties.mesh.description')}
      Icon={MeshNodeEditor.iconComponent}
      {...props}
    >
      <Accordion title={t('editor:properties.mesh.geometryEditor')}>
        <GeometryEditor geometry={meshComponent?.geometry ?? null} />
      </Accordion>
      {materialInstanceComponent.value.uuid.map((materialUUID) => {
        if (!materialIsInAuthoringLayer(materialUUID)) return null
        return (
          <Accordion title={t('editor:properties.mesh.materialEditor')} key={materialUUID}>
            <MaterialEditor materialUUID={materialUUID} />
          </Accordion>
        )
      })}
    </NodeEditor>
  )
}

MeshNodeEditor.iconComponent = GiMeshBall

export default MeshNodeEditor
