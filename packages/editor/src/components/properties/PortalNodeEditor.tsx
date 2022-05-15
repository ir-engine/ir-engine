import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Euler, Quaternion } from 'three'

import { client } from '@xrengine/client-core/src/feathers'
import { PortalDetail } from '@xrengine/common/src/interfaces/PortalInterface'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { PortalComponent } from '@xrengine/engine/src/scene/components/PortalComponent'

import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'

import { setPropertyOnSelectionEntities } from '../../classes/History'
import BooleanInput from '../inputs/BooleanInput'
import EulerInput from '../inputs/EulerInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
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
 * @author Josh Field <github.com/HexaField>
 * @type {class component}
 */
export const PortalNodeEditor: EditorComponentType = (props) => {
  const [portals, setPortals] = useState<Array<{ value: string; label: string }>>([])
  const [entityId, setEntityId] = useState('')
  const { t } = useTranslation()

  const loadPortals = async () => {
    const portalsDetail: PortalDetail[] = []
    try {
      portalsDetail.push(...(await client.service('portal').find()).data)
      console.log('portalsDetail', portalsDetail, props.node.uuid)
    } catch (error) {
      throw new Error(error)
    }
    setPortals(
      portalsDetail
        .filter((portal) => portal.portalEntityId !== props.node.uuid)
        .map(({ portalEntityId, sceneName }) => {
          return { value: portalEntityId, label: sceneName }
        })
    )
  }

  useEffect(() => {
    if (props.node.uuid !== entityId) {
      setEntityId(props.node.uuid)
      loadPortals()
    }
  }, [props.node.uuid, entityId])

  useEffect(() => {
    setEntityId(props.node.uuid)
    loadPortals()
  }, [])

  const changeSpawnRotation = (value: Euler) => {
    rotation.setFromEuler(value)

    setPropertyOnSelectionEntities({
      component: PortalComponent,
      properties: { spawnRotation: rotation }
    })
  }

  const portalComponent = getComponent(props.node.entity, PortalComponent)

  return (
    <NodeEditor description={t('editor:properties.portal.description')} {...props}>
      <InputGroup name="Location" label={t('editor:properties.portal.lbl-locationName')}>
        <StringInput value={portalComponent.location} onChange={updateProperty(PortalComponent, 'location')} />
      </InputGroup>
      <InputGroup name="Portal" label={t('editor:properties.portal.lbl-portal')}>
        <SelectInput
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
      {/* TODO */}
      {/* <InputGroup name="Cubemap Bake" label={t('editor:properties.portal.lbl-cubemapBake')}>
        <SelectInput
          options={Engine.instance.currentWorld.scene.children
            .filter((obj: Object3D) => {
              return (obj as any).nodeName === CubemapBakeportalComponent.nodeName
            })
            .map((obj: Object3D) => {
              return {
                label: obj.name,
                value: obj.uuid
              }
            })}
          value={portalComponent.cubemapBakeId}
          onChange={updateProperty(PortalComponent, 'cubemapBakeId')}
        />
      </InputGroup> */}
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
