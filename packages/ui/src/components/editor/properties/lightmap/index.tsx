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

import { Entity, getComponent, getSimulationCounterpart, setComponent } from '@ir-engine/ecs'
import { commitProperty, EditorComponentType } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { Button } from '@ir-engine/ui'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MdLightbulb } from 'react-icons/md'

import { AtlasingFunctions, UV2UnwrapperState, UVChannel } from '@ir-engine/editor/src/lightmapper/AtlasingFunctions'
import { LightmapBakeComponent } from '@ir-engine/editor/src/lightmapper/LightmapBakeComponent'
import { Lightmapper } from '@ir-engine/editor/src/lightmapper/LightmapperFunctions'
import { EditorState } from '@ir-engine/editor/src/services/EditorServices'
import { LightmapComponent } from '@ir-engine/engine/src/lightmap/LightmapComponent'
import { getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import { LinearFilter, Vector3 } from 'three'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'

const resolutionOptions = [
  { label: '256', value: 256 },
  { label: '512', value: 512 },
  { label: '1024', value: 1024 },
  { label: '2048', value: 2048 }
]

export const LightmapNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const atlasedEntities = useHookstate([] as Entity[])

  const resolutionState = useHookstate(1024)

  const uvChannelState = useHookstate('uv2' as UVChannel)

  const sampleState = useHookstate(1000)

  const handleGenerateAtlas = async () => {
    const entities = await AtlasingFunctions.generateAtlas(getSimulationCounterpart(props.entity), uvChannelState.value)
    if (!entities) return
    const editorState = getState(EditorState)
    const atlasSrc = await AtlasingFunctions.exportAtlasData(
      entities,
      editorState.projectName!,
      'public/scenes/lightmap/' + editorState.sceneName?.substring(0, editorState.sceneName!.lastIndexOf('.')),
      getComponent(props.entity, NameComponent)
    )

    commitProperty(LightmapComponent, 'atlasSrc', [props.entity])(atlasSrc)

    atlasedEntities.set(entities)
  }

  const handleBakeLightmap = async () => {
    if (!atlasedEntities.value.length) console.error('No atlased entities to bake')
    const entities = atlasedEntities.value

    const resolution = resolutionState.value

    const textures = AtlasingFunctions.renderAtlas(
      getComponent(getState(ReferenceSpaceState).viewerEntity, RendererComponent).renderer!,
      entities.map((entity) => getComponent(entity, MeshComponent)),
      resolution,
      true
    )

    const [renderTexture, raycastMesh, orthographicCamera, raycastMaterial] = Lightmapper.initialize(
      getComponent(getState(ReferenceSpaceState).viewerEntity, RendererComponent).renderer!,
      textures.positionTexture,
      textures.normalTexture,
      Lightmapper.getBakeBVH(entities as Entity[]),
      {
        resolution,
        casts: 1,
        lightPosition: new Vector3(),
        lightSize: 1,
        filterMode: LinearFilter,
        directLightEnabled: false,
        indirectLightEnabled: true,
        ambientLightEnabled: true,
        ambientDistance: 1
      }
    )

    setComponent(getSimulationCounterpart(props.entity), LightmapBakeComponent, {
      entities: atlasedEntities.value as Entity[],
      renderTarget: renderTexture,
      raycastMesh,
      orthographicCamera,
      raycastMaterial,
      totalSamples: sampleState.value,
      currentSamples: 0
    })
  }

  const unwrapperLoaded = useMutableState(UV2UnwrapperState).isLoaded

  useEffect(() => {
    if (!unwrapperLoaded.value) {
      UV2UnwrapperState.loadUnwrapper().then(() => unwrapperLoaded.set(true))
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.lightmap.name') || 'Lightmap'}
      description={t('editor:properties.lightmap.description') || 'Lightmap settings for static objects'}
      Icon={LightmapNodeEditor.iconComponent}
    >
      <InputGroup name="Resolution" label={t('editor:properties.lightmap.lbl-resolution') || 'Resolution'}>
        <SelectInput
          options={resolutionOptions}
          value={resolutionState.value}
          onChange={(value) => resolutionState.set(value as number)}
        />
      </InputGroup>
      <InputGroup name="UV Channel" label={t('editor:properties.lightmap.lbl-uv-channel') || 'UV Channel'}>
        <SelectInput
          options={[
            { label: 'UV0', value: '' },
            { label: 'UV1', value: 'uv1' },
            { label: 'UV2', value: 'uv2' },
            { label: 'UV3', value: 'uv3' }
          ]}
          value={uvChannelState.value}
          onChange={(value) => uvChannelState.set(value as UVChannel)}
        />
      </InputGroup>
      <InputGroup name="Samples" label={t('editor:properties.lightmap.lbl-samples') || 'Samples'}>
        <NumericInput
          min={1}
          max={10000}
          smallStep={1}
          mediumStep={10}
          largeStep={100}
          value={sampleState.value}
          onChange={(value) => sampleState.set(value as number)}
        />
      </InputGroup>

      <div className="mt-2 flex flex-col gap-2">
        <Button onClick={handleGenerateAtlas} disabled={!unwrapperLoaded.value}>
          {t('editor:properties.lightmap.btn-generateAtlas') || 'Generate UV2 Atlas'}
        </Button>
        <Button onClick={handleBakeLightmap} disabled={!unwrapperLoaded.value}>
          {t('editor:properties.lightmap.btn-bakeLightmap') || 'Bake Lightmap'}
        </Button>
      </div>
    </NodeEditor>
  )
}

LightmapNodeEditor.iconComponent = MdLightbulb

export default LightmapNodeEditor
