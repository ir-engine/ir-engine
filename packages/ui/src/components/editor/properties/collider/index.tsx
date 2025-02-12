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

import { camelCaseToSpacedString } from '@ir-engine/common/src/utils/camelCaseToSpacedString'
import { hasComponent, SerializedComponentType, useComponent } from '@ir-engine/ecs'
import { commitProperty, EditorComponentType } from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions.ts'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices.ts'
import { ColliderComponent, supportedColliderShapes } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent.ts'
import { Shapes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent.ts'
import { useAncestorWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree.tsx'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FiMinimize2 } from 'react-icons/fi'
import { HiPlus } from 'react-icons/hi2'
import { Vector3 } from 'three'
import { Checkbox } from '../../../../index.ts'
import Button from '../../../../primitives/tailwind/Button'
import Text from '../../../../primitives/tailwind/Text'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import NumericScrubber from '../../input/Numeric/Scrubber'
import SelectInput from '../../input/Select'
import Vector3Input from '../../input/Vector3'

const shapeTypeOptions = Object.entries(Shapes)
  .filter(([_, value]) => supportedColliderShapes.includes(value as any))
  .map(([label, value]) => ({
    label: camelCaseToSpacedString(label),
    value
  }))

export const ColliderComponentEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const colliderComponent = useComponent(props.entity, ColliderComponent)

  const isMeshOrConvexHull =
    colliderComponent.shape.value === Shapes.Mesh || colliderComponent.shape.value === Shapes.ConvexHull

  const showMatchMesh = !isMeshOrConvexHull && hasComponent(props.entity, MeshComponent)
  const hasRigidBody = useAncestorWithComponents(props.entity, [RigidBodyComponent])

  const shape = colliderComponent.shape.value

  const sanitzeAndCommitNumber = <K extends keyof SerializedComponentType<typeof ColliderComponent>>(
    value: number,
    propName: K
  ) => {
    commitProperty(ColliderComponent, propName)(Math.max(0, value) as any)
  }

  const sanitizeAndCommitVector3 = <K extends keyof SerializedComponentType<typeof ColliderComponent>>(
    value: Vector3,
    propName: K
  ) => {
    value.x = Math.max(0, value.x)
    value.y = Math.max(0, value.y)
    value.z = Math.max(0, value.z)
    commitProperty(ColliderComponent, propName)(value as any)
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.collider.name')}
      description={t('editor:properties.collider.description')}
      Icon={ColliderComponentEditor.iconComponent}
    >
      {(!hasRigidBody && (
        <>
          <Text className="ml-5 text-red-400">{t('editor:properties.collider.lbl-warnRigidBody')}</Text>
          <Button
            title={t('editor:properties.collider.lbl-addRigidBody')}
            className="text-sm text-[#FFFFFF]"
            onClick={() => {
              const nodes = SelectionState.getSelectedEntities()
              EditorControlFunctions.addOrRemoveComponent(nodes, RigidBodyComponent, true, { type: 'fixed' })
            }}
          >
            <HiPlus />
            {t('editor:properties.collider.lbl-addRigidBody')}
          </Button>
        </>
      )) ||
        ''}
      <InputGroup name="Shape" label={t('editor:properties.collider.lbl-shape')}>
        <SelectInput
          options={shapeTypeOptions}
          value={colliderComponent.shape.value}
          onChange={commitProperty(ColliderComponent, 'shape')}
        />
      </InputGroup>
      {showMatchMesh && (
        <InputGroup
          label={t('editor:properties.collider.lbl-matchMesh')}
          info={t('editor:properties.collider.info-matchMesh')}
        >
          <Checkbox
            checked={colliderComponent.matchMesh.value}
            onChange={commitProperty(ColliderComponent, 'matchMesh')}
          />
        </InputGroup>
      )}
      <InputGroup
        name="CenterOffset"
        label={t('editor:properties.collider.lbl-centerOffset')}
        disabled={colliderComponent.matchMesh.value}
      >
        <Vector3Input
          disabled={colliderComponent.matchMesh.value}
          value={colliderComponent.centerOffset.value}
          onChange={commitProperty(ColliderComponent, 'centerOffset')}
        />
      </InputGroup>
      {shape === Shapes.Box && (
        <InputGroup
          name="BoxSize"
          label={t('editor:properties.collider.lbl-boxSize')}
          disabled={colliderComponent.matchMesh.value}
        >
          <Vector3Input
            disabled={colliderComponent.matchMesh.value}
            value={colliderComponent.boxSize.value}
            onChange={(value) => sanitizeAndCommitVector3(value, 'boxSize')}
          />
        </InputGroup>
      )}
      {(shape === Shapes.Sphere || shape === Shapes.Capsule || shape === Shapes.Cylinder) && (
        <InputGroup
          name="Radius"
          label={t('editor:properties.collider.lbl-radius')}
          disabled={colliderComponent.matchMesh.value}
        >
          <NumericScrubber
            smallStep={0.001}
            mediumStep={0.01}
            largeStep={0.1}
            disabled={colliderComponent.matchMesh.value}
            value={colliderComponent.radius.value}
            onChange={(value) => sanitzeAndCommitNumber(value, 'radius')}
            onRelease={(value) => sanitzeAndCommitNumber(value, 'radius')}
          />
        </InputGroup>
      )}
      {(shape === Shapes.Capsule || shape === Shapes.Cylinder) && (
        <InputGroup
          name="Height"
          label={t('editor:properties.collider.lbl-height')}
          disabled={colliderComponent.matchMesh.value}
        >
          <NumericScrubber
            smallStep={0.001}
            mediumStep={0.01}
            largeStep={0.1}
            disabled={colliderComponent.matchMesh.value}
            value={colliderComponent.height.value}
            onChange={(value) => sanitzeAndCommitNumber(value, 'height')}
            onRelease={(value) => sanitzeAndCommitNumber(value, 'height')}
          />
        </InputGroup>
      )}
      <InputGroup name="Mass" label={t('editor:properties.collider.lbl-mass')}>
        <NumericScrubber
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={colliderComponent.mass.value}
          onChange={(value) => sanitzeAndCommitNumber(value, 'mass')}
        />
      </InputGroup>
      <InputGroup name="Mass Center" label={t('editor:properties.collider.lbl-massCenter')} className="w-auto">
        <Vector3Input
          value={colliderComponent.massCenter.value}
          onChange={commitProperty(ColliderComponent, 'massCenter')}
        />
      </InputGroup>
      <InputGroup
        name="Friction"
        label={t('editor:properties.collider.lbl-friction')}
        info={t('editor:properties.collider.info-friction')}
      >
        <NumericScrubber
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          min={0}
          value={colliderComponent.friction.value}
          onChange={commitProperty(ColliderComponent, 'friction')}
        />
      </InputGroup>
      <InputGroup
        name="Restitution"
        label={t('editor:properties.collider.lbl-restitution')}
        info={t('editor:properties.collider.info-restitution')}
      >
        <NumericScrubber
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          min={0}
          max={1}
          value={colliderComponent.restitution.value}
          onChange={commitProperty(ColliderComponent, 'restitution')}
        />
      </InputGroup>
      <InputGroup name="Collision Layer" label={t('editor:properties.collider.lbl-collisionLayer')}>
        <NumericInput
          value={colliderComponent.collisionLayer.value}
          onChange={commitProperty(ColliderComponent, 'collisionLayer')}
        />
      </InputGroup>
      <InputGroup name="Collision Mask" label={t('editor:properties.collider.lbl-collisionMask')}>
        <NumericInput
          value={colliderComponent.collisionMask.value}
          onChange={commitProperty(ColliderComponent, 'collisionMask')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

ColliderComponentEditor.iconComponent = FiMinimize2

export default ColliderComponentEditor
