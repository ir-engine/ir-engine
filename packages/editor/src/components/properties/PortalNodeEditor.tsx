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

import { debounce } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Euler, Quaternion } from 'three'

import { API } from '@etherealengine/client-core/src/API'
import { PortalDetail } from '@etherealengine/common/src/interfaces/PortalInterface'
import { getComponent, useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import {
  PortalComponent,
  PortalEffects,
  PortalPreviewTypes
} from '@etherealengine/engine/src/scene/components/PortalComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'

import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'

import { getPreviewBakeTexture, uploadCubemapBakeToServer } from '../../functions/uploadEnvMapBake'
import BooleanInput from '../inputs/BooleanInput'
import { Button } from '../inputs/Button'
import EulerInput from '../inputs/EulerInput'
import ImagePreviewInput from '../inputs/ImagePreviewInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import { ControlledStringInput } from '../inputs/StringInput'
import Vector3Input from '../inputs/Vector3Input'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperties, updateProperty } from './Util'

type PortalOptions = {
  name: string
  value: string
}

type PortalFilterOption = {
  label: string
  value: string
  data: PortalOptions
}

const rotation = new Quaternion()

/**
 * PortalNodeEditor provides the editor for properties of PortalNode.
 *
 * @type {class component}
 */
export const PortalNodeEditor: EditorComponentType = (props) => {
  const [portals, setPortals] = useState<Array<{ value: string; label: string }>>([])
  const [bufferUrl, setBufferUrl] = useState<string>('')

  const { t } = useTranslation()
  const transformComponent = useComponent(props.entity, TransformComponent)
  const portalComponent = useComponent(props.entity, PortalComponent)

  useEffect(() => {
    loadPortals()
  }, [])

  const updateCubeMapBake = async () => {
    const imageBlob = await getPreviewBakeTexture(transformComponent.value.position)
    const url = URL.createObjectURL(imageBlob)
    setBufferUrl(url)
  }

  const updateCubeMapBakeDebounced = useCallback(debounce(updateCubeMapBake, 500), []) //ms

  useEffect(() => {
    updateCubeMapBakeDebounced()
    return () => {
      updateCubeMapBakeDebounced.cancel()
    }
  }, [transformComponent.position])

  const loadPortals = async () => {
    const portalsDetail: PortalDetail[] = []
    try {
      portalsDetail.push(...(await API.instance.client.service('portal').find()).data)
      console.log('portalsDetail', portalsDetail, getComponent(props.entity, UUIDComponent))
    } catch (error) {
      throw new Error(error)
    }
    setPortals(
      portalsDetail
        .filter((portal) => portal.portalEntityId !== getComponent(props.entity, UUIDComponent))
        .map(({ portalEntityId, portalEntityName, sceneName }) => {
          return { value: portalEntityId, label: sceneName + ': ' + portalEntityName }
        })
    )
  }

  const bakeCubemap = async () => {
    const url = await uploadCubemapBakeToServer(
      getComponent(props.entity, NameComponent),
      transformComponent.position.value
    )
    loadPortals()
    updateProperties(PortalComponent, { previewImageURL: url }, [props.entity])
  }

  const changeSpawnRotation = (value: Euler) => {
    rotation.setFromEuler(value)

    updateProperties(PortalComponent, { spawnRotation: rotation })
  }

  const changePreviewType = (val) => {
    updateProperties(PortalComponent, { previewType: val })
    loadPortals()
  }

  return (
    <NodeEditor description={t('editor:properties.portal.description')} {...props}>
      <InputGroup name="Location" label={t('editor:properties.portal.lbl-locationName')}>
        <ControlledStringInput
          value={portalComponent.location.value}
          onChange={updateProperty(PortalComponent, 'location')}
        />
      </InputGroup>
      <InputGroup name="Portal" label={t('editor:properties.portal.lbl-portal')}>
        <SelectInput
          key={props.entity}
          options={portals}
          value={portalComponent.linkedPortalId.value}
          onChange={updateProperty(PortalComponent, 'linkedPortalId')}
        />
      </InputGroup>
      <InputGroup name="Portal" label={t('editor:properties.portal.lbl-redirect')}>
        <BooleanInput onChange={updateProperty(PortalComponent, 'redirect')} value={portalComponent.redirect.value} />
      </InputGroup>
      <InputGroup name="Effect Type" label={t('editor:properties.portal.lbl-effectType')}>
        <SelectInput
          key={props.entity}
          options={Array.from(PortalEffects.keys()).map((val) => {
            return { value: val, label: val }
          })}
          value={portalComponent.effectType.value}
          onChange={updateProperty(PortalComponent, 'effectType')}
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
        />
      </InputGroup>
      <InputGroup name="Preview Image Bake" label={t('editor:properties.portal.lbl-previewImage')}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: 'auto', display: 'flex', flexDirection: 'row' }}>
            <Button
              style={{ width: '100%', fontSize: '11px', overflow: 'hidden' }}
              type="submit"
              onClick={() => {
                bakeCubemap()
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
              {t('editor:properties.portal.lbl-previewImage')}
            </Button>
          </div>
          <ImagePreviewInput value={bufferUrl} />
        </div>
      </InputGroup>
      <InputGroup name="Spawn Position" label={t('editor:properties.portal.lbl-spawnPosition')}>
        <Vector3Input
          value={portalComponent.spawnPosition.value}
          onChange={updateProperty(PortalComponent, 'spawnPosition')}
        />
      </InputGroup>
      <InputGroup name="Spawn Rotation" label={t('editor:properties.portal.lbl-spawnRotation')}>
        <EulerInput quaternion={portalComponent.spawnRotation.value ?? rotation} onChange={changeSpawnRotation} />
      </InputGroup>
    </NodeEditor>
  )
}

PortalNodeEditor.iconComponent = MeetingRoomIcon

export default PortalNodeEditor
