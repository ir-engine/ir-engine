import { EntityUUID, UUIDComponent } from '@etherealengine/ecs'
import { TransformComponent } from '@etherealengine/spatial'
import { GLTF } from '@gltf-transform/core'
import { Matrix4, Quaternion, Vector3 } from 'three'
import { migrateDirectionalLightUseInCSM } from '../scene/functions/migrateDirectionalLightUseInCSM'
import { migrateOldColliders } from '../scene/functions/migrateOldColliders'
import { migrateOldComponentJSONIDs } from '../scene/functions/migrateOldComponentJSONIDs'
import { migrateSceneSettings } from '../scene/functions/migrateSceneSettings'

export type ComponentJsonType = {
  name: string
  props?: any
}

export type EntityJsonType = {
  name: string | EntityUUID
  components: ComponentJsonType[]
  parent?: EntityUUID
  index?: number
}

export type SceneJsonType = {
  entities: Record<EntityUUID, EntityJsonType>
  root: EntityUUID
  version: number
}

export type SceneJSONDataType = {
  name: string
  scene: SceneJsonType
  thumbnailUrl: string
  project: string
}

export const migrateSceneJSONToGLTF = (data: SceneJsonType): GLTF.IGLTF => {
  migrateOldComponentJSONIDs(data)
  migrateSceneSettings(data)
  for (const [uuid, entityJson] of Object.entries(data.entities)) {
    migrateOldColliders(entityJson)
  }
  migrateDirectionalLightUseInCSM(data)

  return convertSceneJSONToGLTF(data)
}

export const convertSceneJSONToGLTF = (json: SceneJsonType): GLTF.IGLTF => {
  const gltf = {
    asset: {
      version: '2.0',
      generator: 'iR Engine'
    },
    scenes: [
      {
        nodes: []
      }
    ],
    scene: 0,
    nodes: [],
    extensionsUsed: []
  } as GLTF.IGLTF

  delete json.entities[json.root]

  // populate nodes
  for (const [uuid, entity] of Object.entries(json.entities)) {
    const node = {
      name: entity.name,
      extensions: {}
    } as GLTF.INode

    node.extensions![UUIDComponent.jsonID] = uuid
    if (!gltf.extensionsUsed!.includes(UUIDComponent.jsonID)) gltf.extensionsUsed!.push(UUIDComponent.jsonID)

    for (const component of entity.components) {
      if (component.name === TransformComponent.jsonID) {
        const position = new Vector3().copy(component.props.position)
        const rotation = new Quaternion().copy(component.props.rotation)
        const scale = new Vector3().copy(component.props.scale)
        const matrix = new Matrix4().compose(position, rotation, scale)
        node.matrix = matrix.toArray()
        continue
      }
      node.extensions![component.name] = component.props
      if (!gltf.extensionsUsed!.includes(component.name)) {
        gltf.extensionsUsed!.push(component.name)
      }
    }

    gltf.nodes!.push(node)
  }

  // populate parent/child relationships
  for (const [uuid, entity] of Object.entries(json.entities)) {
    if (entity.parent === json.root) {
      const nodeIndex = gltf.nodes!.findIndex((n) => n.extensions![UUIDComponent.jsonID] === uuid)!
      const childIndex = entity.index
      if (typeof childIndex === 'number') {
        gltf.scenes![0].nodes!.splice(childIndex, 0, nodeIndex)
      } else {
        gltf.scenes![0].nodes!.push(nodeIndex)
      }
    } else {
      const parentNode = gltf.nodes!.find((n) => n.extensions![UUIDComponent.jsonID] === entity.parent)!
      const nodeIndex = gltf.nodes!.findIndex((n) => n.extensions![UUIDComponent.jsonID] === uuid)
      if (!parentNode.children) parentNode.children = []
      const childIndex = entity.index
      if (typeof childIndex === 'number') {
        parentNode.children.splice(childIndex, 0, nodeIndex)
      } else {
        parentNode.children.push(nodeIndex)
      }
    }
  }

  return gltf
}
