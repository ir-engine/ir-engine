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

import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Euler, Quaternion, Vector3 } from 'three'

import { spawnPointPath } from '@etherealengine/common/src/schema.type.module'
import { UUIDComponent } from '@etherealengine/ecs'
import { getComponent, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { imageDataToBlob } from '@etherealengine/engine/src/scene/classes/ImageUtils'
import {
  PortalComponent,
  PortalEffects,
  PortalPreviewTypes
} from '@etherealengine/engine/src/scene/components/PortalComponent'
import { useHookstate } from '@etherealengine/hyperflux'
import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'

import { bakeEnvmapTexture, uploadCubemapBakeToServer } from '../../functions/uploadEnvMapBake'
import BooleanInput from '../inputs/BooleanInput'
import { Button } from '../inputs/Button'
import EulerInput from '../inputs/EulerInput'
import ImagePreviewInput from '../inputs/ImagePreviewInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import StringInput, { ControlledStringInput } from '../inputs/StringInput'
import Vector3Input from '../inputs/Vector3Input'
import NodeEditor from './NodeEditor'
import { commitProperties, commitProperty, EditorComponentType, updateProperty } from './Util'

type PortalOptions = {
  label: string
  value: string
}

const rotation = new Quaternion()

/**
 * PortalNodeEditor provides the editor for properties of PortalNode.
 *
 * @type {class component}
 */
export const PortalNodeEditor: EditorComponentType = (props) => {
  const state = useHookstate({
    previewImageData: null as ImageData | null,
    previewImageURL: ''
  })

  const spawnPointQuery = useFind(spawnPointPath) // todo pagination UI
  const availableSpawnPoints = spawnPointQuery.data
    .filter((portal) => portal.id !== getComponent(props.entity, UUIDComponent))
    .map(({ id, name, sceneId: sceneID }) => {
      return { value: id, label: sceneID + ': ' + name }
    }) as PortalOptions[]

  const { t } = useTranslation()
  const transformComponent = useComponent(props.entity, TransformComponent)
  const portalComponent = useComponent(props.entity, PortalComponent)

  const updateCubeMapBake = async () => {
    const imageData = await bakeEnvmapTexture(
      transformComponent.value.position.clone().add(new Vector3(0, 2, 0).multiply(transformComponent.scale.value))
    )
    const blob = await imageDataToBlob(imageData)
    state.previewImageData.set(imageData)
    state.previewImageURL.set(URL.createObjectURL(blob!))
  }

  const uploadEnvmap = async () => {
    if (!state.previewImageData.value) return
    const url = await uploadCubemapBakeToServer(getComponent(props.entity, NameComponent), state.previewImageData.value)
    commitProperties(PortalComponent, { previewImageURL: url }, [props.entity])
  }

  const changeSpawnRotation = (value: Euler) => {
    rotation.setFromEuler(value)

    commitProperties(PortalComponent, { spawnRotation: rotation })
  }

  const changePreviewType = (val) => {
    commitProperties(PortalComponent, { previewType: val })
  }

  return (
    <NodeEditor description={t('editor:properties.portal.description')} {...props}>
      <InputGroup name="Location" label={t('editor:properties.portal.lbl-locationName')}>
        <StringInput
          value={portalComponent.location.value}
          onChange={updateProperty(PortalComponent, 'location')}
          onRelease={commitProperty(PortalComponent, 'location')}
        />
      </InputGroup>
      <InputGroup name="Portal" label={t('editor:properties.portal.lbl-portal')}>
        <SelectInput
          key={props.entity}
          options={availableSpawnPoints}
          value={portalComponent.linkedPortalId.value}
          onChange={commitProperty(PortalComponent, 'linkedPortalId')}
        />
      </InputGroup>
      <InputGroup name="Portal" label={t('editor:properties.portal.lbl-redirect')}>
        <BooleanInput onChange={commitProperty(PortalComponent, 'redirect')} value={portalComponent.redirect.value} />
      </InputGroup>
      <InputGroup name="Effect Type" label={t('editor:properties.portal.lbl-effectType')}>
        <SelectInput
          key={props.entity}
          options={Array.from(PortalEffects.keys()).map((val) => {
            return { value: val, label: val }
          })}
          value={portalComponent.effectType.value}
          onChange={commitProperty(PortalComponent, 'effectType')}
        />
      </InputGroup>
      <InputGroup name="Preview Type" label={t('editor:properties.portal.lbl-previewType')}>
        <SelectInput
          key={props.entity}
          options={Array.from(PortalPreviewTypes.values()).map((val) => {
            return { value: val, label: val }
          })}
          value={portalComponent.previewType.value}
          onChange={changePreviewType}
        />
      </InputGroup>
      <InputGroup name="Saved Image URL" label={t('editor:properties.portal.lbl-savedImageURL')}>
        <ControlledStringInput
          value={portalComponent.previewImageURL.value}
          onChange={updateProperty(PortalComponent, 'previewImageURL')}
          onRelease={commitProperty(PortalComponent, 'previewImageURL')}
        />
      </InputGroup>
      <InputGroup name="Preview Image Bake" label={t('editor:properties.portal.lbl-generateImage')}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: 'auto', display: 'flex', flexDirection: 'row' }}>
            <Button
              style={{ width: '100%', fontSize: '11px', overflow: 'hidden' }}
              type="submit"
              onClick={() => {
                uploadEnvmap()
              }}
            >
              {t('editor:properties.portal.lbl-saveImage')}
            </Button>
            <Button
              style={{ width: '100%', fontSize: '11px', overflow: 'hidden' }}
              type="submit"
              onClick={() => {
                updateCubeMapBake()
              }}
            >
              {t('editor:properties.portal.lbl-generateImage')}
            </Button>
          </div>
          <ImagePreviewInput value={state.previewImageURL.value ?? portalComponent.previewImageURL.value} />
        </div>
      </InputGroup>
      <InputGroup name="Spawn Position" label={t('editor:properties.portal.lbl-spawnPosition')}>
        <Vector3Input
          value={portalComponent.spawnPosition.value}
          onChange={updateProperty(PortalComponent, 'spawnPosition')}
          onRelease={commitProperty(PortalComponent, 'spawnPosition')}
        />
      </InputGroup>
      <InputGroup name="Spawn Rotation" label={t('editor:properties.portal.lbl-spawnRotation')}>
        <EulerInput
          quaternion={portalComponent.spawnRotation.value ?? rotation}
          onChange={changeSpawnRotation}
          onRelease={() =>
            commitProperty(PortalComponent, 'spawnRotation')(getComponent(props.entity, PortalComponent).spawnRotation)
          }
        />
      </InputGroup>
    </NodeEditor>
  )
}

PortalNodeEditor.iconComponent = MeetingRoomIcon

export default PortalNodeEditor
