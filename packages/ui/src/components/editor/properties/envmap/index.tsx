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

import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { EnvMapBakeComponent } from '@ir-engine/engine/src/scene/components/EnvMapBakeComponent'
import { EnvMapComponent } from '@ir-engine/engine/src/scene/components/EnvmapComponent'
import { getEntityErrors } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { EnvMapSourceType } from '@ir-engine/engine/src/scene/constants/EnvMapEnum'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'

import { UUIDComponent } from '@ir-engine/ecs'
import { useQuery } from '@ir-engine/ecs/src/QueryFunctions'
import DroppableImageInput from '@ir-engine/editor/src/components/assets/DroppableImageInput'
import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { Slider } from '@ir-engine/ui/editor'
import { IoMapOutline } from 'react-icons/io5'
import Button from '../../../../primitives/tailwind/Button'
import ColorInput from '../../../../primitives/tailwind/Color'
import FolderInput from '../../input/Folder'
import InputGroup from '../../input/Group'
import SelectInput from '../../input/Select'

/**
 * EnvMapSourceOptions array containing SourceOptions for Envmap
 */
const EnvMapSourceOptions = Object.values(EnvMapSourceType).map((value) => ({ label: value, value }))

/**
 * EnvMapEditor provides the editor view for environment map property customization.
 */
export const EnvMapEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.entity

  const bakeEntities = useQuery([EnvMapBakeComponent]).map((entity) => {
    return {
      label: getComponent(entity, NameComponent),
      value: getComponent(entity, UUIDComponent).entityID
    }
  })

  const onChangeCubemapURLSource = useCallback((value) => {
    const directory = value[value.length - 1] === '/' ? value.substring(0, value.length - 1) : value
    commitProperty(EnvMapComponent, 'envMapCubemapURL')(directory)
  }, [])

  const envmapComponent = useComponent(entity, EnvMapComponent)

  const errors = getEntityErrors(props.entity, EnvMapComponent)

  return (
    <NodeEditor
      {...props}
      component={EnvMapComponent}
      name={t('editor:properties.envmap.name')}
      description={t('editor:properties.envmap.description')}
      Icon={EnvMapEditor.iconComponent}
    >
      <InputGroup name="Envmap Source" label={t('editor:properties.envmap.lbl-source')} className="w-auto">
        <SelectInput
          key={props.entity}
          options={EnvMapSourceOptions}
          value={envmapComponent.type.value}
          onChange={commitProperty(EnvMapComponent, 'type')}
        />
      </InputGroup>
      {envmapComponent.type.value === EnvMapSourceType.Color && (
        <InputGroup name="EnvMapColor" label={t('editor:properties.envmap.lbl-color')}>
          <ColorInput
            value={envmapComponent.envMapSourceColor.value}
            onChange={commitProperty(EnvMapComponent, 'envMapSourceColor')}
            onRelease={commitProperty(EnvMapComponent, 'envMapSourceColor')}
          />
        </InputGroup>
      )}
      {envmapComponent.type.value === EnvMapSourceType.Bake && (
        <InputGroup name="EnvMapBake" label={t('editor:properties.envmap.lbl-bake')}>
          <SelectInput
            options={bakeEntities}
            value={envmapComponent.envMapSourceEntityUUID.value}
            onChange={commitProperty(EnvMapComponent, 'envMapSourceEntityUUID')}
          />
        </InputGroup>
      )}
      {(envmapComponent.type.value === EnvMapSourceType.Cubemap ||
        envmapComponent.type.value === EnvMapSourceType.Equirectangular) && (
        <div>
          <InputGroup name="Texture URL" label={t('editor:properties.envmap.lbl-textureUrl')}>
            {envmapComponent.type.value === EnvMapSourceType.Cubemap && (
              <FolderInput value={envmapComponent.envMapCubemapURL.value} onRelease={onChangeCubemapURLSource} />
            )}
            {envmapComponent.type.value === EnvMapSourceType.Equirectangular && (
              <DroppableImageInput
                src={envmapComponent.envMapSourceURL.value}
                onBlur={commitProperty(EnvMapComponent, 'envMapSourceURL')}
                onChange={updateProperty(EnvMapComponent, 'envMapSourceURL')}
              />
            )}
            {errors?.MISSING_FILE && (
              <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.scene.error-url')}</div>
            )}
          </InputGroup>
        </div>
      )}
      {envmapComponent.type.value === EnvMapSourceType.Probes && (
        <Button
          onClick={() => {
            commitProperty(EnvMapComponent, 'type')(EnvMapSourceType.None)
            setTimeout(() => {
              commitProperty(EnvMapComponent, 'type')(EnvMapSourceType.Probes)
            }, 1000)
          }}
        >
          {t('editor:properties.envmap.bake-reflection-probes')}
        </Button>
      )}
      <div className="w-full py-1.5 pl-8 pr-3.5">
        {envmapComponent.type.value !== EnvMapSourceType.None && (
          <Slider
            min={0}
            step={0.01}
            max={10}
            value={envmapComponent.envMapIntensity.value}
            onChange={updateProperty(EnvMapComponent, 'envMapIntensity')}
            onRelease={commitProperty(EnvMapComponent, 'envMapIntensity')}
            aria-label="EnvMap Intensity"
            label={t('editor:properties.envmap.lbl-intensity')}
            info={t('editor:properties.envmap.info-intensity')}
          />
        )}
      </div>
    </NodeEditor>
  )
}
EnvMapEditor.iconComponent = IoMapOutline
export default EnvMapEditor
