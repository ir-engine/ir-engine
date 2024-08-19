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

import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, EntityUUID } from '@ir-engine/ecs/src/Entity'
import { EditorComponentType } from '@ir-engine/editor/src/components/properties/Util'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { GiMeshBall } from 'react-icons/gi'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'
import { Material } from 'three'
import Accordion from '../../../../primitives/tailwind/Accordion'
import MaterialEditor from '../../panels/Properties/material'
import NodeEditor from '../nodeEditor'
import GeometryEditor from './geometryEditor'

const MeshNodeEditor: EditorComponentType = (props: { entity: Entity }) => {
  const entity = props.entity
  const { t } = useTranslation()
  const meshComponent = getComponent(entity, MeshComponent)
  return (
    <NodeEditor
      name={t('editor:properties.mesh.name')}
      description={t('editor:properties.mesh.description')}
      icon={<MeshNodeEditor.iconComponent />}
      {...props}
    >
      <Accordion
        title={t('editor:properties.mesh.geometryEditor')}
        expandIcon={<HiPlusSmall />}
        shrinkIcon={<HiMinus />}
      >
        <GeometryEditor geometry={meshComponent?.geometry ?? null} />
      </Accordion>
      <Accordion
        title={t('editor:properties.mesh.materialEditor')}
        expandIcon={<HiPlusSmall />}
        shrinkIcon={<HiMinus />}
      >
        <MaterialEditor materialUUID={((meshComponent?.material as Material).uuid as EntityUUID) ?? null} />
      </Accordion>
    </NodeEditor>
  )
}

MeshNodeEditor.iconComponent = GiMeshBall

export default MeshNodeEditor
