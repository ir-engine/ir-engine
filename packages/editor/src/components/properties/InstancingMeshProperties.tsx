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

import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Mesh } from 'three'

import { getComponent, hasComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { GroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { MeshProperties } from '@etherealengine/engine/src/scene/components/InstancingComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import iterateObject3D from '@etherealengine/engine/src/scene/util/iterateObject3D'
import { State } from '@etherealengine/hyperflux'

import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import CollapsibleBlock from '../layout/CollapsibleBlock'
import { traverseScene } from './Util'

export default function InstancingMeshProperties({
  state,
  onChange,
  ...rest
}: {
  state: State<MeshProperties>
  onChange: (val: MeshProperties) => void
}) {
  const value = state.value
  const props = value as MeshProperties
  const { t } = useTranslation()

  const initialMeshes = traverseScene(
    (node) => {
      const group = getComponent(node, GroupComponent)
      const meshes = group
        .map((obj3d) =>
          iterateObject3D(
            obj3d,
            (child: Mesh) => child,
            (child: Mesh) => child.isMesh
          )
        )
        .flat()
      return meshes.length > 0 ? node : null
    },
    (node) => hasComponent(node, GroupComponent)
  )
    .filter((x) => x !== null)
    .map((node) => {
      return { label: getComponent(node!, NameComponent), value: getComponent(node!, UUIDComponent) }
    })

  const updateProp = useCallback((prop: keyof MeshProperties) => {
    return (val) => {
      state[prop].set(val)
    }
  }, [])

  return (
    <CollapsibleBlock label={t('editor:properties.instancing.mesh.properties')}>
      <InputGroup name="Instanced Mesh" label={t('editor:properties.instancing.mesh.instancedMesh')}>
        <SelectInput
          placeholder={t('editor:properties.instancing.mesh.placeholder-instancedMesh')}
          value={props.instancedMesh}
          onChange={updateProp('instancedMesh')}
          options={initialMeshes}
          creatable={false}
          isSearchable={true}
        />
      </InputGroup>
    </CollapsibleBlock>
  )
}
