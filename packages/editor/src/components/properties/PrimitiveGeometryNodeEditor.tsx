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

import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { getEntityErrors } from '@etherealengine/engine/src/scene/components/ErrorComponent'
import { PrimitiveGeometryComponent } from '@etherealengine/engine/src/scene/components/PrimitiveGeometryComponent'
import { GeometryTypeEnum } from '@etherealengine/engine/src/scene/constants/GeometryTypeEnum'

import InterestsIcon from '@mui/icons-material/Interests'

import {
  BoxGeometry,
  CapsuleGeometry,
  CircleGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  OctahedronGeometry,
  PlaneGeometry,
  RingGeometry,
  SphereGeometry,
  TetrahedronGeometry,
  TorusGeometry,
  TorusKnotGeometry
} from 'three'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, commitProperty } from './Util'

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

  const renderPrimitiveGeometrySettings = () => <></>

  // creating editor view for equirectangular Settings
  // Function for BoxGeometry settings
  const renderBoxGeometrySettings = () => (
    <InputGroup name="Box" label={t('editor:properties.primitiveGeometry.lbl-box')}>
      {/* Add your specific settings for BoxGeometry here */}
    </InputGroup>
  )

  // Function for SphereGeometry settings
  const renderSphereGeometrySettings = () => (
    <InputGroup name="Sphere" label={t('editor:properties.primitiveGeometry.lbl-sphere')}>
      {/* Add your specific settings for SphereGeometry here */}
    </InputGroup>
  )

  // Function for CylinderGeometry settings
  const renderCylinderGeometrySettings = () => (
    <InputGroup name="Cylinder" label={t('editor:properties.primitiveGeometry.lbl-cylinder')}>
      {/* Add your specific settings for CylinderGeometry here */}
    </InputGroup>
  )

  // Define similar functions for other geometry types
  const renderCapsuleGeometrySettings = () => (
    <InputGroup name="Capsule" label={t('editor:properties.primitiveGeometry.lbl-capsule')}>
      {/* Add your specific settings for CapsuleGeometry here */}
    </InputGroup>
  )

  const renderPlaneGeometrySettings = () => (
    <InputGroup name="Plane" label={t('editor:properties.primitiveGeometry.lbl-plane')}>
      {/* Add your specific settings for PlaneGeometry here */}
    </InputGroup>
  )

  const renderCircleGeometrySettings = () => (
    <InputGroup name="Circle" label={t('editor:properties.primitiveGeometry.lbl-circle')}>
      {/* Add your specific settings for CircleGeometry here */}
    </InputGroup>
  )

  const renderRingGeometrySettings = () => (
    <InputGroup name="Ring" label={t('editor:properties.primitiveGeometry.lbl-ring')}>
      {/* Add your specific settings for RingGeometry here */}
    </InputGroup>
  )

  const renderTorusGeometrySettings = () => (
    <InputGroup name="Torus" label={t('editor:properties.primitiveGeometry.lbl-torus')}>
      {/* Add your specific settings for TorusGeometry here */}
    </InputGroup>
  )

  const renderPolyhedronGeometrySettings = () => (
    <InputGroup name="Polyhedron" label={t('editor:properties.primitiveGeometry.lbl-polyhedron')}>
      {/* Add your specific settings for TetrahedronGeometry here */}
    </InputGroup>
  )

  const renderTorusKnotGeometrySettings = () => (
    <InputGroup name="Torus Knot" label={t('editor:properties.primitiveGeometry.lbl-torusknot')}>
      {/* Add your specific settings for TorusKnotGeometry here */}
    </InputGroup>
  )

  // creating editor view for skybox Properties
  const renderPrimitiveGeometryProps = () => {
    switch (primitiveGeometry.geometry.constructor) {
      case BoxGeometry:
        return renderBoxGeometrySettings()
      case SphereGeometry:
        return renderSphereGeometrySettings()
      case CylinderGeometry:
        return renderCylinderGeometrySettings()
      case CapsuleGeometry:
        return renderCapsuleGeometrySettings()
      case PlaneGeometry:
        return renderPlaneGeometrySettings()
      case CircleGeometry:
        return renderCircleGeometrySettings()
      case RingGeometry:
        return renderRingGeometrySettings()
      case TorusGeometry:
        return renderTorusGeometrySettings()
      case TorusKnotGeometry:
        return renderTorusKnotGeometrySettings()
      case DodecahedronGeometry:
      case IcosahedronGeometry:
      case OctahedronGeometry:
      case TetrahedronGeometry:
        return renderPolyhedronGeometrySettings()
      default:
        return renderPrimitiveGeometrySettings()
    }
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.primitiveGeometry.name')}
      description={t('editor:properties.primitiveGeometry.description')}
    >
      <InputGroup name="Geometry Type" label={t('editor:properties.primitiveGeometry.lbl-geometryType')}>
        <SelectInput
          key={props.entity}
          options={GeometryOption}
          value={primitiveGeometry.geometryType.value}
          onChange={commitProperty(PrimitiveGeometryComponent, 'geometryType')}
        />
      </InputGroup>
      {renderPrimitiveGeometryProps()}
    </NodeEditor>
  )
}

PrimitiveGeometryNodeEditor.iconComponent = InterestsIcon

export default PrimitiveGeometryNodeEditor
