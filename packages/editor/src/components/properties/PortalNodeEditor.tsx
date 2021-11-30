import { DoorOpen } from '@styled-icons/fa-solid'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Object3D } from 'three'
import PortalNode from '../../nodes/PortalNode'
import CubemapBakeNode from '../../nodes/CubemapBakeNode'
import EulerInput from '../inputs/EulerInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import { ControlledStringInput } from '../inputs/StringInput'
import Vector3Input from '../inputs/Vector3Input'
import NodeEditor from './NodeEditor'
import { CommandManager } from '../../managers/CommandManager'
import { client } from '@xrengine/client-core/src/feathers'
import { PortalDetail } from '@xrengine/common/src/interfaces/PortalInterface'
import { useEngine } from '@xrengine/engine/src/ecs/classes/Engine'

type PortalNodeEditorProps = {
  node?: PortalNode
}

type PortalOptions = {
  name: string
  value: string
}

type PortalFilterOption = {
  label: string
  value: string
  data: PortalOptions
}

type PortalNodeEditorStates = {
  portals: PortalOptions[]
  entityId: string
}

/**
 * PortalNodeEditor provides the editor for properties of PortalNode.
 *
 * @author Josh Field <github.com/HexaField>
 * @type {class component}
 */
export const PortalNodeEditor = (props: PortalNodeEditorProps) => {
  let [portals, setPortals] = useState([])
  let [entityId, setEntityId] = useState('')
  const { t } = useTranslation()

  const onChangeLocationName = (locationName) => {
    CommandManager.instance.setPropertyOnSelection('locationName', locationName)
  }

  const onChangeLinkedPortalId = (linkedPortalId) => {
    CommandManager.instance.setPropertyOnSelection('linkedPortalId', linkedPortalId)
  }

  const onChangeModelUrl = (modelUrl) => {
    CommandManager.instance.setPropertyOnSelection('modelUrl', modelUrl)
  }

  const onChangeDisplayText = (displayText) => {
    CommandManager.instance.setPropertyOnSelection('displayText', displayText)
  }

  const onChangeSpawnPosition = (spawnPosition) => {
    CommandManager.instance.setPropertyOnSelection('spawnPosition', spawnPosition)
  }

  const onChangeSpawnRotation = (spawnRotation) => {
    CommandManager.instance.setPropertyOnSelection('spawnRotation', spawnRotation)
  }

  const onChangeTriggerPosition = (triggerPosition) => {
    CommandManager.instance.setPropertyOnSelection('triggerPosition', triggerPosition)
  }

  const onChangeTriggerRotation = (triggerRotation) => {
    CommandManager.instance.setPropertyOnSelection('triggerRotation', triggerRotation)
  }

  const onChangeTriggerScale = (triggerScale) => {
    CommandManager.instance.setPropertyOnSelection('triggerScale', triggerScale)
  }

  const onChangeCubemapBake = (cubemapBakeId) => {
    CommandManager.instance.setPropertyOnSelection('cubemapBakeId', cubemapBakeId)
  }

  const loadPortals = async () => {
    const portalsDetail: PortalDetail[] = []
    try {
      portalsDetail.push(...(await client.service('portal').find()).data)
      console.log('portalsDetail', portalsDetail, node.entityId)
    } catch (error) {
      throw new Error(error)
    }
    setPortals(
      portalsDetail
        .filter((portal) => portal.portalEntityId !== node.uuid)
        .map(({ portalEntityId, sceneName }) => {
          return { value: portalEntityId, name: sceneName }
        })
    )
  }

  useEffect(() => {
    if (props.node?.entityId !== entityId) {
      setEntityId(props.node.entityId)
      loadPortals()
    }
  }, [props.node?.entityId, entityId])

  useEffect(() => {
    setEntityId(props.node.entityId)
    loadPortals()
  }, [])

  // rendering view of editor for properties of PortalNode
  const node = props.node as PortalNode

  return (
    <NodeEditor description={t('editor:properties.portal.description')} {...props}>
      <InputGroup name="Location" label={t('editor:properties.portal.lbl-locationName')}>
        <ControlledStringInput value={node.locationName} onChange={onChangeLocationName} />
      </InputGroup>
      <InputGroup name="Portal" label={t('editor:properties.portal.lbl-portal')}>
        <SelectInput
          options={portals}
          value={node.linkedPortalId}
          onChange={onChangeLinkedPortalId}
          filterOption={(option: PortalFilterOption, searchString: string) => {
            return option.label.includes(searchString || '')
          }}
          getOptionLabel={(data) => data.name}
        />
      </InputGroup>
      <InputGroup name="Model Url" label={t('editor:properties.portal.lbl-modelUrl')}>
        <ControlledStringInput value={node.modelUrl} onChange={onChangeModelUrl} />
      </InputGroup>
      <InputGroup name="Display Text" label={t('editor:properties.portal.lbl-displayText')}>
        <ControlledStringInput value={node.displayText} onChange={onChangeDisplayText} />
      </InputGroup>
      <InputGroup name="Cubemap Bake" label={t('editor:properties.portal.lbl-cubemapBake')}>
        <SelectInput
          options={useEngine()
            .scene.children.filter((obj: Object3D) => {
              return (obj as any).nodeName === CubemapBakeNode.nodeName
            })
            .map((obj: Object3D) => {
              return {
                label: obj.name,
                value: obj.uuid
              }
            })}
          value={node.cubemapBakeId}
          onChange={onChangeCubemapBake}
        />
      </InputGroup>
      <InputGroup name="Spawn Position" label={t('editor:properties.portal.lbl-spawnPosition')}>
        <Vector3Input value={node.spawnPosition} onChange={onChangeSpawnPosition} />
      </InputGroup>
      <InputGroup name="Spawn Rotation" label={t('editor:properties.portal.lbl-spawnRotation')}>
        <EulerInput value={node.spawnRotation} onChange={onChangeSpawnRotation} />
      </InputGroup>
      <InputGroup name="Trigger Position" label={t('editor:properties.portal.lbl-triggerPosition')}>
        <Vector3Input value={node.triggerPosition} onChange={onChangeTriggerPosition} />
      </InputGroup>
      <InputGroup name="Trigger Rotation" label={t('editor:properties.portal.lbl-triggerRotation')}>
        <EulerInput value={node.triggerRotation} onChange={onChangeTriggerRotation} />
      </InputGroup>
      <InputGroup name="Trigger Scale" label={t('editor:properties.portal.lbl-triggerScale')}>
        <Vector3Input value={node.triggerScale} onChange={onChangeTriggerScale} />
      </InputGroup>
    </NodeEditor>
  )
}

PortalNodeEditor.iconComponent = DoorOpen

export default PortalNodeEditor
