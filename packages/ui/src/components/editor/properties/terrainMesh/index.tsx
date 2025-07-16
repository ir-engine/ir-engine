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

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import DroppableImageInput from '@ir-engine/editor/src/components/assets/DroppableImageInput'
import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { TerrainMeshComponent } from '@ir-engine/engine/src/scene/components/TerrainMeshComponent'
import { Checkbox } from '@ir-engine/ui'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { GiMountains } from 'react-icons/gi'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'

/**
 * TerrainMeshNodeEditor component used to provide the editor view to customize Terrain Mesh properties.
 */
const TerrainMeshNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const terrainMeshComponent = useComponent(props.entity, TerrainMeshComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.terrainMesh.name', 'Terrain Mesh')}
      description={t(
        'editor:properties.terrainMesh.description',
        'A terrain mesh with physics and triplanar texturing'
      )}
      Icon={TerrainMeshNodeEditor.iconComponent}
    >
      <InputGroup
        name="HeightmapURL"
        label={t('editor:properties.terrainMesh.lbl-heightmap', 'Heightmap')}
        info={t('editor:properties.terrainMesh.info-heightmap', 'Grayscale image used to define terrain height')}
      >
        <DroppableImageInput
          src={terrainMeshComponent.heightmapURL.value}
          onBlur={commitProperty(TerrainMeshComponent, 'heightmapURL')}
        />
      </InputGroup>

      <InputGroup name="Width" label={t('editor:properties.terrainMesh.lbl-width', 'Width')}>
        <NumericInput
          min={1}
          max={1000}
          smallStep={1}
          mediumStep={10}
          largeStep={100}
          value={terrainMeshComponent.width.value}
          onChange={updateProperty(TerrainMeshComponent, 'width')}
          onRelease={commitProperty(TerrainMeshComponent, 'width')}
        />
      </InputGroup>

      <InputGroup name="Height" label={t('editor:properties.terrainMesh.lbl-height', 'Height')}>
        <NumericInput
          min={1}
          max={1000}
          smallStep={1}
          mediumStep={10}
          largeStep={100}
          value={terrainMeshComponent.height.value}
          onChange={updateProperty(TerrainMeshComponent, 'height')}
          onRelease={commitProperty(TerrainMeshComponent, 'height')}
        />
      </InputGroup>

      <InputGroup name="Depth" label={t('editor:properties.terrainMesh.lbl-depth', 'Depth')}>
        <NumericInput
          min={1}
          max={1000}
          smallStep={1}
          mediumStep={10}
          largeStep={100}
          value={terrainMeshComponent.depth.value}
          onChange={updateProperty(TerrainMeshComponent, 'depth')}
          onRelease={commitProperty(TerrainMeshComponent, 'depth')}
        />
      </InputGroup>

      <InputGroup
        name="WidthSegments"
        label={t('editor:properties.terrainMesh.lbl-widthSegments', 'Width Segments')}
        info={t(
          'editor:properties.terrainMesh.info-segments',
          'Higher values create more detailed terrain but impact performance'
        )}
      >
        <NumericInput
          min={1}
          max={500}
          smallStep={1}
          mediumStep={10}
          largeStep={50}
          value={terrainMeshComponent.widthSegments.value}
          onChange={updateProperty(TerrainMeshComponent, 'widthSegments')}
          onRelease={commitProperty(TerrainMeshComponent, 'widthSegments')}
        />
      </InputGroup>

      <InputGroup name="DepthSegments" label={t('editor:properties.terrainMesh.lbl-depthSegments', 'Depth Segments')}>
        <NumericInput
          min={1}
          max={500}
          smallStep={1}
          mediumStep={10}
          largeStep={50}
          value={terrainMeshComponent.depthSegments.value}
          onChange={updateProperty(TerrainMeshComponent, 'depthSegments')}
          onRelease={commitProperty(TerrainMeshComponent, 'depthSegments')}
        />
      </InputGroup>
      <InputGroup
        name="EnablePhysics"
        label={t('editor:properties.terrainMesh.lbl-enablePhysics', 'Enable Physics')}
        info={t('editor:properties.terrainMesh.info-enablePhysics', 'Creates a heightfield collider for the terrain')}
      >
        <Checkbox
          checked={terrainMeshComponent.enablePhysics.value}
          onChange={commitProperty(TerrainMeshComponent, 'enablePhysics')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

TerrainMeshNodeEditor.iconComponent = GiMountains

export default TerrainMeshNodeEditor
