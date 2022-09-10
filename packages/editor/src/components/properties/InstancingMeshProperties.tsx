import React from 'react'
import { useTranslation } from 'react-i18next'
import { Mesh } from 'three'

import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { MeshProperties } from '@xrengine/engine/src/scene/components/InstancingComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import iterateObject3D from '@xrengine/engine/src/scene/util/iterateObject3D'

import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import CollapsibleBlock from '../layout/CollapsibleBlock'
import { traverseScene } from './Util'

export default function InstancingMeshProperties({ value, onChange, ...rest }) {
  const props = value as MeshProperties

  const { t } = useTranslation()

  const initialMeshes = traverseScene(
    (node) => {
      const obj3d = getComponent(node.entity, Object3DComponent).value
      const meshes = iterateObject3D(
        obj3d,
        (child: Mesh) => child,
        (child: Mesh) => child.isMesh
      )
      return meshes.length > 0 ? node : null
    },
    (node) => hasComponent(node.entity, Object3DComponent)
  )
    .filter((x) => x !== null)
    .map((node) => {
      return { label: getComponent(node!.entity, NameComponent)?.name, value: node!.uuid }
    })

  function updateProp(prop: keyof MeshProperties) {
    return (val) => {
      props[prop] = val
      onChange(props)
    }
  }

  return (
    <CollapsibleBlock label={t('editor:properties.instancing.mesh.properties')}>
      <InputGroup name="Instanced Mesh" label={t('editor:properties.instancing.mesh.instancedMesh')}>
        <SelectInput
          error={t('editor:properties.instancing.mesh.error-instancedMesh')}
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
