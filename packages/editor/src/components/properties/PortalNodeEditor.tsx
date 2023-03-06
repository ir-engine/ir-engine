import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Euler, Quaternion } from 'three'

import { API } from '@etherealengine/client-core/src/API'
import { PortalDetail } from '@etherealengine/common/src/interfaces/PortalInterface'
import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import {
  PortalComponent,
  PortalEffects,
  PortalPreviewTypes
} from '@etherealengine/engine/src/scene/components/PortalComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'

import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'

import { uploadCubemapBakeToServer } from '../../functions/uploadEnvMapBake'
import BooleanInput from '../inputs/BooleanInput'
import { Button } from '../inputs/Button'
import EulerInput from '../inputs/EulerInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import StringInput, { ControlledStringInput } from '../inputs/StringInput'
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
  const { t } = useTranslation()
  const portalName = getComponent(props.entity, NameComponent)
  const transformComponent = getComponent(props.entity, TransformComponent)

  useEffect(() => {
    loadPortals()
  }, [])

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
    const url = await uploadCubemapBakeToServer(portalName, transformComponent.position)
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

  const portalComponent = getComponent(props.entity, PortalComponent)

  return (
    <NodeEditor description={t('editor:properties.portal.description')} {...props}>
      <InputGroup name="Location" label={t('editor:properties.portal.lbl-locationName')}>
        <StringInput value={portalComponent.location} onChange={updateProperty(PortalComponent, 'location')} />
      </InputGroup>
      <InputGroup name="Portal" label={t('editor:properties.portal.lbl-portal')}>
        <SelectInput
          key={props.entity}
          options={portals}
          value={portalComponent.linkedPortalId}
          onChange={updateProperty(PortalComponent, 'linkedPortalId')}
        />
      </InputGroup>
      <InputGroup name="Portal" label={t('editor:properties.portal.lbl-redirect')}>
        <BooleanInput onChange={updateProperty(PortalComponent, 'redirect')} value={portalComponent.redirect} />
      </InputGroup>
      <InputGroup name="Effect Type" label={t('editor:properties.portal.lbl-effectType')}>
        <SelectInput
          key={props.entity}
          options={Array.from(PortalEffects.keys()).map((val) => {
            return { value: val, label: val }
          })}
          value={portalComponent.effectType}
          onChange={updateProperty(PortalComponent, 'effectType')}
        />
      </InputGroup>
      <InputGroup name="Preview Type" label={t('editor:properties.portal.lbl-previewType')}>
        <SelectInput
          key={props.entity}
          options={Array.from(PortalPreviewTypes.values()).map((val) => {
            return { value: val, label: val }
          })}
          value={portalComponent.previewType}
          onChange={changePreviewType}
        />
      </InputGroup>
      <InputGroup name="Preview Image URL" label={t('editor:properties.portal.lbl-previewImageURL')}>
        <ControlledStringInput
          value={portalComponent.previewImageURL}
          onChange={updateProperty(PortalComponent, 'previewImageURL')}
        />
      </InputGroup>
      <InputGroup name="Preview Image Bake" label={t('editor:properties.portal.lbl-createPreviewImage')}>
        <Button style={{ width: 'auto', fontSize: '11px' }} type="submit" onClick={bakeCubemap}>
          {t('editor:properties.portal.lbl-createPreviewImage')}
        </Button>
      </InputGroup>
      <InputGroup name="Spawn Position" label={t('editor:properties.portal.lbl-spawnPosition')}>
        <Vector3Input
          value={portalComponent.spawnPosition}
          onChange={updateProperty(PortalComponent, 'spawnPosition')}
        />
      </InputGroup>
      <InputGroup name="Spawn Rotation" label={t('editor:properties.portal.lbl-spawnRotation')}>
        <EulerInput quaternion={portalComponent.spawnRotation ?? rotation} onChange={changeSpawnRotation} />
      </InputGroup>
    </NodeEditor>
  )
}

PortalNodeEditor.iconComponent = MeetingRoomIcon

export default PortalNodeEditor
