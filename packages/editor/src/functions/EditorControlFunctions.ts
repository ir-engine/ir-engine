/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Euler, Matrix4, Quaternion, Vector3 } from 'three'

import {
  createEntity,
  EntityTreeComponent,
  EntityUUID,
  findRootAncestors,
  generateEntityUUID,
  getAncestorWithComponents,
  getChildrenWithComponents,
  removeEntityNodeRecursively,
  UUIDComponent
} from '@ir-engine/ecs'
import {
  Component,
  componentJsonDefaults,
  ComponentJSONIDMap,
  deserializeComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  LayerComponent,
  Layers,
  removeComponent,
  serializeComponent,
  SerializedComponentType,
  setComponent,
  SetComponentType
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { AssetModifiedState } from '@ir-engine/engine/src/gltf/GLTFState'
import { SkyboxComponent } from '@ir-engine/engine/src/scene/components/SkyboxComponent'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { TransformSpace } from '@ir-engine/engine/src/scene/constants/transformConstants'
import { ComponentJsonType } from '@ir-engine/engine/src/scene/types/SceneTypes'
import { getMutableState, getState, setNestedObject } from '@ir-engine/hyperflux'
import { DirectionalLightComponent, HemisphereLightComponent } from '@ir-engine/spatial'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { getMaterial } from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { serializeEntity } from '@ir-engine/engine/src/scene/functions/serializeWorld'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { PostProcessingComponent } from '@ir-engine/spatial/src/renderer/components/PostProcessingComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { EditorHelperState } from '../services/EditorHelperState'
import { EditorState } from '../services/EditorServices'
import { SelectionState } from '../services/SelectionServices'

const tempMatrix4 = new Matrix4()
const tempVector = new Vector3()

const addOrRemoveComponent = <C extends Component<any, any>>(
  entities: Entity[],
  component: C,
  add: boolean,
  args: SetComponentType<C> | undefined = undefined
) => {
  const sceneComponentID = component.jsonID
  if (!sceneComponentID) return
  for (const entity of entities) {
    if (hasComponent(entity, SceneComponent)) continue
    if (add) {
      setComponent(entity, component, args)
    } else {
      removeComponent(entity, component)
    }
    EditorState.markModifiedScene(entity)
  }
}

const modifyName = (entities: Entity[], name: string) => {
  for (const entity of entities) {
    setComponent(entity, NameComponent, name)
    EditorState.markModifiedScene(entity)
  }
}

/**
 * Updates each property specified in 'properties' on the component for each of the specified entity nodes
 */
const modifyProperty = <C extends Component<any, any>>(
  entities: Entity[],
  component: C,
  properties: Partial<SerializedComponentType<C>>
) => {
  for (const entity of entities) {
    if (hasComponent(entity, SceneComponent)) continue

    const currentComponent = hasComponent(entity, component) ? serializeComponent(entity, component) : {}
    for (const [key, val] of Object.entries(properties)) {
      if (key.includes('.')) {
        setNestedObject(currentComponent, key, val)
        console.log(currentComponent, key, val)
      } else {
        currentComponent[key] = val
      }
    }
    deserializeComponent(entity, component, currentComponent)
    EditorState.markModifiedScene(entity)
  }
}

const modifyMaterial = (nodes: string[], materialId: EntityUUID, properties: { [_: string]: any }[]) => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (typeof node !== 'string') return
    const material = getMaterial(materialId)
    if (!material) return
    const props = properties[i] ?? properties[0]
    Object.entries(props).map(([k, v]) => {
      if (!material) throw new Error('Updating properties on undefined material')
      if (
        ![undefined, null].includes(v) &&
        ![undefined, null].includes(material[k]) &&
        typeof material[k] === 'object' &&
        typeof material[k].set === 'function'
      ) {
        material[k].set(v)
      } else {
        material[k] = v
      }
    })
    const materialEntity = UUIDComponent.getEntityByUUID(materialId, Layers.Authoring)
    const sceneID = getComponent(materialEntity, SourceComponent)
    getMutableState(AssetModifiedState)[sceneID].set(true)
    material.needsUpdate = true
  }
}

const lookDevComponent: Component[] = [
  SkyboxComponent,
  HemisphereLightComponent,
  DirectionalLightComponent,
  PostProcessingComponent
]

const overwriteLookdevObject = (
  beforeComponentJson: ComponentJsonType[] = [],
  componentJson: ComponentJsonType[] = [],
  parentEntity = getState(EditorState).rootEntity,
  beforeEntity?: Entity
) => {
  for (const comp of componentJson) {
    const { name, props } = comp
    const lookDevComp = lookDevComponent.find((c) => c.jsonID === name)
    if (!lookDevComp) continue
    const sceneEntitiesWithComponent = getChildrenWithComponents(parentEntity, [lookDevComp])
    if (sceneEntitiesWithComponent.length) {
      setComponent(sceneEntitiesWithComponent[0], lookDevComp, componentJson)
      EditorState.markModifiedScene(parentEntity)
    } else {
      createObjectFromSceneElement(componentJson, parentEntity, beforeEntity)
    }
  }
}

const createObjectFromSceneElement = (
  componentJson: ComponentJsonType[] = [],
  parentEntity = getState(EditorState).rootEntity,
  beforeEntity?: Entity,
  requestedName?: string
): { entityUUID: EntityUUID; sourceID: string } => {
  const entityUUID: EntityUUID =
    componentJson.find((comp) => comp.name === UUIDComponent.jsonID)?.props.uuid ?? generateEntityUUID()

  const gltfEntity = getAncestorWithComponents(parentEntity, [GLTFComponent])
  const sourceID = GLTFComponent.getInstanceID(gltfEntity)
  let name = 'New Object'
  if (requestedName) {
    name = requestedName
  }

  const extensions = {} as Record<string, any>
  for (const comp of componentJson) {
    extensions[comp.name] = {
      ...componentJsonDefaults(ComponentJSONIDMap.get(comp.name)!),
      ...comp.props
    }
  }
  if (!extensions[UUIDComponent.jsonID]) {
    extensions[UUIDComponent.jsonID] = entityUUID
  }
  if (!extensions[VisibleComponent.jsonID]) {
    extensions[VisibleComponent.jsonID] = true
  }

  const entity = UUIDComponent.getOrCreateEntityByUUID(entityUUID, Layers.Authoring)

  setComponent(entity, NameComponent, name)

  setComponent(entity, SourceComponent, sourceID)

  if (extensions[TransformComponent.jsonID]) {
    const comp = {
      ...componentJsonDefaults(TransformComponent),
      ...extensions[TransformComponent.jsonID]
    }
    deserializeComponent(entity, TransformComponent, { ...comp })
  }

  setComponent(entity, EntityTreeComponent, { parentEntity })

  for (const [key, value] of Object.entries(extensions)) {
    if (key === TransformComponent.jsonID) continue
    deserializeComponent(entity, ComponentJSONIDMap.get(key)!, value)
  }

  EditorState.markModifiedScene(gltfEntity)

  return { entityUUID, sourceID }
}

/**
 * @todo copying an object should be rooted to which object is currently selected
 */
const duplicateObject = (entities: Entity[]) => {
  const rootEntities = findRootAncestors(entities)
  const uuidMap = {} as { [entityUUID: EntityUUID]: EntityUUID }

  const duplicateEntity = (entity: Entity) => {
    const parentEntity = getComponent(entity, EntityTreeComponent).parentEntity
    const entityUUID = getComponent(entity, UUIDComponent)
    const parentUUID = getComponent(parentEntity, UUIDComponent)
    const entityData = serializeEntity(entity).filter((c) => c.name !== UUIDComponent.jsonID)
    const newUUID = generateEntityUUID()
    const layer = LayerComponent.get(entity)
    const originalSource = getComponent(entity, SourceComponent)
    const newEntity = createEntity(layer)
    const name = getComponent(entity, NameComponent)
    setComponent(newEntity, VisibleComponent)
    setComponent(newEntity, NameComponent, name)
    setComponent(newEntity, UUIDComponent, newUUID)
    setComponent(newEntity, SourceComponent, originalSource)
    for (const component of entityData) {
      deserializeComponent(newEntity, ComponentJSONIDMap.get(component.name)!, component.props)
    }
    const newParentUUID = uuidMap[parentUUID]
    const newParentEntity = UUIDComponent.getEntityByUUID(newParentUUID, Layers.Authoring)
    setComponent(newEntity, EntityTreeComponent, { parentEntity: newParentEntity })
    uuidMap[entityUUID] = newUUID

    const children = getComponent(entity, EntityTreeComponent).children
    for (const childEntity of children) {
      duplicateEntity(childEntity)
    }
  }

  for (const rootEntity of rootEntities) {
    if (hasComponent(rootEntity, SceneComponent)) continue
    const { parentEntity } = getComponent(rootEntity, EntityTreeComponent)
    const rootParentUUID = getComponent(parentEntity, UUIDComponent)
    uuidMap[rootParentUUID] = rootParentUUID
    duplicateEntity(rootEntity)
    EditorState.markModifiedScene(rootEntity)
  }
}

const positionObject = (
  nodes: Entity[],
  positions: Vector3[],
  space = getState(EditorHelperState).transformSpace,
  addToPosition?: boolean
) => {
  for (let i = 0; i < nodes.length; i++) {
    const entity = nodes[i]
    if (hasComponent(entity, SceneComponent)) continue

    const pos = positions[i] ?? positions[0]

    const transform = getComponent(entity, TransformComponent)

    if (space === TransformSpace.local) {
      if (addToPosition) transform.position.add(pos)
      else transform.position.copy(pos)
    } else {
      const entityTreeComponent = getComponent(entity, EntityTreeComponent)
      const parentTransform = entityTreeComponent.parentEntity
        ? getComponent(entityTreeComponent.parentEntity, TransformComponent)
        : transform

      tempVector.set(0, 0, 0)
      if (addToPosition) {
        tempVector.setFromMatrixPosition(transform.matrixWorld)
      }
      tempVector.add(pos)

      const _spaceMatrix = parentTransform.matrixWorld
      tempMatrix4.copy(_spaceMatrix).invert()
      tempVector.applyMatrix4(tempMatrix4)

      transform.position.copy(tempVector)
    }

    setComponent(entity, TransformComponent, { position: transform.position })
    getMutableComponent(entity, TransformComponent).position.set((v) => v)

    EditorState.markModifiedScene(entity)
  }
}

const T_QUAT_1 = new Quaternion()
const T_QUAT_2 = new Quaternion()

const rotateObject = (nodes: Entity[], rotations: Quaternion[], space = getState(EditorHelperState).transformSpace) => {
  for (let i = 0; i < nodes.length; i++) {
    const entity = nodes[i]
    T_QUAT_1.copy(rotations[i] ?? rotations[0])
    const euler = new Euler().setFromQuaternion(T_QUAT_1, 'YXZ')

    const transform = getComponent(entity, TransformComponent)

    if (space === TransformSpace.local) {
      transform.rotation.copy(T_QUAT_1)
    } else {
      const entityTreeComponent = getComponent(entity, EntityTreeComponent)
      const parentTransform = entityTreeComponent.parentEntity
        ? getComponent(entityTreeComponent.parentEntity, TransformComponent)
        : transform

      const _spaceMatrix = parentTransform.matrixWorld

      const inverseParentWorldQuaternion = T_QUAT_2.setFromRotationMatrix(_spaceMatrix).invert()
      const newLocalQuaternion = inverseParentWorldQuaternion.multiply(T_QUAT_1)
      euler.copy(new Euler().setFromQuaternion(newLocalQuaternion, 'YXZ'))

      transform.rotation.copy(newLocalQuaternion)
    }

    setComponent(entity, TransformComponent, { rotation: transform.rotation })
    getMutableComponent(entity, TransformComponent).rotation.set((v) => v)

    EditorState.markModifiedScene(entity)
  }
}

const rotateAround = (entities: Entity[], axis: Vector3, angle: number, pivot: Vector3) => {
  const pivotToOriginMatrix = new Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z)
  const originToPivotMatrix = new Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z)
  const rotationMatrix = new Matrix4().makeRotationAxis(axis, angle)

  for (const entity of entities) {
    const transform = getComponent(entity, TransformComponent)
    const entityTreeComponent = getComponent(entity, EntityTreeComponent)
    const parentTransform = entityTreeComponent.parentEntity
      ? getComponent(entityTreeComponent.parentEntity, TransformComponent)
      : transform

    tempMatrix4
      .copy(transform.matrixWorld)
      .premultiply(pivotToOriginMatrix)
      .premultiply(rotationMatrix)
      .premultiply(originToPivotMatrix)
      .premultiply(tempMatrix4.copy(parentTransform.matrixWorld).invert())
      .decompose(transform.position, transform.rotation, transform.scale)

    setComponent(entity, TransformComponent, { rotation: transform.rotation })
    getMutableComponent(entity, TransformComponent).rotation.set((v) => v)

    EditorState.markModifiedScene(entity)
  }
}

const scaleObject = (entities: Entity[], scales: Vector3[], overrideScale = false) => {
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i]
    const scale = scales[i] ?? scales[0]

    const transformComponent = getComponent(entity, TransformComponent)

    if (overrideScale) {
      transformComponent.scale.copy(scale)
    } else {
      transformComponent.scale.multiply(scale)
    }

    transformComponent.scale.set(
      transformComponent.scale.x === 0 ? Number.EPSILON : transformComponent.scale.x,
      transformComponent.scale.y === 0 ? Number.EPSILON : transformComponent.scale.y,
      transformComponent.scale.z === 0 ? Number.EPSILON : transformComponent.scale.z
    )

    setComponent(entity, TransformComponent, { scale: transformComponent.scale })
    getMutableComponent(entity, TransformComponent).scale.set((v) => v)

    EditorState.markModifiedScene(entity)
  }
}

const reparentObject = (
  entities: Entity[],
  beforeEntity?: Entity | null,
  afterEntity?: Entity | null,
  parent = getState(EditorState).rootEntity
) => {
  // todo - use index of beforeEntity and afterEntity to insert at correct position
  for (const entity of entities) {
    if (hasComponent(entity, SceneComponent)) continue
    if (entity === parent) continue
    const parentTree = getComponent(parent, EntityTreeComponent)
    const index = afterEntity
      ? parentTree.children.indexOf(afterEntity) + 1
      : beforeEntity
      ? parentTree.children.indexOf(beforeEntity)
      : undefined
    setComponent(entity, EntityTreeComponent, { parentEntity: parent, childIndex: index })
    /** @todo handle the entity changing sources */
    EditorState.markModifiedScene(entity)
  }
}

/** @todo - grouping currently doesnt take into account parentEntity or beforeEntity */
const groupObjects = (entities: Entity[]) => {
  /**
   * @todo how does grouping work across multiple sources?
   * - it works by modifying both sources
   */
  const firstEntity = entities[0]
  if (hasComponent(firstEntity, SceneComponent)) return
  const parentEntity = getComponent(firstEntity, EntityTreeComponent).parentEntity
  const layer = LayerComponent.get(firstEntity)
  const newParent = createEntity(layer)
  setComponent(newParent, UUIDComponent, generateEntityUUID())
  setComponent(newParent, NameComponent, 'New Group')
  setComponent(newParent, EntityTreeComponent, { parentEntity })
  setComponent(newParent, VisibleComponent)
  setComponent(newParent, TransformComponent, { position: new Vector3(0, 0, 0) })
  const gltfEntity = getAncestorWithComponents(firstEntity, [GLTFComponent])
  const sourceID = GLTFComponent.getInstanceID(gltfEntity)
  setComponent(newParent, SourceComponent, sourceID)

  for (const entity of entities) {
    if (hasComponent(entity, SceneComponent)) continue
    setComponent(entity, EntityTreeComponent, { parentEntity: newParent })
    EditorState.markModifiedScene(entity)
  }
}

const removeObject = (entities: Entity[]) => {
  /** we have to manually set this here or it will cause react errors when entities are removed */
  getMutableState(SelectionState).selectedEntities.set([])

  for (const entity of entities) {
    if (hasComponent(entity, SceneComponent)) continue
    removeEntityNodeRecursively(entity)
    EditorState.markModifiedScene(entity)
  }
}

const replaceSelection = (entities: EntityUUID[]) => {
  const current = getMutableState(SelectionState).selectedEntities.value

  if (entities.length === current.length) {
    let same = true
    for (let i = 0; i < entities.length; i++) {
      if (!current.includes(entities[i])) {
        same = false
        break
      }
    }
    if (same) return
  }

  SelectionState.updateSelection(entities)
}

const toggleSelection = (entities: EntityUUID[]) => {
  const selectedEntities = getMutableState(SelectionState).selectedEntities.value.slice(0)

  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i]
    const index = selectedEntities.indexOf(entity)

    if (index > -1) {
      selectedEntities.splice(index, 1)
    } else {
      selectedEntities.push(entity)
    }
  }

  SelectionState.updateSelection(selectedEntities)
}

const addToSelection = (entities: EntityUUID[]) => {
  const selectedEntities = getMutableState(SelectionState).selectedEntities.value.slice(0)

  for (let i = 0; i < entities.length; i++) {
    const object = entities[i]
    if (selectedEntities.includes(object)) continue
    selectedEntities.push(object)
  }

  SelectionState.updateSelection(entities)
}

export const EditorControlFunctions = {
  addOrRemoveComponent,
  modifyProperty,
  modifyName,
  modifyMaterial,
  createObjectFromSceneElement,
  duplicateObject,
  positionObject,
  rotateObject,
  rotateAround,
  scaleObject,
  reparentObject,
  groupObjects,
  removeObject,
  addToSelection,
  replaceSelection,
  toggleSelection,
  overwriteLookdevObject
}
