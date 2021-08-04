import React, { Component } from 'react'
import Editor from '../Editor'
import InputGroup from '../inputs/InputGroup'
import { ControlledStringInput } from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { DoorOpen } from '@styled-icons/fa-solid'
import Vector3Input from '../inputs/Vector3Input'
import EulerInput from '../inputs/EulerInput'
import SelectInput from '../inputs/SelectInput'
import type PortalNode from '@xrengine/engine/src/editor/nodes/PortalNode'
import configs from '../configs'
import { Object3D } from 'three'
import ReflectionProbeNode from '@xrengine/engine/src/editor/nodes/ReflectionProbeNode'

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

  onChangeDisplayText = (displayText) => {
    this.props.editor.setPropertySelected('displayText', displayText)
  }

  onChangeSpawnPosition = (spawnPosition) => {
    this.props.editor.setPropertySelected('spawnPosition', spawnPosition)
  }

  onChangeSpawnRotation = (spawnRotation) => {
    this.props.editor.setPropertySelected('spawnRotation', spawnRotation)
  }

  onChangeReflectionProbe = (reflectionProbeId) => {
    this.props.editor.setPropertySelected('reflectionProbeId', reflectionProbeId)
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
    const SERVER_URL = (configs as any).SERVER_URL
    const portalsDetail = await this.props.editor.api
      .fetchUrl(`${SERVER_URL}/portal/list`)
      .then((res) => res.json())
      .catch((err) => {
        console.error(err)
        return []
      })
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
      /* @ts-ignore */
      <NodeEditor description={PortalNodeEditor.description} {...this.props}>
        {/* @ts-ignore */}
        <InputGroup name="Location" label={this.props.t('editor:properties.portal.lbl-locationName')}>
          {/* @ts-ignore */}
          <ControlledStringInput value={node.locationName} onChange={this.onChangeLocationName} />
        </InputGroup>
        {/* @ts-ignore */}
        <InputGroup name="Portal" label={this.props.t('editor:properties.portal.lbl-portal')}>
          {/* @ts-ignore */}
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
        {/* @ts-ignore */}
        <InputGroup name="Display Text" label={this.props.t('editor:properties.portal.lbl-displayText')}>
          {/* @ts-ignore */}
          <ControlledStringInput value={node.displayText} onChange={this.onChangeDisplayText} />
        </InputGroup>
        {/* @ts-ignore */}
        <InputGroup name="Texture Override" label={this.props.t('editor:properties.portal.lbl-reflectionProbe')}>
          {/* @ts-ignore */}
          <SelectInput
            options={this.props.editor.scene.children
              .filter((obj: Object3D) => {
                return (obj as any).nodeName === ReflectionProbeNode.nodeName
              })
              .map((obj: Object3D) => {
                return {
                  label: obj.name,
                  value: obj.uuid
                }
              })}
            value={node.reflectionProbeId}
            onChange={this.onChangeReflectionProbe}
          />
        </InputGroup>
        {/* @ts-ignore */}
        <InputGroup name="Spawn Position" label={this.props.t('editor:properties.portal.lbl-spawnPosition')}>
          <Vector3Input value={node.spawnPosition} onChange={this.onChangeSpawnPosition} />
        </InputGroup>
        {/* @ts-ignore */}
        <InputGroup name="Spawn Rotation" label={this.props.t('editor:properties.portal.lbl-spawnRotation')}>
          <EulerInput value={node.spawnRotation} onChange={this.onChangeSpawnRotation} />
        </InputGroup>
      </NodeEditor>
    )
  }
}

export default withTranslation()(PortalNodeEditor)
