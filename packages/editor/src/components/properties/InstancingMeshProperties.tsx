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
