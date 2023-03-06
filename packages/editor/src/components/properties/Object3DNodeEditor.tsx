import { truncate } from 'fs/promises'
import { range } from 'lodash'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ReactJson from 'react-json-view'
import { BoxGeometry, Euler, InstancedMesh, Material, Matrix4, Mesh, Object3D, Quaternion, Scene, Vector3 } from 'three'

import { AxisIcon } from '@etherealengine/client-core/src/util/AxisIcon'
import { Geometry } from '@etherealengine/engine/src/assets/constants/Geometry'
import { Deg2Rad, Rad2Deg } from '@etherealengine/engine/src/common/functions/MathFunctions'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { hasComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { materialFromId } from '@etherealengine/engine/src/renderer/materials/functions/MaterialLibraryFunctions'
import { getMaterialLibrary } from '@etherealengine/engine/src/renderer/materials/MaterialLibrary'
import { Object3DWithEntity } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { TransformSpace } from '@etherealengine/engine/src/scene/constants/transformConstants'
import { dispatchAction, useHookstate } from '@etherealengine/hyperflux'

import { SpaceBar } from '@mui/icons-material'
import { Divider } from '@mui/material'

import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { EditorHistoryAction } from '../../services/EditorHistory'
import { EditorAction } from '../../services/EditorServices'
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
import PropertyGroup from './PropertyGroup'
import { EditorComponentType } from './Util'

type Object3DProps = {
  obj3d: Object3D
  multiEdit: boolean
}

/**
 * Object3DNodeEditor component used to provide the editor view to customize Object3D properties inside a model.
 *
 * @type {Class component}
 */
export const Object3DNodeEditor = (props: Object3DProps) => {
  const { t } = useTranslation()
  console.log(props)
  const scene: Scene = Engine.instance.currentWorld.scene
  const selectionState = accessSelectionState()
  const materialLibrary = getMaterialLibrary()
  const obj3d: Object3D = props.obj3d as any
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
      rotation: new Vector3(...(obj3d.rotation.toArray() as number[])),
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

  useEffect(() => {
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
    while (walker) {
      if (walker.entity && hasComponent(walker.entity, EntityTreeComponent)) {
        EditorControlFunctions.replaceSelection([walker.entity!])
        break
      }
      walker = walker.parent as Object3DWithEntity
    }
  }

  return (
    <PropertyGroup
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
                    EditorControlFunctions.positionObject([obj3d.uuid], [nuPosition])
                    //obj3d.position.set(nuPosition.x, nuPosition.y, nuPosition.z)
                  }}
                  onRelease={() => {
                    dispatchAction(EditorAction.sceneModified({ modified: true }))
                    dispatchAction(EditorHistoryAction.createSnapshot({ modify: true }))
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

                    EditorControlFunctions.rotateObject([obj3d.uuid], [actualEuler])
                    //obj3d.rotation.setFromVector3(nuEulers.multiplyScalar(Deg2Rad))
                  }}
                  onRelease={() => {
                    dispatchAction(EditorAction.sceneModified({ modified: true }))
                    dispatchAction(EditorHistoryAction.createSnapshot({ modify: true }))
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
                    EditorControlFunctions.scaleObject([obj3d.uuid], [nuScale], TransformSpace.Local, true)
                    //obj3d.scale.copy(nuScale)
                  }}
                  onRelease={() => {
                    dispatchAction(EditorAction.sceneModified({ modified: true }))
                    dispatchAction(EditorHistoryAction.createSnapshot({ modify: true }))
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
                    if (!!materialLibrary.materials[nuId].value) {
                      if (Array.isArray(mesh.material)) {
                        mesh.material[currentMaterialId.value] = materialFromId(nuId).material
                      } else {
                        mesh.material = materialFromId(nuId).material
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
              element={(i: number) => {
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
            EditorControlFunctions.modifyObject3d(
              selectionState.value.selectedEntities.filter((val) => typeof val === 'string') as string[],
              [{ userData: edit.updated_src }]
            )
            obj3d.userData = edit.updated_src
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
    </PropertyGroup>
  )
}

Object3DNodeEditor.iconComponent = AxisIcon

export default Object3DNodeEditor
