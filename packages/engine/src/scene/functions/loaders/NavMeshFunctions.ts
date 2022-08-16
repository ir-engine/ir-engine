import { Object3D } from 'three'
import { Polygon, Vector3 } from 'yuka'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Object3DUtils } from '../../../common/functions/Object3DUtils'
import { DebugNavMeshComponent } from '../../../debug/DebugNavMeshComponent'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { NavMesh } from '../../classes/NavMesh'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { NavMeshComponent, NavMeshComponentType } from '../../components/NavMeshComponent'
import { Object3DComponent } from '../../components/Object3DComponent'

export const SCENE_COMPONENT_NAV_MESH = 'navMesh'
export const SCENE_COMPONENT_NAV_MESH_DEFAULT_VALUES: Partial<NavMeshComponentType> = { debugMode: false }

export const deserializeNavMesh: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<NavMeshComponentType>
) => {
  if (!isClient) return

  const props = parseNavMeshProperties(json.props) as NavMeshComponentType

  addComponent(entity, NavMeshComponent, props)

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_NAV_MESH)

  updateNavMesh(entity, props)
}

function parseGeometry(position: ArrayLike<number>, index?: ArrayLike<number>) {
  const vertices = new Array()
  const polygons = new Array()

  // vertices

  for (let i = 0, l = position.length; i < l; i += 3) {
    const v = new Vector3()

    v.x = position[i + 0]
    v.y = position[i + 1]
    v.z = position[i + 2]

    vertices.push(v)
  }

  // polygons

  if (index) {
    // indexed geometry

    for (let i = 0, l = index.length; i < l; i += 3) {
      const a = index[i + 0]
      const b = index[i + 1]
      const c = index[i + 2]

      const contour = [vertices[a], vertices[b], vertices[c]]

      const polygon = new Polygon().fromContour(contour)

      polygons.push(polygon)
    }
  } else {
    // non-indexed geometry //todo test

    for (let i = 0, l = vertices.length; i < l; i += 3) {
      const contour = [vertices[i + 0], vertices[i + 1], vertices[i + 2]]

      const polygon = new Polygon().fromContour(contour)

      polygons.push(polygon)
    }
  }

  return polygons
}

/** Is it possible to use code from YUKA's NavMeshLoader to load from a THREE BufferGeometry? */
function setNavMeshPolygons(navMesh: NavMesh, obj3d: Object3D) {
  const mesh = Object3DUtils.findMesh(obj3d)
  if (mesh !== null) {
    const geometry = mesh.geometry
    const position = geometry.getAttribute('position').array
    const index = geometry.getIndex()?.array
    const polygons = parseGeometry(position, index)
    // This will also clear any existing polygons
    navMesh.fromPolygons(polygons)
  }
}

export const updateNavMesh: ComponentUpdateFunction = (entity: Entity, properties: NavMeshComponentType) => {
  const navMesh = getComponent(entity, NavMeshComponent).value

  if (hasComponent(entity, Object3DComponent)) {
    const obj3d = getComponent(entity, Object3DComponent).value
    setNavMeshPolygons(navMesh, obj3d)
    if (properties.debugMode) {
      addComponent(entity, DebugNavMeshComponent, {})
    } else {
      removeComponent(entity, DebugNavMeshComponent)
    }
  }
}

export const serializeNavMesh: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, NavMeshComponent) as NavMeshComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_NAV_MESH,
    props: {}
  }
}

export const parseNavMeshProperties = (type: NavMeshComponentType): NavMeshComponentType => {
  const value = new NavMesh()
  return { ...type, value }
}
