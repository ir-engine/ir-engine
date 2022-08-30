import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Euler, Quaternion } from 'three'

import { API } from '@xrengine/client-core/src/API'
import { PortalDetail } from '@xrengine/common/src/interfaces/PortalInterface'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { PortalComponent } from '@xrengine/engine/src/scene/components/PortalComponent'
import { PortalEffects, PortalPreviewTypes } from '@xrengine/engine/src/scene/functions/loaders/PortalFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'

import { executeModifyPropertyCommand, setPropertyOnSelectionEntities } from '../../classes/History'
import { uploadCubemapBakeToServer } from '../../functions/uploadEnvMapBake'
import BooleanInput from '../inputs/BooleanInput'
import { Button } from '../inputs/Button'
import EulerInput from '../inputs/EulerInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import StringInput, { ControlledStringInput } from '../inputs/StringInput'
import Vector3Input from '../inputs/Vector3Input'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

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
  const portalName = getComponent(props.node.entity, NameComponent).name
  const transformComponent = getComponent(props.node.entity, TransformComponent)

  useEffect(() => {
    loadPortals()
  }, [])

  const loadPortals = async () => {
    const portalsDetail: PortalDetail[] = []
    try {
      portalsDetail.push(...(await API.instance.client.service('portal').find()).data)
      console.log('portalsDetail', portalsDetail, props.node.uuid)
    } catch (error) {
      throw new Error(error)
    }
    setPortals(
      portalsDetail
        .filter((portal) => portal.portalEntityId !== props.node.uuid)
        .map(({ portalEntityId, portalEntityName, sceneName }) => {
          return { value: portalEntityId, label: sceneName + ': ' + portalEntityName }
        })
    )
  }

  const bakeCubemap = async () => {
    const url = await uploadCubemapBakeToServer(portalName, transformComponent.position)
    loadPortals()
    executeModifyPropertyCommand({
      component: PortalComponent,
      properties: [{ previewImageURL: url }],
      affectedNodes: [props.node]
    })
  }

  const changeSpawnRotation = (value: Euler) => {
    rotation.setFromEuler(value)

    setPropertyOnSelectionEntities({
      component: PortalComponent,
      properties: [{ spawnRotation: rotation }]
    })
  }

  const changePreviewType = (val) => {
    setPropertyOnSelectionEntities({
      component: PortalComponent,
      properties: [{ previewType: val }]
    })
    loadPortals()
  }

  const portalComponent = getComponent(props.node.entity, PortalComponent)

  return (
    <NodeEditor description={t('editor:properties.portal.description')} {...props}>
      <InputGroup name="Location" label={t('editor:properties.portal.lbl-locationName')}>
        <StringInput value={portalComponent.location} onChange={updateProperty(PortalComponent, 'location')} />
      </InputGroup>
      <InputGroup name="Portal" label={t('editor:properties.portal.lbl-portal')}>
        <SelectInput
          key={props.node.entity}
          options={portals}
          value={portalComponent.linkedPortalId}
          onChange={updateProperty(PortalComponent, 'linkedPortalId')}
          filterOption={(option: PortalFilterOption, searchString: string) => {
            return option.label.includes(searchString || '')
          }}
          getOptionLabel={(data) => data.name}
        />
      </InputGroup>
      <InputGroup name="Portal" label={t('editor:properties.portal.lbl-redirect')}>
        <BooleanInput onChange={updateProperty(PortalComponent, 'redirect')} value={portalComponent.redirect} />
      </InputGroup>
      <InputGroup name="Effect Type" label={t('editor:properties.portal.lbl-effectType')}>
        <SelectInput
          key={props.node.entity}
          options={Array.from(PortalEffects.keys()).map((val) => {
            return { value: val, label: val }
          })}
          value={portalComponent.effectType}
          onChange={updateProperty(PortalComponent, 'effectType')}
        />
      </InputGroup>
      <InputGroup name="Preview Type" label={t('editor:properties.portal.lbl-previewType')}>
        <SelectInput
          key={props.node.entity}
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
