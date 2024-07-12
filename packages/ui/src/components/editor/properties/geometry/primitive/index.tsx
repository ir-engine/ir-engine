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

import { MdInterests } from 'react-icons/md'

import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import {
  EditorComponentType,
  commitProperties,
  commitProperty
} from '@etherealengine/editor/src/components/properties/Util'
import { getEntityErrors } from '@etherealengine/engine/src/scene/components/ErrorComponent'
import { PrimitiveGeometryComponent } from '@etherealengine/engine/src/scene/components/PrimitiveGeometryComponent'
import { GeometryTypeEnum } from '@etherealengine/engine/src/scene/constants/GeometryTypeEnum'
import { NO_PROXY } from '@etherealengine/hyperflux'
import { Geometry } from '@etherealengine/spatial/src/common/constants/Geometry'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import InputGroup from '../../../input/Group'
import SelectInput from '../../../input/Select'
import NodeEditor from '../../nodeEditor'
import ParameterInput from '../../parameter'

/**
 * Types of skyboxes
 *
 * @type {Array}
 */
const GeometryOption = [
  {
    label: 'Box',
    value: GeometryTypeEnum.BoxGeometry
  },
  {
    label: 'Sphere',
    value: GeometryTypeEnum.SphereGeometry
  },
  {
    label: 'Cylinder',
    value: GeometryTypeEnum.CylinderGeometry
  },
  {
    label: 'Capsule',
    value: GeometryTypeEnum.CapsuleGeometry
  },
  {
    label: 'Plane',
    value: GeometryTypeEnum.PlaneGeometry
  },
  {
    label: 'Circle',
    value: GeometryTypeEnum.CircleGeometry
  },
  {
    label: 'Ring',
    value: GeometryTypeEnum.RingGeometry
  },
  {
    label: 'Torus',
    value: GeometryTypeEnum.TorusGeometry
  },
  {
    label: 'Dodecahedron',
    value: GeometryTypeEnum.DodecahedronGeometry
  },
  {
    label: 'Icosahedron',
    value: GeometryTypeEnum.IcosahedronGeometry
  },
  {
    label: 'Octahedron',
    value: GeometryTypeEnum.OctahedronGeometry
  },
  {
    label: 'Tetrahedron',
    value: GeometryTypeEnum.TetrahedronGeometry
  },
  {
    label: 'TorusKnot',
    value: GeometryTypeEnum.TorusKnotGeometry
  }
]

/**
 * SkyboxNodeEditor component class used to render editor view to customize component property.
 *
 * @type {class component}
 */

export const PrimitiveGeometryNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.entity
  const hasError = getEntityErrors(entity, PrimitiveGeometryComponent)
  const primitiveGeometry = useComponent(entity, PrimitiveGeometryComponent)
  const geometry = useComponent(entity, MeshComponent).geometry.get(NO_PROXY) as Geometry & {
    parameters?: Record<string, any>
  }

  const renderPrimitiveGeometrySettings = () => (
    <ParameterInput
      entity={`${props.entity}-primitive-geometry`}
      values={geometry.parameters ?? {}}
      onChange={(key) => commitProperty(PrimitiveGeometryComponent, `geometryParams.${key}` as any)}
    />
  )

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.primitiveGeometry.name')}
      description={t('editor:properties.primitiveGeometry.description')}
      icon={<PrimitiveGeometryNodeEditor.iconComponent />}
    >
      <InputGroup name="Geometry Type" label={t('editor:properties.primitiveGeometry.lbl-geometryType')}>
        <SelectInput
          key={props.entity}
          options={GeometryOption}
          value={primitiveGeometry.geometryType.value}
          onChange={(value: GeometryTypeEnum) => {
            commitProperties(PrimitiveGeometryComponent, { geometryType: value, geometryParams: {} })
          }}
        />
      </InputGroup>
      {renderPrimitiveGeometrySettings()}
    </NodeEditor>
  )
}

PrimitiveGeometryNodeEditor.iconComponent = MdInterests

export default PrimitiveGeometryNodeEditor
