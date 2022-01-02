import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import EulerInput from '../inputs/EulerInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import StringInput, { ControlledStringInput } from '../inputs/StringInput'
import Vector3Input from '../inputs/Vector3Input'
import NodeEditor from './NodeEditor'
import { CommandManager } from '../../managers/CommandManager'
import { client } from '@xrengine/client-core/src/feathers'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import { PortalDetail } from '@xrengine/common/src/interfaces/PortalInterface'
import { PortalComponent } from '@xrengine/engine/src/scene/components/PortalComponent'
import { EditorComponentType } from './Util'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { Euler } from 'three'
import { updatePortal } from '@xrengine/engine/src/scene/functions/loaders/PortalFunctions'

type PortalOptions = {
  name: string
  value: string
}

type PortalFilterOption = {
  label: string
  value: string
  data: PortalOptions
}

const euler = new Euler()

/**
 * PortalNodeEditor provides the editor for properties of PortalNode.
 *
 * @author Josh Field <github.com/HexaField>
 * @type {class component}
 */
export const PortalNodeEditor: EditorComponentType = (props) => {
  let [portals, setPortals] = useState<Array<{ value: string; name: string }>>([])
  let [entityId, setEntityId] = useState('')
  const { t } = useTranslation()

  const onChangeValue = (prop) => (value) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component: PortalComponent,
      properties: { [prop]: value }
    })
  }

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
          return { value: portalEntityId, name: sceneName }
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

  const portalComponent = getComponent(props.node.entity, PortalComponent)
  const helperTransform = getComponent(portalComponent.helper, TransformComponent)
  euler.setFromQuaternion(helperTransform.rotation)

  return (
    <NodeEditor description={t('editor:properties.portal.description')} {...props}>
      <InputGroup name="Location" label={t('editor:properties.portal.lbl-locationName')}>
        <StringInput value={portalComponent.location} onChange={onChangeValue('location')} />
      </InputGroup>
      <InputGroup name="Portal" label={t('editor:properties.portal.lbl-portal')}>
        <SelectInput
          options={portals}
          value={portalComponent.linkedPortalId}
          onChange={onChangeValue('linkedPortalId')}
          filterOption={(option: PortalFilterOption, searchString: string) => {
            return option.label.includes(searchString || '')
          }}
          getOptionLabel={(data) => data.name}
        />
      </InputGroup>
      {/* TODO */}
      {/* <InputGroup name="Cubemap Bake" label={t('editor:properties.portal.lbl-cubemapBake')}>
        <SelectInput
          options={Engine.scene.children
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
          onChange={onChangeCubemapBake}
        />
      </InputGroup> */}
      <InputGroup name="Spawn Position" label={t('editor:properties.portal.lbl-spawnPosition')}>
        <Vector3Input value={helperTransform.position} onChange={onChangeValue('spawnPosition')} />
      </InputGroup>
      <InputGroup name="Spawn Rotation" label={t('editor:properties.portal.lbl-spawnRotation')}>
        <EulerInput value={euler} onChange={onChangeValue('spawnRotation')} />
      </InputGroup>
    </NodeEditor>
  )
}

PortalNodeEditor.iconComponent = MeetingRoomIcon

export default PortalNodeEditor
