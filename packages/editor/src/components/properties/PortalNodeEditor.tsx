import { DoorOpen } from '@styled-icons/fa-solid'
import i18n from 'i18next'
import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { Object3D } from 'three'
import PortalNode from '../../nodes/PortalNode'
import CubemapBakeNode from '../../nodes/CubemapBakeNode'
import Editor from '../Editor'
import EulerInput from '../inputs/EulerInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import { ControlledStringInput } from '../inputs/StringInput'
import Vector3Input from '../inputs/Vector3Input'
import NodeEditor from './NodeEditor'

type PortalNodeEditorProps = {
  editor?: Editor
  node?: object
  t: Function
}

type PortalDetail = {
  name: string
  value: string
}

type PortalFilterOption = {
  label: string
  value: string
  data: PortalDetail
}

type PortalNodeEditorStates = {
  portals: PortalDetail[]
  entityId: string
}

/**
 * PortalNodeEditor provides the editor for properties of PortalNode.
 *
 * @author Josh Field <github.com/HexaField>
 * @type {class component}
 */
export class PortalNodeEditor extends Component<PortalNodeEditorProps, PortalNodeEditorStates> {
  // initializing iconComponent image name
  static iconComponent = DoorOpen

  //initializing description and will appears on PortalNodeEditor view
  static description = i18n.t('editor:properties.portal.description')

  constructor(props) {
    super(props)

    this.state = {
      portals: [],
      entityId: ''
    }
  }

  onChangeLocationName = (locationName) => {
    this.props.editor.setPropertySelected('locationName', locationName)
  }

  onChangeLinkedPortalId = (linkedPortalId) => {
    this.props.editor.setPropertySelected('linkedPortalId', linkedPortalId)
  }

  onChangeModelUrl = (modelUrl) => {
    this.props.editor.setPropertySelected('modelUrl', modelUrl)
  }

  onChangeDisplayText = (displayText) => {
    this.props.editor.setPropertySelected('displayText', displayText)
  }

  onChangeSpawnPosition = (spawnPosition) => {
    this.props.editor.setPropertySelected('spawnPosition', spawnPosition)
  }

  onChangeSpawnRotation = (spawnRotation) => {
    this.props.editor.setPropertySelected('spawnRotation', spawnRotation)
  }

  onChangeTriggerPosition = (triggerPosition) => {
    this.props.editor.setPropertySelected('triggerPosition', triggerPosition)
  }

  onChangeTriggerRotation = (triggerRotation) => {
    this.props.editor.setPropertySelected('triggerRotation', triggerRotation)
  }

  onChangeTriggerScale = (triggerScale) => {
    this.props.editor.setPropertySelected('triggerScale', triggerScale)
  }

  onChangeCubemapBake = (cubemapBakeId) => {
    this.props.editor.setPropertySelected('cubemapBakeId', cubemapBakeId)
  }

  componentDidUpdate() {
    if ((this.props.node as any).entityId !== this.state.entityId) {
      this.setState({ entityId: (this.props.node as any).entityId })
      this.loadPortals()
    }
  }

  componentDidMount() {
    this.setState({ entityId: (this.props.node as any).entityId })
    this.loadPortals()
  }

  loadPortals = async () => {
    let portalsDetail
    try {
      portalsDetail = await globalThis.Editor.feathersClient.service('portal/list').find()
    } catch (error) {
      throw new Error(error)
      return []
    }
    const portals = []

    portalsDetail.forEach((portal) => {
      if (portal.entity.entityId === (this.props.node as any).entityId) return
      portals.push({
        name: `${portal.entity.collection.name} (${portal.entity.name})`,
        value: portal.entity.entityId
      })
    })

    this.setState({ portals })
  }

  // rendering view of editor for properties of PortalNode
  render() {
    PortalNodeEditor.description = this.props.t('editor:properties.portal.description')
    const node = this.props.node as PortalNode
    return (
      <NodeEditor description={PortalNodeEditor.description} {...this.props}>
        <InputGroup name="Location" label={this.props.t('editor:properties.portal.lbl-locationName')}>
          <ControlledStringInput value={node.locationName} onChange={this.onChangeLocationName} />
        </InputGroup>
        <InputGroup name="Portal" label={this.props.t('editor:properties.portal.lbl-portal')}>
          <SelectInput
            options={this.state.portals}
            value={node.linkedPortalId}
            onChange={this.onChangeLinkedPortalId}
            filterOption={(option: PortalFilterOption, searchString: string) => {
              return option.label.includes(searchString || '')
            }}
            getOptionLabel={(data: PortalDetail) => data.name}
          />
        </InputGroup>
        <InputGroup name="Model Url" label={this.props.t('editor:properties.portal.lbl-modelUrl')}>
          <ControlledStringInput value={node.modelUrl} onChange={this.onChangeModelUrl} />
        </InputGroup>
        <InputGroup name="Display Text" label={this.props.t('editor:properties.portal.lbl-displayText')}>
          <ControlledStringInput value={node.displayText} onChange={this.onChangeDisplayText} />
        </InputGroup>
        <InputGroup name="Cubemap Bake" label={this.props.t('editor:properties.portal.lbl-cubemapBake')}>
          <SelectInput
            options={this.props.editor.scene.children
              .filter((obj: Object3D) => {
                return (obj as any).nodeName === CubemapBakeNode.nodeName
              })
              .map((obj: Object3D) => {
                return {
                  label: obj.name,
                  value: obj.uuid
                }
              })}
            value={node.cubemapBakeId}
            onChange={this.onChangeCubemapBake}
          />
        </InputGroup>
        <InputGroup name="Spawn Position" label={this.props.t('editor:properties.portal.lbl-spawnPosition')}>
          <Vector3Input value={node.spawnPosition} onChange={this.onChangeSpawnPosition} />
        </InputGroup>
        <InputGroup name="Spawn Rotation" label={this.props.t('editor:properties.portal.lbl-spawnRotation')}>
          <EulerInput value={node.spawnRotation} onChange={this.onChangeSpawnRotation} />
        </InputGroup>
        <InputGroup name="Trigger Position" label={this.props.t('editor:properties.portal.lbl-triggerPosition')}>
          <Vector3Input value={node.triggerPosition} onChange={this.onChangeTriggerPosition} />
        </InputGroup>
        <InputGroup name="Trigger Rotation" label={this.props.t('editor:properties.portal.lbl-triggerRotation')}>
          <EulerInput value={node.triggerRotation} onChange={this.onChangeTriggerRotation} />
        </InputGroup>
        <InputGroup name="Trigger Scale" label={this.props.t('editor:properties.portal.lbl-triggerScale')}>
          <Vector3Input value={node.triggerScale} onChange={this.onChangeTriggerScale} />
        </InputGroup>
      </NodeEditor>
    )
  }
}

export default withTranslation()(PortalNodeEditor)
