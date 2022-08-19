import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ReactJson from 'react-json-view'
import { Euler, InstancedMesh, Material, Matrix4, Mesh, Object3D, Quaternion, Scene, Vector3 } from 'three'

import { AxisIcon } from '@xrengine/client-core/src/util/AxisIcon'
import { Deg2Rad, Rad2Deg } from '@xrengine/engine/src/common/functions/MathFunctions'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Object3DWithEntity } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { useHookEffect, useHookstate } from '@xrengine/hyperflux'

import { SpaceBar } from '@mui/icons-material'
import { Divider } from '@mui/material'

import { executeCommandWithHistory, executeCommandWithHistoryOnSelection } from '../../classes/History'
import EditorCommands, { TransformCommands } from '../../constants/EditorCommands'
import BooleanInput from '../inputs/BooleanInput'
import { Button } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import Vector3Input from '../inputs/Vector3Input'
import CollapsibleBlock from '../layout/CollapsibleBlock'
import { List } from '../layout/List'
import Well from '../layout/Well'
import MaterialEditor from '../materials/MaterialEditor'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

/**
 * Object3DNodeEditor component used to provide the editor view to customize Object3D properties inside a model.
 *
 * @type {Class component}
 */
export const Object3DNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  console.log(props)
  const scene: Scene = Engine.instance.currentWorld.scene
  const onEdit = (edit) => {
    console.log(edit)
  }
  const obj3d: Object3D = props.node as any

  //objId: used to track current obj3d
  const objId = useHookstate(obj3d.uuid)

  useEffect(() => {
    if (obj3d && obj3d.uuid !== objId.value) {
      objId.set(obj3d.uuid)
    }
  })
  const mesh: Mesh = obj3d as Mesh
  const isMesh = mesh.isMesh
  const instancedMesh = mesh as InstancedMesh
  const isInstancedMesh = instancedMesh.isInstancedMesh

  const updateObj3d = (varName: 'frustrumCulled' | 'visible' | 'castShadow' | 'receiveShadow', label) => {
    const varVal = useHookstate(() => obj3d[varName])
    return (
      <InputGroup name={label} label={label}>
        <BooleanInput
          value={varVal['value']}
          onChange={(val) => {
            obj3d[varName] = val
            varVal.set(val)
          }}
        />
      </InputGroup>
    )
  }

  function getMaterials() {
    const result: Material[] = []
    if ((mesh.material as Material[])?.length !== undefined) {
      ;(mesh.material as Material[]).map((material) => result.push(material))
    } else if (mesh.material) {
      result.push(mesh.material as Material)
    }
    return result
  }

  function getMaterialIds() {
    return getMaterials().map((material) => material.uuid)
  }
  const materials = getMaterials()
  const materialIds = useHookstate(getMaterialIds())
  const currentId = useHookstate(materialIds.value.length > 0 ? 0 : -1)

  useHookEffect(() => {
    materialIds.set(getMaterialIds())
    currentId.set(
      materialIds.value.length > currentId.value && currentId.value > -1
        ? currentId.value
        : materialIds.value.length > 0
        ? 0
        : -1
    )
  }, [objId])

  function selectParentEntityNode() {
    let walker = obj3d as Object3DWithEntity
    const nodeMap = Engine.instance.currentWorld.entityTree.entityNodeMap
    while (walker) {
      if (walker.entity && nodeMap.has(walker.entity)) {
        executeCommandWithHistory({
          type: EditorCommands.REPLACE_SELECTION,
          affectedNodes: [nodeMap.get(walker.entity)!],
          updateSelection: true,
          undo: {
            selection: [obj3d.uuid]
          }
        })
        break
      }
      walker = walker.parent as Object3DWithEntity
    }
  }
  const initEditState = () => {
    return {
      objName: obj3d.name,
      position: obj3d.position.clone(),
      rotation: new Vector3(...obj3d.rotation.toArray()),
      scale: obj3d.scale.clone()
    }
  }
  const editState = useHookstate<
    {
      ['objName']: string
      ['position']: Vector3
      ['rotation']: Vector3
      ['scale']: Vector3
    },
    unknown
  >(initEditState())

  useHookEffect(() => {
    editState.set(initEditState())
  }, [objId])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.object3d.name')}
      description={t('editor:properties.object3d.description')}
    >
      {/* <InputGroup name="Cube Map" label={t('editor:properties.interior.lbl-cubeMap')}>
        <ImageInput value={interiorComponent.cubeMap} onChange={updateProperty(InteriorComponent, 'cubeMap')} />
        {hasError && <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.interior.error-url')}</div>}
      </InputGroup> */}
      {/* <StringInput value={name} onChange={setName} onFocus={onFocus} onBlur={onBlurName} onKeyUp={onKeyUpName} /> */}
      {/* frustrum culling */ updateObj3d('frustrumCulled', 'Frustrum Culled')}
      {/* visibility */ updateObj3d('visible', 'Visible')}
      {
        <Well>
          <Well>
            <InputGroup label="Name" name="Name">
              <StringInput
                value={editState.value.objName}
                onChange={(name) => {
                  editState.merge({
                    objName: name
                  })
                  obj3d.name = name
                }}
              />
            </InputGroup>
            <Divider />
            <Well>
              <InputGroup name="Position" label="Translation">
                <Vector3Input
                  value={editState.value.position}
                  onChange={(nuPosition) => {
                    editState.merge({
                      position: nuPosition.clone()
                    })
                    executeCommandWithHistory({
                      affectedNodes: [obj3d.uuid],
                      type: TransformCommands.POSITION,
                      positions: [nuPosition]
                    })
                    //obj3d.position.set(nuPosition.x, nuPosition.y, nuPosition.z)
                  }}
                />
              </InputGroup>
              <InputGroup name="Rotation" label="Rotation">
                <Vector3Input
                  value={editState.value.rotation}
                  onChange={(nuEulers) => {
                    editState.merge({
                      rotation: nuEulers.clone()
                    })
                    const actualEuler = new Euler(...nuEulers.clone().multiplyScalar(Deg2Rad).toArray())
                    executeCommandWithHistory({
                      affectedNodes: [obj3d.uuid],
                      type: TransformCommands.ROTATION,
                      rotations: [actualEuler]
                    })
                    //obj3d.rotation.setFromVector3(nuEulers.multiplyScalar(Deg2Rad))
                  }}
                />
              </InputGroup>
              <InputGroup name="Scale" label="Scale">
                <Vector3Input
                  value={obj3d.scale}
                  onChange={(nuScale) => {
                    editState.merge({
                      scale: nuScale.clone()
                    })
                    executeCommandWithHistory({
                      affectedNodes: [obj3d.uuid],
                      type: TransformCommands.SCALE,
                      scales: [nuScale]
                    })
                    //obj3d.scale.copy(nuScale)
                  }}
                />
              </InputGroup>
            </Well>
          </Well>
          <Well>
            {updateObj3d('castShadow', 'Cast Shadow')}
            {updateObj3d('receiveShadow', 'Receive Shadow')}
          </Well>
        </Well>
      }
      <Button onClick={selectParentEntityNode}>Parent Node</Button>
      {/* animations */}
      {isMesh && (
        <CollapsibleBlock label={'Mesh Properties'}>
          <CollapsibleBlock label={'Materials'}>
            <MaterialEditor material={materials[currentId.value]} />
          </CollapsibleBlock>
        </CollapsibleBlock>
      )}

      {isInstancedMesh && (
        <CollapsibleBlock label={'Instance Properties'}>
          <List>
            {Array.from({ length: instancedMesh.instanceMatrix.count }, (_, i) => i).map((i) => {
              let transform = new Matrix4()
              instancedMesh.getMatrixAt(i, transform)
              let position = new Vector3()
              let rotation = new Quaternion()
              let scale = new Vector3()
              transform.decompose(position, rotation, scale)

              const euler = new Euler()
              euler.setFromQuaternion(rotation)
              return (
                <Well>
                  <InputGroup name="Position" label="Translation">
                    <Vector3Input value={position} />
                  </InputGroup>
                  <InputGroup name="Rotation" label="Rotation">
                    <Vector3Input value={new Vector3(euler.x, euler.y, euler.z).multiplyScalar(Rad2Deg)} />
                  </InputGroup>
                  <InputGroup name="Scale" label="Scale">
                    <Vector3Input value={scale} />
                  </InputGroup>
                </Well>
              )
            })}
          </List>
        </CollapsibleBlock>
      )}
      <ReactJson
        style={{ height: '100%', overflow: 'auto' }}
        onEdit={onEdit}
        theme="monokai"
        src={(props.node as any as Object3D).userData}
      />
    </NodeEditor>
  )
}

Object3DNodeEditor.iconComponent = AxisIcon

export default Object3DNodeEditor
