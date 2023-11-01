/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Material } from 'three'

import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { MeshComponent } from '@etherealengine/engine/src/scene/components/MeshComponent'

import GeometryEditor from '../geometry/GeometryEditor'
import CollapsibleBlock from '../layout/CollapsibleBlock'
import MaterialEditor from '../materials/MaterialEditor'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

export const MeshNodeEditor: EditorComponentType = (props: { entity: Entity }) => {
  const entity = props.entity
  const { t } = useTranslation()
  const meshComponent = getComponent(entity, MeshComponent)
  return (
    <NodeEditor
      name={t('editor:properties.mesh.name')}
      description={t('editor:properties.mesh.description')}
      {...props}
    >
      <CollapsibleBlock label={t('editor:properties.mesh.geometryEditor')}>
        <GeometryEditor geometry={meshComponent?.geometry ?? null} />
      </CollapsibleBlock>
      <CollapsibleBlock label={t('editor:properties.mesh.materialEditor')}>
        <MaterialEditor material={(meshComponent?.material as Material) ?? null} />
      </CollapsibleBlock>
    </NodeEditor>
  )
}
