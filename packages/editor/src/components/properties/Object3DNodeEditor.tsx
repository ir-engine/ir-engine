import { truncate } from 'fs/promises'
import { range } from 'lodash'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ReactJson from 'react-json-view'
import { BoxGeometry, Euler, InstancedMesh, Material, Matrix4, Mesh, Object3D, Quaternion, Scene, Vector3 } from 'three'

import { AxisIcon } from '@xrengine/client-core/src/util/AxisIcon'
import { Geometry } from '@xrengine/engine/src/assets/constants/Geometry'
import { Deg2Rad, Rad2Deg } from '@xrengine/engine/src/common/functions/MathFunctions'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { MaterialLibrary } from '@xrengine/engine/src/renderer/materials/MaterialLibrary'
import { Object3DWithEntity } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { useHookEffect, useHookstate } from '@xrengine/hyperflux'

import { SpaceBar } from '@mui/icons-material'
import { Divider } from '@mui/material'

import { executeCommandWithHistory, executeCommandWithHistoryOnSelection } from '../../classes/History'
import EditorCommands, { TransformCommands } from '../../constants/EditorCommands'
import { accessSelectionState } from '../../services/SelectionServices'
import GeometryEditor from '../geometry/GeometryEditor'
import BooleanInput from '../inputs/BooleanInput'
import { Button } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import { MaterialInput } from '../inputs/MaterialInput'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import Vector3Input from '../inputs/Vector3Input'
import CollapsibleBlock from '../layout/CollapsibleBlock'
import { List } from '../layout/List'
import PaginatedList from '../layout/PaginatedList'
import Well from '../layout/Well'
import MaterialEditor from '../materials/MaterialEditor'
import styles from '../styles.module.scss'
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
  const selectionState = accessSelectionState()
  const obj3d: Object3D = props.node as any
  const mesh = obj3d as Mesh
  const instancedMesh = obj3d as InstancedMesh
  //objId: used to track current obj3d
  const objId = useHookstate(obj3d.uuid)
  const isMesh = mesh?.isMesh
  const isInstancedMesh = instancedMesh?.isInstancedMesh
  useEffect(() => {
    if (obj3d && obj3d.uuid !== objId.value) {
      objId.set(obj3d.uuid)
    }
  })

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
    return getMaterials().map((material) => {
      return { label: material.name, value: material.uuid }
    })
  }
  const materials = getMaterials()
  const materialIds = useHookstate(getMaterialIds())
  const currentMaterialId = useHookstate(materialIds.value.length > 0 ? 0 : -1)
  function getGeometries() {
    const result: Geometry[] = []
    Engine.instance.currentWorld.scene.traverse((child: Mesh<Geometry>) => {
      if (!child?.isMesh) return
      if (child.geometry) {
        result.push(child.geometry)
      }
    })
    return result
  }

  function getGeometryIds() {
    return getGeometries().map((geometry: Geometry) => {
      return { label: `${geometry.name}: ${geometry.type}`, value: geometry.uuid }
    })
  }

  const initEditState = () => {
    return {
      objName: obj3d.name,
      position: obj3d.position.clone(),
      rotation: new Vector3(...obj3d.rotation.toArray()),
      scale: obj3d.scale.clone()
    }
  }

  const geometries = getGeometries()
  const geometryIds = useHookstate(getGeometryIds())
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
    materialIds.set(getMaterialIds())
    currentMaterialId.set(
      materialIds.value.length > currentMaterialId.value && currentMaterialId.value > -1
        ? currentMaterialId.value
        : materialIds.value.length > 0
        ? 0
        : -1
    )
    editState.set(initEditState())
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

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.object3d.name')}
      description={t('editor:properties.object3d.description')}
    >
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
                      scales: [nuScale],
                      overrideScale: true
                    })
                    //obj3d.scale.copy(nuScale)
                  }}
                />
              </InputGroup>
            </Well>
          </Well>
          <Well>
            {updateObj3d('visible', 'Visible')}
            {updateObj3d('frustrumCulled', 'Frustrum Culled')}
            {updateObj3d('castShadow', 'Cast Shadow')}
            {updateObj3d('receiveShadow', 'Receive Shadow')}
          </Well>
        </Well>
      }
      <Button onClick={selectParentEntityNode}>Parent Node</Button>
      {/* animations */}
      {isMesh && (
        <>
          <CollapsibleBlock label={'Geometry'}>
            <InputGroup name="Current Geometry" label="Current Geometry">
              <SelectInput options={geometryIds.value!} value={mesh.geometry.uuid} />
            </InputGroup>
            <GeometryEditor geometry={mesh.geometry} />
          </CollapsibleBlock>
          <CollapsibleBlock label={'Materials'}>
            {materialIds.value?.length > 0 && (
              <>
                <InputGroup name="Current Material" label="Current Material">
                  <SelectInput
                    options={materialIds.value}
                    value={materialIds.value[currentMaterialId.value]?.value ?? materialIds.value}
                    onChange={(nuVal) => {
                      currentMaterialId.set(materialIds.value.findIndex(({ value }) => value === nuVal))
                    }}
                  />
                </InputGroup>
                <MaterialInput
                  value={materials[currentMaterialId.value].uuid}
                  onChange={(nuId) => {
                    if (MaterialLibrary.materials.has(nuId)) {
                      if (Array.isArray(mesh.material)) {
                        mesh.material[currentMaterialId.value] = MaterialLibrary.materials.get(nuId)!.material
                      } else {
                        mesh.material = MaterialLibrary.materials.get(nuId)!.material
                        mesh.material.needsUpdate = true
                      }
                    }
                  }}
                />
                <MaterialEditor material={materials[currentMaterialId.value]} />
              </>
            )}
          </CollapsibleBlock>
        </>
      )}

      {isInstancedMesh && (
        <CollapsibleBlock label={'Instance Properties'}>
          {instancedMesh?.count > 0 && (
            <PaginatedList
              list={range(0, instancedMesh.count - 1)}
              element={(i) => {
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
              }}
            />
          )}
        </CollapsibleBlock>
      )}
      <div className={styles.propertyContainer}>
        <h1>userData</h1>
        <ReactJson
          style={{ height: '100%', overflow: 'auto' }}
          onEdit={(edit) => {
            executeCommandWithHistory({
              type: EditorCommands.MODIFY_OBJECT3D,
              affectedNodes: selectionState.value.selectedEntities.filter((val) => typeof val === 'string') as string[],
              properties: [{ userData: edit.updated_src }]
            })
            //obj3d.userData = edit.updated_src
          }}
          onAdd={(add) => {
            obj3d.userData = add.updated_src
          }}
          onDelete={(_delete) => {
            obj3d.userData = _delete.updated_src
          }}
          onSelect={() => {}}
          theme="monokai"
          src={obj3d.userData}
        />
      </div>
    </NodeEditor>
  )
}

Object3DNodeEditor.iconComponent = AxisIcon

export default Object3DNodeEditor
