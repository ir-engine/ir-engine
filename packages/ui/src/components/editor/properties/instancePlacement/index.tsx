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

import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdScatterPlot } from 'react-icons/md'

/** @todo add UI workflows for these */
import './createHeightmap'
import './createTopDownMask'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import DroppableImageInput from '@ir-engine/editor/src/components/assets/DroppableImageInput'
import { commitProperty, EditorComponentType, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { InstancingPlacementComponent } from '@ir-engine/engine/src/scene/components/InstancingComponent'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'

export const InstancingPlacementNodeEditor: EditorComponentType = (props: { entity: Entity }) => {
  const { t } = useTranslation()
  const entity = props.entity

  const instancingPlacementComponent = useComponent(entity, InstancingPlacementComponent)

  return (
    <NodeEditor
      name={t('editor:properties.instancingPlacement.name', 'Instance Placement')}
      description={t(
        'editor:properties.instancingPlacement.description',
        'Procedurally place instances using heightmap and mask textures'
      )}
      Icon={InstancingPlacementNodeEditor.iconComponent}
      {...props}
    >
      <InputGroup
        name="HeightmapTexture"
        label={t('editor:properties.instancingPlacement.lbl-heightmap', 'Heightmap Texture')}
        info={t(
          'editor:properties.instancingPlacement.info-heightmap',
          'Grayscale texture used to determine instance height placement'
        )}
      >
        <DroppableImageInput
          src={instancingPlacementComponent.heightmapTexture.value}
          onBlur={commitProperty(InstancingPlacementComponent, 'heightmapTexture')}
        />
      </InputGroup>

      <InputGroup
        name="MaskTexture"
        label={t('editor:properties.instancingPlacement.lbl-mask', 'Mask Texture')}
        info={t(
          'editor:properties.instancingPlacement.info-mask',
          'Black and white texture to control where instances can be placed'
        )}
      >
        <DroppableImageInput
          src={instancingPlacementComponent.maskTexture.value}
          onBlur={commitProperty(InstancingPlacementComponent, 'maskTexture')}
        />
      </InputGroup>

      <InputGroup
        name="Count"
        label={t('editor:properties.instancingPlacement.lbl-count', 'Instance Count')}
        info={t('editor:properties.instancingPlacement.info-count', 'Number of instances to place')}
      >
        <NumericInput
          min={1}
          max={100000}
          smallStep={1}
          mediumStep={10}
          largeStep={100}
          value={instancingPlacementComponent.count.value}
          onChange={updateProperty(InstancingPlacementComponent, 'count')}
          onRelease={commitProperty(InstancingPlacementComponent, 'count')}
        />
      </InputGroup>

      <InputGroup
        name="Width"
        label={t('editor:properties.instancingPlacement.lbl-width', 'Placement Width')}
        info={t('editor:properties.instancingPlacement.info-width', 'Width of the placement area in world units')}
      >
        <NumericInput
          min={1}
          max={10000}
          smallStep={1}
          mediumStep={10}
          largeStep={100}
          value={instancingPlacementComponent.width.value}
          onChange={updateProperty(InstancingPlacementComponent, 'width')}
          onRelease={commitProperty(InstancingPlacementComponent, 'width')}
          unit="m"
        />
      </InputGroup>

      <InputGroup
        name="Length"
        label={t('editor:properties.instancingPlacement.lbl-length', 'Placement Length')}
        info={t('editor:properties.instancingPlacement.info-length', 'Length of the placement area in world units')}
      >
        <NumericInput
          min={1}
          max={10000}
          smallStep={1}
          mediumStep={10}
          largeStep={100}
          value={instancingPlacementComponent.length.value}
          onChange={updateProperty(InstancingPlacementComponent, 'length')}
          onRelease={commitProperty(InstancingPlacementComponent, 'length')}
          unit="m"
        />
      </InputGroup>

      <InputGroup
        name="Height"
        label={t('editor:properties.instancingPlacement.lbl-height', 'Height Scale')}
        info={t('editor:properties.instancingPlacement.info-height', 'Maximum height multiplier for heightmap values')}
      >
        <NumericInput
          min={0}
          max={1000}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={instancingPlacementComponent.height.value}
          onChange={updateProperty(InstancingPlacementComponent, 'height')}
          onRelease={commitProperty(InstancingPlacementComponent, 'height')}
          unit="m"
        />
      </InputGroup>

      <InputGroup
        name="RandomPositionWeight"
        label={t('editor:properties.instancingPlacement.lbl-randomPosition', 'Random Position')}
        info={t(
          'editor:properties.instancingPlacement.info-randomPosition',
          'Amount of random position offset to apply to instances'
        )}
      >
        <NumericInput
          min={0}
          max={100}
          smallStep={0.1}
          mediumStep={1}
          largeStep={5}
          value={instancingPlacementComponent.randomPositionWeight.value}
          onChange={updateProperty(InstancingPlacementComponent, 'randomPositionWeight')}
          onRelease={commitProperty(InstancingPlacementComponent, 'randomPositionWeight')}
          unit="m"
        />
      </InputGroup>

      <InputGroup
        name="RandomRotationWeight"
        label={t('editor:properties.instancingPlacement.lbl-randomRotation', 'Random Rotation')}
        info={t(
          'editor:properties.instancingPlacement.info-randomRotation',
          'Amount of random rotation to apply to instances (0-1 range)'
        )}
      >
        <NumericInput
          min={0}
          max={1}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={0.25}
          value={instancingPlacementComponent.randomRotationWeight.value}
          onChange={updateProperty(InstancingPlacementComponent, 'randomRotationWeight')}
          onRelease={commitProperty(InstancingPlacementComponent, 'randomRotationWeight')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

InstancingPlacementNodeEditor.iconComponent = MdScatterPlot

export default InstancingPlacementNodeEditor
