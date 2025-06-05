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

import { MdInterests } from 'react-icons/md'

import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import {
  EditorComponentType,
  commitProperties,
  commitProperty,
  updateProperty
} from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { PrimitiveGeometryComponent } from '@ir-engine/engine/src/scene/components/PrimitiveGeometryComponent'
import { GeometryType, GeometryTypeParamsEnum } from '@ir-engine/engine/src/scene/constants/GeometryTypeEnum'
import InputGroup from '../../../input/Group'
import NumericInput from '../../../input/Numeric'
import SelectInput from '../../../input/Select'

/**
 * Types of skyboxes
 *
 * @type {Array}
 */
const GeometryOption = [
  {
    label: 'Box',
    value: GeometryType.BoxGeometry
  },
  {
    label: 'Sphere',
    value: GeometryType.SphereGeometry
  },
  {
    label: 'Cylinder',
    value: GeometryType.CylinderGeometry
  },
  {
    label: 'Capsule',
    value: GeometryType.CapsuleGeometry
  },
  {
    label: 'Plane',
    value: GeometryType.PlaneGeometry
  },
  {
    label: 'Circle',
    value: GeometryType.CircleGeometry
  },
  {
    label: 'Ring',
    value: GeometryType.RingGeometry
  },
  {
    label: 'Torus',
    value: GeometryType.TorusGeometry
  },
  {
    label: 'Dodecahedron',
    value: GeometryType.DodecahedronGeometry
  },
  {
    label: 'Icosahedron',
    value: GeometryType.IcosahedronGeometry
  },
  {
    label: 'Octahedron',
    value: GeometryType.OctahedronGeometry
  },
  {
    label: 'Tetrahedron',
    value: GeometryType.TetrahedronGeometry
  },
  {
    label: 'TorusKnot',
    value: GeometryType.TorusKnotGeometry
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
  const primitiveGeometry = useComponent(entity, PrimitiveGeometryComponent)
  const primitiveGeometryParams = GeometryTypeParamsEnum[primitiveGeometry.geometryType.value] || {}
  /** @todo properties should be explicit rather than generated from the geometry parameters */
  // const geometry = useOptionalComponent(entity, MeshComponent)?.geometry.get(NO_PROXY) as Geometry & {
  //   parameters?: Record<string, any>
  // }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.primitiveGeometry.name')}
      description={t('editor:properties.primitiveGeometry.description')}
      Icon={PrimitiveGeometryNodeEditor.iconComponent}
    >
      <InputGroup name="Geometry Type" label={t('editor:properties.primitiveGeometry.lbl-geometryType')}>
        <SelectInput
          key={props.entity}
          options={GeometryOption}
          value={primitiveGeometry.geometryType.value}
          onChange={(value: GeometryType) => {
            commitProperties(PrimitiveGeometryComponent, {
              geometryType: value,
              geometryParams: Object.fromEntries(
                Object.entries(GeometryTypeParamsEnum[value] || {}).map(([key, config]) => [key, config.default])
              )
            })
          }}
        />
      </InputGroup>
      {Object.entries(primitiveGeometryParams).map(([key, config]: [string, any]) => (
        <InputGroup name={key} label={key}>
          <NumericInput
            min={config.min}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={primitiveGeometry.geometryParams[key].value}
            onChange={updateProperty(PrimitiveGeometryComponent, `geometryParams.${key}` as any)}
            onRelease={commitProperty(PrimitiveGeometryComponent, `geometryParams.${key}` as any)}
          />
        </InputGroup>
      ))}
    </NodeEditor>
  )
}

PrimitiveGeometryNodeEditor.iconComponent = MdInterests

export default PrimitiveGeometryNodeEditor
